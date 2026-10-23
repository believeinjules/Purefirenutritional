/**
 * Shopper-facing stock line (Julia, 2026-10-23).
 *
 *  - "in_stock":      on the shelf in the US, ships now → "In stock, ships from the US"
 *  - "ships_2_weeks": ordered for the customer, still purchasable → "Usually ships in about 2 weeks"
 *
 * Where the value comes from (first match wins):
 *  1. Firestore products/{id}.fulfillment (editable in Admin → Products → "Fulfillment").
 *  2. The code default below (IN_STOCK_PRODUCT_IDS), also written by "Import catalog from code".
 *  3. "ships_2_weeks".
 * Out of stock (product `in_stock: false` or the chosen size `inStock: false`) always wins:
 * no stock line is shown and existing out-of-stock behaviour is unchanged.
 */
export const FULFILLMENT_VALUES = ["in_stock", "ships_2_weeks"] as const;
export type Fulfillment = (typeof FULFILLMENT_VALUES)[number];
export const DEFAULT_FULFILLMENT: Fulfillment = "ships_2_weeks";

/** Code default for products physically stocked in the US. */
export const IN_STOCK_PRODUCT_IDS: ReadonlySet<string> = new Set([
  "cerluten",
  "sigumir",
  // Revilab capsules (ML series + Preparation capsules). NOT the SL sublingual drops.
  "revilab-ml-01", "revilab-ml-02", "revilab-ml-03", "revilab-ml-04", "revilab-ml-05",
  "revilab-ml-06", "revilab-ml-07", "revilab-ml-08", "revilab-ml-09",
  "revilab-anti-age",
  "revilab-pro-elements",
  // Prime Peptide line
  "prime-peptide-brain", "prime-peptide-collagen", "prime-peptide-joints",
  "prime-peptide-omega", "prime-peptide-protect",
]);

export function isFulfillment(v: unknown): v is Fulfillment {
  return typeof v === "string" && (FULFILLMENT_VALUES as readonly string[]).includes(v);
}

/** Resolve a product's fulfillment: explicit value → code default → ships_2_weeks. */
export function resolveFulfillment(id: string, explicit?: unknown): Fulfillment {
  if (isFulfillment(explicit)) return explicit;
  return IN_STOCK_PRODUCT_IDS.has(id) ? "in_stock" : DEFAULT_FULFILLMENT;
}

export const FULFILLMENT_PDP_LABEL: Record<Fulfillment, string> = {
  in_stock: "In stock, ships from the US",
  ships_2_weeks: "Usually ships in about 2 weeks",
};

/** Short tag on shop cards; null = no tag (2-week items stay clean). */
export const FULFILLMENT_CARD_LABEL: Record<Fulfillment, string | null> = {
  in_stock: "In stock",
  ships_2_weeks: null,
};

export const FULFILLMENT_ADMIN_LABEL: Record<Fulfillment, string> = {
  in_stock: "In stock (ships from the US now)",
  ships_2_weeks: "Ships in about 2 weeks",
};
