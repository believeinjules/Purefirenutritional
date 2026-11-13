/**
 * Store-wide commerce settings: shipping threshold and cycle bundles.
 *
 * ONE place to change these numbers. Both the browser (banners, cart, product
 * page) and the server (/api/stripe/create-checkout-session) read this file, so
 * what the shopper sees is exactly what Stripe charges.
 *
 * Current values:
 *   - free shipping at or above $150 merchandise subtotal
 *   - 20/60 products (Julia, 2026-11-10): Buy More & Save only on the 60-cap
 *     size, with 2 × 60 and 60 + 20 packs. 2 × 60 is priced at the Cerluten
 *     ratio $279 / $298.98 (~6.7% off), rounded to the nearest dollar.
 *     60 + 20 is the 60-cap price plus ceil((20-cap price) / 2) in whole dollars.
 *   - Prime Peptide (frozen): still uses 2- and 3-bottle cycle bundles at
 *     $4 / $8 off each bottle of that product's single size.
 *
 * Single-bottle prices are NOT set here. They come from Firestore `products`
 * (code catalog fallback) and are never changed by this file.
 *
 * Per-product overrides (Firestore-compatible, optional, on `products/{id}`):
 *   bundlesEnabled: false              → no bundles for that product
 *   bundleDiscountsUSD: { "2": 5, "3": 9 } → per-bottle discount for that product
 * Overrides must also stay inside BUNDLE_DISCOUNT_LIMITS_USD.
 */

export type BundleTierConfig = {
  /** Bottles in the bundle (2 or 3). */
  bottles: 2 | 3;
  /** Dollars off EACH bottle vs that product's current single-bottle price. */
  discountPerBottleUSD: number;
};

export type CommerceConfig = {
  /** Flat customer shipping when the order does not qualify for free shipping. */
  standardShippingUSD: number;
  /** Merchandise subtotal (after bundle discounts) at or above which shipping is free. */
  freeShippingThresholdUSD: number;
  bundles: {
    enabled: boolean;
    tiers: BundleTierConfig[];
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
  standardShippingUSD: 19.95,
  freeShippingThresholdUSD: 150,
  bundles: {
    enabled: true,
    tiers: [
      { bottles: 2, discountPerBottleUSD: 4 },
      { bottles: 3, discountPerBottleUSD: 8 },
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

/** Whole cents, avoiding float drift (19.95 → 1995). */
export function toCents(usd: number): number {
  return Math.round(usd * 100);
}


/**
 * Frozen 2026-11-10 reference: Cerluten's then-undiscounted 2 × 60 ($149.49 × 2)
 * and the $279 sale price Julia set. The ratio stays fixed even though Cerluten's
 * bottle prices later changed. Every 20/60 product's 2 × 60 pack is (2 × its 60-cap
 * price) times this ratio, rounded to the nearest whole dollar.
 */
export const TWO_X60_REFERENCE = { regularUSD: 298.98, saleUSD: 279 } as const;

export const STANDARD_SHIPPING_CENTS_CONFIG = toCents(COMMERCE_CONFIG.standardShippingUSD);
export const FREE_SHIPPING_THRESHOLD_CENTS_CONFIG = toCents(COMMERCE_CONFIG.freeShippingThresholdUSD);
