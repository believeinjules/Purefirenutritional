/**
 * Shopper-facing stock line (Julia, 2026-10-23; all variants in stock, 2026-11-18).
 *
 *  - "in_stock":      on the shelf in the U.S., ships now → "In stock, ships from the U.S."
 *  - "ships_2_weeks": ordered for the customer, still purchasable → "Usually ships in about 2 weeks"
 *
 * Where the value comes from (first match wins):
 *  1. Firestore products/{id}.fulfillment (editable in Admin → Products → "Fulfillment").
 *  2. The code default below (in_stock as of 2026-11-18: Julia confirmed every
 *     variant is in stock and ships now). Also written by "Import catalog from code".
 * Out of stock (product `in_stock: false` or the chosen size `inStock: false`) always wins:
 * no stock line is shown and existing out-of-stock behaviour is unchanged.
 */
export const FULFILLMENT_VALUES = ["in_stock", "ships_2_weeks"] as const;
export type Fulfillment = (typeof FULFILLMENT_VALUES)[number];
export const DEFAULT_FULFILLMENT: Fulfillment = "in_stock";

export function isFulfillment(v: unknown): v is Fulfillment {
  return typeof v === "string" && (FULFILLMENT_VALUES as readonly string[]).includes(v);
}

/** Resolve a product's fulfillment: explicit value → code default (in_stock). */
export function resolveFulfillment(_id: string, explicit?: unknown): Fulfillment {
  if (isFulfillment(explicit)) return explicit;
  return DEFAULT_FULFILLMENT;
}

export const FULFILLMENT_PDP_LABEL: Record<Fulfillment, string> = {
  in_stock: "In stock, ships from the U.S.",
  ships_2_weeks: "Usually ships in about 2 weeks",
};

/** Short tag on shop cards; null = no tag (2-week items stay clean). */
export const FULFILLMENT_CARD_LABEL: Record<Fulfillment, string | null> = {
  in_stock: "In stock",
  ships_2_weeks: null,
};

export const FULFILLMENT_ADMIN_LABEL: Record<Fulfillment, string> = {
  in_stock: "In stock (ships from the U.S. now)",
  ships_2_weeks: "Ships in about 2 weeks",
};
