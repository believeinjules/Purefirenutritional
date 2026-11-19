// Pings IndexNow (Bing, Yandex, Seznam, Naver…) with changed sitemap URLs.
// Usage:
//   node scripts/indexnow-ping.mjs                  -> auto-select vs previous commit
//   node scripts/indexnow-ping.mjs --all            -> every sitemap URL
//   node scripts/indexnow-ping.mjs /products/endoluten /learn
import { execSync } from "node:child_process";
import { selectIndexNowUrls, INDEXNOW_HOST, INDEXNOW_BASE, parseSitemap } from "./indexnow-select.mjs";

const HOST = INDEXNOW_HOST;
const KEY = "7edff9be610887fefa2aebbc0430ce13";
const BASE = INDEXNOW_BASE;

async function fetchSitemap(url = `${BASE}/sitemap.xml`) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch sitemap: ${res.status} ${url}`);
  return res.text();
}

function git(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function previousSha(current) {
  return git(`git rev-parse ${current}^`);
}

function changedFilesBetween(prev, current) {
  if (!prev || !current) return [];
  const out = git(`git diff --name-only ${prev}..${current}`);
  return out ? out.split("\n").filter(Boolean) : [];
}

async function postIndexNow(urlList) {
  if (!urlList.length) {
    console.log("IndexNow: nothing to submit");
    return;
  }
  for (let i = 0; i < urlList.length; i += 10000) {
    const batch = urlList.slice(i, i + 10000);
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${BASE}/${KEY}.txt`, urlList: batch }),
    });
    console.log(`IndexNow: ${res.status} for ${batch.length} URLs`);
    if (![200, 202].includes(res.status)) process.exitCode = 1;
  }
}

const args = process.argv.slice(2).filter((a) => a !== "--all");
const forceAll = process.argv.includes("--all");
const sha = process.env.INDEXNOW_SHA || git("git rev-parse HEAD") || "HEAD";

if (args.length) {
  const urlList = args.map((p) => (p.startsWith("http") ? p : BASE + (p.startsWith("/") ? p : `/${p}`)));
  await postIndexNow(urlList);
} else {
  const xml = await fetchSitemap(process.env.INDEXNOW_SITEMAP_URL || `${BASE}/sitemap.xml`);
  const currentSitemap = parseSitemap(xml);
  let previousSitemap = null;
  if (process.env.INDEXNOW_PREV_SITEMAP) previousSitemap = process.env.INDEXNOW_PREV_SITEMAP;
  const prevSha = process.env.INDEXNOW_PREV_SHA || previousSha(sha);
  const files = forceAll ? [] : changedFilesBetween(prevSha, sha);
  const selected = forceAll
    ? { urls: currentSitemap.map((e) => e.loc), reason: "forced-all", fallback: true }
    : selectIndexNowUrls({
        previousSitemap,
        currentSitemap,
        changedFiles: files,
        currentUrls: currentSitemap.map((e) => e.loc),
      });
  console.log(
    `IndexNow selection: ${selected.reason}${selected.fallback ? " (full sitemap)" : ""} — ${selected.urls.length} URL(s)` +
      (prevSha && !forceAll ? `; diff ${prevSha.slice(0, 7)}..${String(sha).slice(0, 7)}` : "")
  );
  await postIndexNow(selected.urls);
}
