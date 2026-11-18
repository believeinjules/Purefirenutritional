// Pings IndexNow (Bing, Yandex, Seznam, Naver…) with sitemap URLs.
// Usage: node scripts/indexnow-ping.mjs            -> all sitemap URLs
//        node scripts/indexnow-ping.mjs /products/endoluten /khavinson-peptides-list
const HOST = "www.purefirenutritional.com";
const KEY = "7edff9be610887fefa2aebbc0430ce13";
const BASE = `https://${HOST}`;

async function sitemapUrls() {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
const urlList = args.length ? args.map((p) => (p.startsWith("http") ? p : BASE + p)) : await sitemapUrls();

for (let i = 0; i < urlList.length; i += 10000) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${BASE}/${KEY}.txt`, urlList: urlList.slice(i, i + 10000) }),
  });
  console.log(`IndexNow: ${res.status} for ${Math.min(10000, urlList.length - i)} URLs`);
  if (![200, 202].includes(res.status)) process.exitCode = 1;
}
