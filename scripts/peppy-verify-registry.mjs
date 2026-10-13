#!/usr/bin/env node
/**
 * Re-verify Peppy's curated research registry against the live sources:
 *  - every PubMed entry's title/year must match NCBI esummary verbatim;
 *  - every NIH/FDA guidance URL must return HTTP 200.
 * Usage: node scripts/peppy-verify-registry.mjs   (optional NCBI_API_KEY / NCBI_EMAIL)
 * Exit code 1 on any mismatch, so it can run in CI or before editing the registry.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(
  path.join(root, "shared/peppy/research-registry.ts"),
  "utf8"
);

const entries = [];
for (const chunk of src.split(/\n  \{\n/).slice(1)) {
  const block = `\n${chunk}`;
  const get = k =>
    block.match(new RegExp(`\\n\\s+${k}: (".*?(?<!\\\\)"),?\\n`))?.[1];
  const id = get("id") && JSON.parse(get("id"));
  if (!id) continue;
  entries.push({
    id,
    title: get("title") && JSON.parse(get("title")),
    year: get("year") && JSON.parse(get("year")),
    pmid: get("pmid") && JSON.parse(get("pmid")),
    url: get("url") && JSON.parse(get("url")),
  });
}

const decode = s =>
  s
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, c) => {
      const map = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: '"',
        apos: "'",
        "#39": "'",
      };
      c = c.toLowerCase();
      if (map[c]) return map[c];
      if (c.startsWith("#x"))
        return String.fromCodePoint(parseInt(c.slice(2), 16));
      if (c.startsWith("#"))
        return String.fromCodePoint(parseInt(c.slice(1), 10));
      return m;
    })
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const extra = new URLSearchParams({ tool: "purefire-peppy" });
if (process.env.NCBI_API_KEY) extra.set("api_key", process.env.NCBI_API_KEY);
if (process.env.NCBI_EMAIL) extra.set("email", process.env.NCBI_EMAIL);

if (entries.length === 0) {
  console.error(
    "Could not parse any registry entries — has the file format changed?"
  );
  process.exit(1);
}
let failures = 0;
const pubmed = entries.filter(e => e.pmid);
for (let i = 0; i < pubmed.length; i += 100) {
  const batch = pubmed.slice(i, i + 100);
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${batch.map(e => e.pmid).join(",")}&${extra}`;
  const data = await (await fetch(url)).json();
  for (const e of batch) {
    const doc = data.result?.[e.pmid];
    const live = doc ? decode(String(doc.title ?? "")) : null;
    const liveYear = doc
      ? String(doc.pubdate ?? "").match(/\b(19|20)\d{2}\b/)?.[0]
      : null;
    if (!live) {
      console.error(`✗ ${e.id}: not found on PubMed`);
      failures++;
    } else if (live !== e.title) {
      console.error(
        `✗ ${e.id}: title differs\n    registry: ${e.title}\n    pubmed:   ${live}`
      );
      failures++;
    } else if (e.year && liveYear && e.year !== liveYear) {
      console.error(`✗ ${e.id}: year ${e.year} ≠ PubMed ${liveYear}`);
      failures++;
    } else {
      console.log(`✓ ${e.id}`);
    }
  }
}

for (const e of entries.filter(x => !x.pmid)) {
  try {
    const res = await fetch(e.url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (purefire-peppy registry check)" },
    });
    if (res.ok) console.log(`✓ ${e.id} (${res.status})`);
    else {
      console.error(`✗ ${e.id}: HTTP ${res.status} ${e.url}`);
      failures++;
    }
  } catch (err) {
    console.error(`✗ ${e.id}: ${err.message} ${e.url}`);
    failures++;
  }
}

console.log(`\n${entries.length} entries checked, ${failures} problem(s).`);
process.exit(failures ? 1 : 0);
