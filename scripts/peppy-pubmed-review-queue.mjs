#!/usr/bin/env node
/**
 * Monthly PubMed refresh for Pepita's research list -> REVIEW QUEUE ONLY.
 *
 * Finds papers published in the last N days (default 31) for Khavinson / peptide-bioregulator
 * terms and the topic queries in shared/peppy/topics.ts, drops anything already in the curated
 * registry or already queued, and writes them to data/peppy-review-queue.json with
 * status "pending". Nothing here edits research-registry.ts or anything users see: a person
 * reads each entry, writes the finding/limitation, and adds it to the registry by hand
 * (then runs scripts/peppy-verify-registry.mjs).
 *
 * Usage: node scripts/peppy-pubmed-review-queue.mjs [--days 31] [--dry-run]
 * Optional env: NCBI_API_KEY, NCBI_EMAIL (higher rate limit; never printed).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const days = Number(args[args.indexOf("--days") + 1]) || 31;
const dryRun = args.includes("--dry-run");
const QUEUE = path.join(root, "data/peppy-review-queue.json");
const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const auth = [
  process.env.NCBI_API_KEY ? `api_key=${encodeURIComponent(process.env.NCBI_API_KEY)}` : "",
  process.env.NCBI_EMAIL ? `email=${encodeURIComponent(process.env.NCBI_EMAIL)}` : "",
  "tool=pepita-review-queue",
].filter(Boolean).join("&");

/** Core terms (all languages; Russian-language papers are included on equal footing). */
const CORE_QUERIES = [
  "Khavinson[Author]",
  '"peptide bioregulator"[tiab] OR "peptide bioregulators"[tiab]',
  "short peptides AND (gene expression OR aging) AND (Linkova[Author] OR Khavinson[Author])",
  "epitalon OR epithalamin OR thymalin OR vilon OR pinealon OR cortagen OR bronchogen OR livagen OR pancragen OR vesugen OR cardiogen OR prostamax OR cartalax",
];

function topicQueries() {
  const src = fs.readFileSync(path.join(root, "shared/peppy/topics.ts"), "utf8");
  return [...src.matchAll(/\n\s+pubmedQuery:\s+("(?:[^"\\]|\\.)*")/g)].map(m => JSON.parse(m[1]))
    // Only bioregulator-specific topic queries; broad ones (creatine, collagen) are too noisy.
    .filter(q => /khavinson|bioregulator|epitha|thymalin|livagen|bronchogen|pancragen|vesugen|cortexin|pinealon|retinalamin|prostatilen/i.test(q) && !/adaptogen/i.test(q));
}

function knownPmids() {
  const src = fs.readFileSync(path.join(root, "shared/peppy/research-registry.ts"), "utf8");
  return new Set([...src.matchAll(/pmid: "(\d+)"/g)].map(m => m[1]));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJson(url) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    await sleep(1000 * (i + 1));
  }
  throw new Error(`NCBI request failed: ${url.split("?")[0]}`);
}

async function main() {
  const queue = fs.existsSync(QUEUE) ? JSON.parse(fs.readFileSync(QUEUE, "utf8")) : { items: [] };
  const seen = new Set([...knownPmids(), ...queue.items.map(i => i.pmid)]);
  const found = new Map();
  for (const q of [...CORE_QUERIES, ...topicQueries()]) {
    const r = await getJson(
      `${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&retmax=50&datetype=edat&reldate=${days}&term=${encodeURIComponent(q)}&${auth}`
    );
    for (const id of r.esearchresult?.idlist ?? []) {
      if (seen.has(id)) continue;
      if (!found.has(id)) found.set(id, []);
      found.get(id).push(q);
    }
    await sleep(process.env.NCBI_API_KEY ? 120 : 400);
  }
  const ids = [...found.keys()];
  const added = [];
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const s = await getJson(`${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${chunk.join(",")}&${auth}`);
    for (const id of chunk) {
      const d = s.result?.[id];
      if (!d) continue;
      const authors = (d.authors ?? []).map(a => a.name);
      added.push({
        pmid: id,
        title: d.title,
        authors: authors.slice(0, 3).join(", ") + (authors.length > 3 ? ", et al." : ""),
        journal: d.fulljournalname,
        year: (d.pubdate ?? "").slice(0, 4),
        languages: d.lang ?? [],
        pubTypes: d.pubtype ?? [],
        doi: (d.articleids ?? []).find(a => a.idtype === "doi")?.value,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        matchedQueries: found.get(id),
        foundOn: new Date().toISOString().slice(0, 10),
        status: "pending", // pending -> approved (added to registry by hand) | rejected
        reviewerNote: "",
      });
    }
    await sleep(400);
  }
  console.log(`Checked last ${days} days: ${added.length} new paper(s) for review.`);
  for (const a of added) console.log(`- ${a.pmid} ${a.year} ${a.journal} | ${a.title}`);
  if (dryRun || added.length === 0) return;
  queue.items.push(...added);
  queue.updated = new Date().toISOString();
  fs.mkdirSync(path.dirname(QUEUE), { recursive: true });
  fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2) + "\n");
  console.log(`Queued in ${path.relative(root, QUEUE)} (status "pending"; nothing published).`);
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
