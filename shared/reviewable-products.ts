/**
 * Products a customer can review on /review: every visible, sold product.
 * Shared by the browser form and POST /api/reviews (relative imports only,
 * so the serverless bundle can resolve it).
 */
import { products as catalog } from "../client/src/data/products.js";

/** Discontinued products (vercel.json redirects them to /products). */
const DISCONTINUED = new Set(["femalin", "temero-genero", "trezvon", "olecap", "panaxod", "previn", "regenart", "gelmigon", "calsil-t", "indosine"]);

/** `catalog` already drops hidden products (shared/hidden-products.ts). */
export function reviewableProducts(): Array<{ id: string; name: string }> {
  return catalog
    .filter((p) => !DISCONTINUED.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function findReviewableProduct(id: string | undefined) {
  if (!id) return undefined;
  return reviewableProducts().find((p) => p.id === id);
}

export const isReviewableProduct = (id: string) => !!findReviewableProduct(id);
