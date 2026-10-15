/**
 * Liquid / drop products sold by pre-order (Julia, 2026-10-13).
 * Most stock is capsules/tablets; liquid forms are ordered per customer and ship once they
 * arrive. Products stay listed and purchasable (checkout is unchanged); the storefront shows
 * a "Pre-order" badge and PREORDER_NOTE. Edit this list in code; no Firestore changes needed.
 * Classification sources: catalog usage text ("drops", "liquid", "serum") and the
 * manufacturer's packing info (120 ml / 200 ml / 50 ml bottles).
 */
export const PREORDER_PRODUCT_IDS: ReadonlySet<string> = new Set([
  // Revilab SL: sublingual drops, 10 ml bottles
  "revilab-sl-01", "revilab-sl-02", "revilab-sl-03", "revilab-sl-04", "revilab-sl-05",
  "revilab-sl-06", "revilab-sl-07", "revilab-sl-08", "revilab-sl-09", "revilab-sl-10",
  // Drinkable liquids, 120–200 ml bottles
  "mesotel", "mesotel-neo", "mesotel-beauty", "reviplant", "alvenorm-forte", "pangluin",
  "digemax", "retisil",
  // Drops concentrate (50 ml), nasal spray + balm, topical serum
  "anti-age-nb-activity", "rinolax", "anti-wrinkle-serum-7",
]);

export const PREORDER_BADGE = "Pre-order";

export const PREORDER_NOTE =
  "Available by pre-order. Most of our stock is capsules, which keep fresh longer and make each dose easy to measure. Liquid forms are ordered for you and ship once they arrive, usually within about two extra weeks.";

export function isPreorderProduct(p: { id?: unknown; preorder?: unknown } | string | null | undefined): boolean {
  if (!p) return false;
  if (typeof p === "string") return PREORDER_PRODUCT_IDS.has(p);
  if (p.preorder === true) return true;
  return typeof p.id === "string" && PREORDER_PRODUCT_IDS.has(p.id);
}

/** Neutral cart / product-page line for pre-order items (no promised dates). */
export const PREORDER_CART_NOTE = "Pre-order: ships when restocked";
