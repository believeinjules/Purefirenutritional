/**
 * Products temporarily taken off the storefront. Listed ids (or any product /
 * Firestore doc with `hidden: true` or `active: false`) are dropped from
 * listings, search, product pages, sitemap/prerender, Peppy and checkout.
 * To bring a product back, remove its id from this list and redeploy.
 */
export const HIDDEN_PRODUCT_IDS: ReadonlySet<string> = new Set([
  "femalin",
  "temero-genero",
  "trezvon",
  "olecap",
  "previn",
  "regenart",
  "gelmigon",
]);

export function isHiddenProduct(p: { id?: unknown; hidden?: unknown; active?: unknown } | null | undefined): boolean {
  if (!p) return false;
  if (typeof p.id === "string" && HIDDEN_PRODUCT_IDS.has(p.id)) return true;
  return p.hidden === true || p.active === false;
}
