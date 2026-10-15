/**
 * "Similar products" for the product page, chosen by biological relevance:
 * shared tissue/system group (biologicalTarget + pdp tags in product-facts.json),
 * then shared pdp tags, then the same brand line, then the same category.
 * Only storefront (sold, non-hidden, priced) products; never the current one.
 */
import { products, type Product } from "@/data/products";
import { getProductFacts, getPdpContent } from "@shared/product-facts";

const GROUPS: Array<[string, RegExp]> = [
  ["endocrine", /adrenal|thyroid|parathyroid|pineal|neuroendocrine|hormon/i],
  ["brain", /brain|nervous|cognit|mood|memory|мозга/i],
  ["eyes", /\beyes?\b|retina|vision/i],
  ["cardio", /cardio|heart|vessel|circulation/i],
  ["immune", /immune|thymus/i],
  ["respiratory", /respir|bronch|lung|nasal|airway/i],
  ["digestive", /digest|liver|stomach|pancrea|печени|желудка|поджелуд|\bgi\b/i],
  ["musculoskeletal", /musculo|cartilage|joint|bone(?! marrow)|(?<!heart )muscle|spine|calcium/i],
  ["urinary", /urinary|kidney|bladder|мочев/i],
  ["male", /male reproductive|testes|prostate|male wellness/i],
  ["female", /female|ovar|женские/i],
  ["blood", /hematop|bone marrow|blood cell/i],
  ["skin", /skin|collagen/i],
];

function lineOf(p: Product): string {
  const code = getPdpContent(p.id)?.lineCode ?? "";
  if (/Cytomax/i.test(code)) return "cytomax";
  if (/Cytogen/i.test(code)) return "cytogen";
  const m = p.id.match(/^(revilab-ml|revilab-sl|prime-peptide|anti-age-nb|mesotel)/);
  return m ? m[1] : `cat:${p.category}`;
}

function profile(p: Product) {
  const facts = getProductFacts(p.id);
  const tags = (getPdpContent(p.id)?.tags ?? []).map((t) => t.toLowerCase());
  const text = [facts?.biologicalTarget ?? "", ...tags].join(" ");
  const male = /male reproductive|testes|prostate/i.test(text) && !/female/i.test(text);
  const groups = new Set(
    GROUPS.filter(([g, re]) => (g === "male" ? male : re.test(text))).map(([g]) => g),
  );
  return { groups, tags, line: lineOf(p) };
}

function isSold(p: Product): boolean {
  return typeof p.priceUSD === "number" && p.priceUSD > 0;
}

export function getSimilarProducts(id: string, limit = 4): Product[] {
  const current = products.find((p) => p.id === id);
  if (!current) return [];
  const me = profile(current);
  return products
    .filter((p) => p.id !== id && isSold(p))
    .map((p) => {
      const o = profile(p);
      let score = 0;
      o.groups.forEach((g) => me.groups.has(g) && (score += 10));
      o.tags.forEach((t) => me.tags.includes(t) && (score += 3));
      if (o.line === me.line) score += 2;
      if (p.category === current.category) score += 1;
      return { p, score, hasBio: Array.from(o.groups).some((g) => me.groups.has(g)) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => Number(b.hasBio) - Number(a.hasBio) || b.score - a.score || a.p.name.localeCompare(b.p.name))
    .slice(0, limit)
    .map((x) => x.p);
}
