/**
 * Store-wide commerce settings: shipping threshold and cycle bundles.
 *
 * ONE place to change these numbers. Both the browser (banners, cart, product
 * page) and the server (/api/stripe/create-checkout-session) read this file, so
 * what the shopper sees is exactly what Stripe charges.
 *
 * Current values (2026-11-20 price update):
 *   - flat $11.98 shipping, free at or above $155 merchandise subtotal
 *   - Every product with deals (Julia, 2026-11-20): 2 bottles at 4.4% off and
 *     3 bottles at 8% off the same bottles bought separately, rounded DOWN to a
 *     whole dollar, so the shown (floored) percent is never below 4.4% / 8%.
 *     20/60 products: 2 × 60 and 3 × 60, 60-cap size only ($180 → $344 / $496).
 *     Prime Peptide: 2 or 3 bottles of its single size ($144 → $275 / $397).
 *     The old 60 + 20 pack is retired.
 *
 * Single-bottle prices are NOT set here. They come from Firestore `products`
 * (code catalog fallback) and are never changed by this file.
 *
 * Per-product overrides (Firestore-compatible, optional, on `products/{id}`):
 *   bundlesEnabled: false              → no bundles for that product
 *   bundleDiscountsUSD: { "2": 5, "3": 9 } → per-bottle dollar discount for that
 *     product's 2/3-bottle bundle instead of the percent (none set in Firestore
 *     as of 2026-11-20). Overrides must also stay inside BUNDLE_DISCOUNT_LIMITS_USD.
 */

export type BundleTierConfig = {
  /** Bottles in the bundle (2 or 3). */
  bottles: 2 | 3;
  /** Percent off the bottles bought separately; the deal is rounded DOWN to a whole dollar. */
  percentOff: number;
};

export type SizePairPackConfig = {
  kind: "2x60" | "3x60";
  bottles: 2 | 3;
  /** Percent off the same 60-cap bottles bought separately; rounded DOWN to a whole dollar. */
  percentOff: number;
};

export type CommerceConfig = {
  /** Flat customer shipping when the order does not qualify for free shipping. */
  standardShippingUSD: number;
  /** Merchandise subtotal (after bundle discounts) at or above which shipping is free. */
  freeShippingThresholdUSD: number;
  bundles: {
    enabled: boolean;
    tiers: BundleTierConfig[];
    /** 20/60 products, 60-cap size only: percent off N × 60-cap price, rounded down to a whole dollar. */
    sizePairPacks: SizePairPackConfig[];
    /**
     * Guard for very low-priced items: a bundle is only offered when the
     * discounted bottle price stays at or above this share of the single
     * price (0.8 → never more than 20% off a bottle).
     */
    minDiscountedShareOfPrice: number;
  };
};

/** Hard limits for any bundle discount, per bottle (business rule: $3–$9). */
export const BUNDLE_DISCOUNT_LIMITS_USD = { min: 3, max: 9 } as const;

/** Bundle sizes the checkout accepts. 1 = a single bottle (no bundle). */
export const BUNDLE_SIZES = [2, 3] as const;
export type BundleSize = (typeof BUNDLE_SIZES)[number];

export const COMMERCE_CONFIG: CommerceConfig = {
  standardShippingUSD: 11.98,
  freeShippingThresholdUSD: 155,
  bundles: {
    enabled: true,
    tiers: [
      { bottles: 2, percentOff: 4.4 },
      { bottles: 3, percentOff: 8 },
    ],
    sizePairPacks: [
      { kind: "2x60", bottles: 2, percentOff: 4.4 },
      { kind: "3x60", bottles: 3, percentOff: 8 },
    ],
    minDiscountedShareOfPrice: 0.8,
  },
};

/** True when a per-bottle discount is a finite dollar amount inside the $3–$9 limits. */
export function isAllowedBundleDiscount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= BUNDLE_DISCOUNT_LIMITS_USD.min &&
    value <= BUNDLE_DISCOUNT_LIMITS_USD.max
  );
}

/** Whole cents, avoiding float drift (11.98 → 1198). */
export function toCents(usd: number): number {
  return Math.round(usd * 100);
}


/**
 * Deal price for bottles whose separate total is `regularCents`: `percentOff`
 * off, rounded DOWN to a whole dollar (integer math, percent in tenths), so the
 * saving is always at least `percentOff`. $360 at 4.4% → $344; $540 at 8% → $496.
 */
export function dealPriceCents(regularCents: number, percentOff: number): number {
  const keepTenthsOfPercent = 1000 - Math.round(percentOff * 10);
  return Math.floor((Math.round(regularCents) * keepTenthsOfPercent) / 100000) * 100;
}

export const STANDARD_SHIPPING_CENTS_CONFIG = toCents(COMMERCE_CONFIG.standardShippingUSD);
export const FREE_SHIPPING_THRESHOLD_CENTS_CONFIG = toCents(COMMERCE_CONFIG.freeShippingThresholdUSD);
