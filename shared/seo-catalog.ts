/**
 * Build-time product catalog for prerendering + sitemap (used by prerender.mjs
 * through the SSR bundle; never shipped to the browser).
 *
 * Mirrors what shoppers and checkout see: Firestore `products` is the live
 * source, the code catalog (client/src/data/products.ts) is the fallback for
 * anything missing or malformed — the same rule as api/_lib/catalog.ts
 * (`firestoreDocToPriceable` is reused so a doc checkout would reject is
 * never used here either). Firestore is read through the public REST API
 * (the `products` collection is world-readable), so no credentials are needed
 * at build time. Any failure falls back to the code catalog.
 */
import { products as codeProducts } from "../client/src/data/products.js";
import { firestoreDocToPriceable } from "../api/_lib/catalog.js";
import type { SeoProduct, SeoVariant } from "../client/src/lib/seo/index.js";

export type SeoCatalogEntry = {
  product: SeoProduct;
  /** ISO timestamp of the last Firestore update, when known. */
  updatedAt?: string;
  source: "firestore" | "code";
};

export type SeoCatalogResult = {
  entries: SeoCatalogEntry[];
  live: boolean;
  note: string;
};

type FirestoreValue = {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  stringValue?: string;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
  [key: string]: unknown;
};

type FirestoreDoc = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  updateTime?: string;
};

/** Decode a Firestore REST value into plain JSON. */
export function decodeFirestoreValue(v: FirestoreValue | undefined): unknown {
  if (!v || typeof v !== "object") return undefined;
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue?.values ?? []).map(decodeFirestoreValue);
  if ("mapValue" in v) return decodeFirestoreFields(v.mapValue?.fields);
  return undefined;
}

export function decodeFirestoreFields(
  fields: Record<string, FirestoreValue> | undefined
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields ?? {})) out[k] = decodeFirestoreValue(v);
  return out;
}

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v : undefined;

/**
 * Combine a Firestore doc with its code-catalog entry. Prices / variants come
 * from the doc exactly as checkout reads them; display fields fall back to code.
 * Returns null when the doc is unusable for checkout (caller uses code instead).
 */
export function mergeFirestoreProduct(
  id: string,
  data: Record<string, unknown>,
  code: SeoProduct | undefined
): SeoProduct | null {
  const priceable = firestoreDocToPriceable(id, data);
  if (!priceable) return null;

  const rawVariants = Array.isArray(data.variants) ? (data.variants as Record<string, unknown>[]) : [];
  const variants: SeoVariant[] = (priceable.variants ?? []).map((v) => {
    const raw = rawVariants.find((r) => r && r.id === v.id) ?? {};
    const codeVariant = code?.variants?.find((cv) => cv.id === v.id);
    return {
      id: v.id,
      name: v.name,
      priceUSD: v.priceUSD,
      inStock: v.inStock !== false,
      image: v.image ?? codeVariant?.image ?? null,
      images: Array.isArray(raw.images)
        ? (raw.images as unknown[]).filter((x): x is string => typeof x === "string")
        : codeVariant?.images ?? null,
    };
  });

  return {
    id,
    name: priceable.name,
    description: str(data.description) ?? code?.description ?? "",
    category: str(data.category) ?? code?.category ?? null,
    priceUSD: priceable.priceUSD,
    image: priceable.image ?? code?.image ?? null,
    images: Array.isArray(data.images)
      ? (data.images as unknown[]).filter((x): x is string => typeof x === "string")
      : code?.images ?? null,
    imageAlt: str(data.imageAlt) ?? str(data.image_alt) ?? code?.imageAlt ?? null,
    in_stock: data.in_stock !== false,
    variants,
  };
}

async function fetchFirestoreProducts(projectId: string, timeoutMs: number): Promise<FirestoreDoc[]> {
  const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/(default)/documents/products`;
  const docs: FirestoreDoc[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 20; page++) {
    const url = `${base}?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`Firestore REST ${res.status} ${res.statusText}`);
    const body = (await res.json()) as { documents?: FirestoreDoc[]; nextPageToken?: string };
    docs.push(...(body.documents ?? []));
    pageToken = body.nextPageToken;
    if (!pageToken) break;
  }
  return docs;
}

function codeEntries(): SeoCatalogEntry[] {
  return codeProducts.map((p) => ({ product: p as SeoProduct, source: "code" as const }));
}

/**
 * Every product with a live product page. Order: code catalog order, then any
 * Firestore-only products (added in Admin) by id.
 */
export async function loadSeoCatalog(options?: {
  projectId?: string;
  timeoutMs?: number;
}): Promise<SeoCatalogResult> {
  const projectId = options?.projectId;
  if (!projectId) {
    return { entries: codeEntries(), live: false, note: "no Firebase project id — code catalog only" };
  }

  let docs: FirestoreDoc[];
  try {
    docs = await fetchFirestoreProducts(projectId, options?.timeoutMs ?? 10000);
  } catch (err) {
    return {
      entries: codeEntries(),
      live: false,
      note: `Firestore read failed (${(err as Error).message}) — code catalog only`,
    };
  }

  const byId = new Map<string, FirestoreDoc>();
  for (const d of docs) {
    const id = d.name.split("/").pop();
    if (id) byId.set(id, d);
  }

  const entries: SeoCatalogEntry[] = [];
  const seen = new Set<string>();
  let malformed = 0;

  for (const code of codeProducts) {
    seen.add(code.id);
    const doc = byId.get(code.id);
    const merged = doc
      ? mergeFirestoreProduct(code.id, decodeFirestoreFields(doc.fields), code as SeoProduct)
      : null;
    if (doc && !merged) malformed++;
    entries.push(
      merged
        ? { product: merged, updatedAt: doc?.updateTime, source: "firestore" }
        : { product: code as SeoProduct, source: "code" }
    );
  }

  const extraIds = Array.from(byId.keys())
    .filter((id) => !seen.has(id))
    .sort();
  for (const id of extraIds) {
    const doc = byId.get(id)!;
    const merged = mergeFirestoreProduct(id, decodeFirestoreFields(doc.fields), undefined);
    if (merged) entries.push({ product: merged, updatedAt: doc.updateTime, source: "firestore" });
    else malformed++;
  }

  return {
    entries,
    live: true,
    note: `Firestore: ${docs.length} docs, ${extraIds.length} Firestore-only, ${malformed} malformed (code fallback / skipped)`,
  };
}
