/**
 * Products temporarily taken off the storefront. Listed ids (or any product /
 * Firestore doc with `hidden: true` or `active: false`) are dropped from
 * listings, search, product pages, sitemap/prerender, Pepita and checkout.
 * To bring a product back, remove its id from this list and redeploy.
 */
export const HIDDEN_PRODUCT_IDS: ReadonlySet<string> = new Set([
  "femalin",
  "temero-genero",
  "trezvon",
  "olecap",
  "panaxod",
  "previn",
  "regenart",
  "gelmigon",
  // On hold (Julia, 2026-10-19): Calsil-T identity unconfirmed; Indosine formulation version unknown.
  "calsil-t",
  "indosine",
]);

export function isHiddenProduct(p: { id?: unknown; hidden?: unknown; active?: unknown } | null | undefined): boolean {
  if (!p) return false;
  if (typeof p.id === "string" && HIDDEN_PRODUCT_IDS.has(p.id)) return true;
  return p.hidden === true || p.active === false;
}

/**
 * Drop hidden products from anything that carries product suggestions (a Pepita
 * answer). Used by the answer pipeline (server and in-browser fallback) and again
 * at render time, so a hidden product can never become a link, card or add-to-cart.
 */
export function withoutHiddenProducts<
  T extends { products: ReadonlyArray<{ product: { id: string } }> },
>(value: T): T {
  const products = value.products.filter((s) => !isHiddenProduct(s?.product));
  return products.length === value.products.length ? value : { ...value, products };
}
