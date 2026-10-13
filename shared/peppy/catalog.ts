/**
 * Catalog adapter for Peppy. Accepts products from Firestore (Admin SDK, server) or the
 * code catalog (client/src/data/products.ts) and exposes only claim-filtered fields.
 */
import {
  BANNED_TERMS,
  DISEASE_TERMS,
  safeBenefits,
  isCompliantProductCopy,
} from "./claims.js";
import { clampText, normalizeForMatch, splitSentences } from "./text.js";
import type { PeppyProduct } from "./types.js";

/** Minimal shape shared by products.ts entries and Firestore product docs. */
export interface RawCatalogProduct {
  id: string;
  name?: unknown;
  description?: unknown;
  category?: unknown;
  priceUSD?: unknown;
  price_usd?: unknown;
  image?: unknown;
  benefits?: unknown;
  ingredients?: unknown;
  usage?: unknown;
  variants?: unknown;
  in_stock?: unknown;
  inStock?: unknown;
  hidden?: unknown;
  active?: unknown;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  return NaN;
}

function stringList(v: unknown): string[] {
  return Array.isArray(v)
    ? v
        .filter(
          (x): x is string => typeof x === "string" && x.trim().length > 0
        )
        .map(x => x.trim())
    : [];
}

/** First 1–2 claim-compliant sentences of the catalog description. */
export function safeSummary(description: string): string {
  const sentences = splitSentences(description.replace(/®/g, "")).filter(
    s => isCompliantProductCopy(s) && !/available in|capsule|format/i.test(s)
  );
  return clampText(sentences.slice(0, 2).join(" "), 260);
}

function safeUsage(v: unknown): string | undefined {
  if (typeof v !== "string" || !v.trim()) return undefined;
  const kept = splitSentences(v).filter(
    s => !DISEASE_TERMS.test(s) && !BANNED_TERMS.test(s)
  );
  return kept.length ? clampText(kept.join(" "), 300) : undefined;
}

export function toPeppyProduct(raw: RawCatalogProduct): PeppyProduct | null {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!raw.id || !name) return null;
  if (raw.hidden === true || raw.active === false) return null;
  const variants = Array.isArray(raw.variants)
    ? (raw.variants as Record<string, unknown>[])
    : [];
  const firstVariant =
    variants.find(v => v && v.inStock !== false) ?? variants[0];
  let price = toNumber(raw.priceUSD ?? raw.price_usd);
  if (!(price > 0) && firstVariant)
    price = toNumber(firstVariant.priceUSD ?? firstVariant.price_usd);
  if (!(price > 0)) return null;
  const inStock =
    raw.inStock === false || raw.in_stock === false
      ? false
      : variants.length > 0
        ? variants.some(v => v && v.inStock !== false)
        : true;
  return {
    id: raw.id,
    name,
    priceUSD: Math.round(price * 100) / 100,
    image: typeof raw.image === "string" && raw.image ? raw.image : undefined,
    category: typeof raw.category === "string" ? raw.category : "",
    benefits: safeBenefits(stringList(raw.benefits)),
    ingredients: stringList(raw.ingredients).slice(0, 12),
    summary: safeSummary(
      typeof raw.description === "string" ? raw.description : ""
    ),
    usage: safeUsage(raw.usage),
    inStock,
  };
}

export function buildCatalog(
  raws: readonly RawCatalogProduct[]
): Map<string, PeppyProduct> {
  const map = new Map<string, PeppyProduct>();
  for (const raw of raws) {
    const p = toPeppyProduct(raw);
    if (p) map.set(p.id, p);
  }
  return map;
}

/**
 * Merge Firestore products over the code catalog: Firestore wins field-by-field for
 * products it has; code products fill the gaps (same precedence as the storefront).
 */
export function mergeCatalog(
  code: readonly RawCatalogProduct[],
  firestore: readonly RawCatalogProduct[]
): Map<string, PeppyProduct> {
  const byId = new Map<string, RawCatalogProduct>();
  for (const p of code) byId.set(p.id, p);
  for (const p of firestore)
    byId.set(p.id, { ...(byId.get(p.id) ?? {}), ...p, id: p.id });
  return buildCatalog(Array.from(byId.values()));
}

/** Catalog products whose name appears in the text ("Endoluten", "revilab ml 03"). */
export function findMentionedProducts(
  text: string,
  catalog: Map<string, PeppyProduct>
): PeppyProduct[] {
  const t = ` ${normalizeForMatch(text).replace(/[^a-z0-9№ ]+/g, " ")} `;
  const hits: { p: PeppyProduct; at: number; len: number }[] = [];
  for (const p of Array.from(catalog.values())) {
    const name = normalizeForMatch(p.name)
      .replace(/[^a-z0-9№ ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const variants = new Set([
      name,
      name.replace(/\s+/g, ""),
      p.id.replace(/-/g, " "),
    ]);
    // Common alternate spellings
    if (p.id === "thyreogen") variants.add("tyreogen");
    for (const v of Array.from(variants)) {
      if (v.length < 4) continue;
      const at = t.indexOf(` ${v} `);
      if (at >= 0) {
        hits.push({ p, at, len: v.length });
        break;
      }
    }
  }
  // Prefer longer (more specific) names, then order of appearance.
  hits.sort((a, b) => b.len - a.len || a.at - b.at);
  const seen = new Set<string>();
  return hits
    .filter(h => (seen.has(h.p.id) ? false : (seen.add(h.p.id), true)))
    .map(h => h.p);
}

/** Simple keyword overlap score used to widen LLM candidate products. */
export function keywordScore(product: PeppyProduct, words: string[]): number {
  if (words.length === 0) return 0;
  const hay = normalizeForMatch(
    [
      product.name,
      product.summary,
      ...product.benefits,
      ...product.ingredients,
    ].join(" ")
  );
  return words.reduce(
    (n, w) => (w.length > 3 && hay.includes(w) ? n + 1 : n),
    0
  );
}
