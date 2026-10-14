/**
 * Products temporarily taken off the storefront. Listed ids (or any product /
 * Firestore doc with `hidden: true` or `active: false`) are dropped from
 * listings, search, product pages, sitemap/prerender, Pepita and checkout.
 * To bring a product back, remove its id from this list and redeploy.
 */
/**
 * New products drafted but not launched: hidden like the rest until their missing
 * store data arrives. Their verified label data is still built into Pepita's
 * product-data.json so they are ready the moment they go live.
 *   sigumir — TODO(Julia): needs priceUSD/priceEUR and a product image.
 */
export const PENDING_PRODUCT_IDS: ReadonlySet<string> = new Set(["sigumir"]);

export const HIDDEN_PRODUCT_IDS: ReadonlySet<string> = new Set([
  ...Array.from(PENDING_PRODUCT_IDS),
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
