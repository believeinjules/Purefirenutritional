/**
 * Cycle-bundle pricing (2 or 3 bottles of the same product and size).
 *
 * Pure helpers used by BOTH the browser (display) and the server (charging).
 * The server never accepts a price from the client: the client sends only the
 * bundle size (2 | 3), and the server recomputes everything from the live
 * single-bottle price + COMMERCE_CONFIG (+ optional per-product overrides).
 *
 * Math, all in whole cents:
 *   bottleCents = singleBottleCents − discountPerBottleCents
 *   bundleCents = bottleCents × bottles
 */
import {
  BUNDLE_SIZES,
  COMMERCE_CONFIG,
  isAllowedBundleDiscount,
  toCents,
  type BundleSize,
  type CommerceConfig,
} from "./commerce-config.js";

/** Optional per-product fields (code catalog or Firestore `products/{id}`). */
export type BundleOverrideFields = {
  bundlesEnabled?: boolean;
  /** Per-bottle discount overrides keyed by bundle size, e.g. { "2": 5, "3": 9 }. */
  bundleDiscountsUSD?: Partial<Record<"2" | "3", number | null>> | null;
};

export type BundleOffer = {
  bottles: BundleSize;
  discountPerBottleCents: number;
  singleBottleCents: number;
  bottleCents: number;
  bundleCents: number;
  savingsCents: number;
};

/** Thrown for a bundle value the checkout does not accept (→ HTTP 400). */
export class BundleInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BundleInputError";
  }
}

/**
 * Normalize the client's `bundle` field. Missing / 1 → 1 (single bottle).
 * Only exact 2 or 3 (number or numeric string) are accepted; anything else throws.
 */
export function parseBundleSize(raw: unknown): 1 | BundleSize {
  if (raw === undefined || raw === null || raw === "" || raw === 1 || raw === "1") return 1;
  const n = typeof raw === "string" && /^\d+$/.test(raw.trim()) ? Number(raw.trim()) : raw;
  if (typeof n === "number" && Number.isInteger(n) && (BUNDLE_SIZES as readonly number[]).includes(n)) {
    return n as BundleSize;
  }
  throw new BundleInputError("Invalid bundle option");
}

/** Per-bottle discount (USD) for a bundle size on this product, or null when not offered. */
export function bundleDiscountUSD(
  product: BundleOverrideFields,
  bottles: BundleSize,
  config: CommerceConfig = COMMERCE_CONFIG
): number | null {
  if (!config.bundles.enabled) return null;
  if (product.bundlesEnabled === false) return null;
  const tier = config.bundles.tiers.find((t) => t.bottles === bottles);
  if (!tier) return null;
  const override = product.bundleDiscountsUSD?.[String(bottles) as "2" | "3"];
  if (override === null) return null; // explicitly switched off for this size
  const discount = override === undefined ? tier.discountPerBottleUSD : override;
  return isAllowedBundleDiscount(discount) ? discount : null;
}

/** One bundle offer for a product at a given single-bottle price, or null. */
export function getBundleOffer(
  product: BundleOverrideFields,
  singleBottlePriceUSD: number,
  bottles: BundleSize,
  config: CommerceConfig = COMMERCE_CONFIG
): BundleOffer | null {
  if (!(typeof singleBottlePriceUSD === "number" && Number.isFinite(singleBottlePriceUSD))) return null;
  const singleBottleCents = toCents(singleBottlePriceUSD);
  if (singleBottleCents <= 0) return null;
  const discount = bundleDiscountUSD(product, bottles, config);
  if (discount === null) return null;
  const discountPerBottleCents = toCents(discount);
  const bottleCents = singleBottleCents - discountPerBottleCents;
  // Low-price guard: never more than (1 − share) off a bottle.
  if (bottleCents < Math.ceil(singleBottleCents * config.bundles.minDiscountedShareOfPrice)) return null;
  if (bottleCents <= 0) return null;
  return {
    bottles,
    discountPerBottleCents,
    singleBottleCents,
    bottleCents,
    bundleCents: bottleCents * bottles,
    savingsCents: discountPerBottleCents * bottles,
  };
}

/** All bundle offers available for a product at a given single-bottle price. */
export function getBundleOffers(
  product: BundleOverrideFields,
  singleBottlePriceUSD: number,
  config: CommerceConfig = COMMERCE_CONFIG
): BundleOffer[] {
  return BUNDLE_SIZES.map((b) => getBundleOffer(product, singleBottlePriceUSD, b, config)).filter(
    (o): o is BundleOffer => o !== null
  );
}

/** Shopper-facing label, e.g. "3-bottle bundle". */
export function bundleLabel(bottles: number): string {
  return `${bottles}-bottle bundle`;
}

/** Read override fields from an untrusted doc (Firestore / API JSON). */
export function readBundleOverrides(data: Record<string, unknown> | undefined): BundleOverrideFields {
  if (!data) return {};
  const out: BundleOverrideFields = {};
  if (data.bundlesEnabled === false) out.bundlesEnabled = false;
  const raw = data.bundleDiscountsUSD;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const r = raw as Record<string, unknown>;
    const discounts: Partial<Record<"2" | "3", number | null>> = {};
    for (const key of ["2", "3"] as const) {
      if (r[key] === null) discounts[key] = null;
      else if (typeof r[key] === "number") discounts[key] = r[key] as number;
    }
    if (Object.keys(discounts).length > 0) out.bundleDiscountsUSD = discounts;
  }
  return out;
}
