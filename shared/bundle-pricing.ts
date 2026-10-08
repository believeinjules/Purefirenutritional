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
 *
 * A bundle is NOT offered (hidden, never repriced) when:
 *   - the discount is outside the allowed range or switched off, or
 *   - low-price guard: a bottle would be more than (1 − minDiscountedShareOfPrice) off, or
 *   - larger-size guard: bundleCents ≤ the single price of a LARGER size of the
 *     same product whose capsule count is ≤ the bundle's total capsules
 *     (e.g. 3 × 20 caps = 60 caps must cost more than one 60-cap bottle).
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

/** A sellable size of a product (code catalog / Firestore `variants`). */
export type BundleSizeVariant = {
  id: string;
  name: string;
  priceUSD: number;
};

/** Product fields the larger-size guard reads. */
export type BundleSizingFields = {
  variants?: BundleSizeVariant[] | null;
};

export type BundleOfferOptions = {
  /** Cart size of the bottles in the bundle ("20" | "60"); inferred from the price when missing. */
  size?: string | null;
  config?: CommerceConfig;
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

/** Capsules (or tablets) per bottle for a size variant, e.g. "60-count" / "60 Capsules" → 60. */
export function unitsPerBottle(variant: { id: string; name: string }): number | undefined {
  const byId = /^(\d+)-count$/.exec(variant.id || "");
  if (byId) return Number(byId[1]);
  const byName = /\b(\d+)\s*(?:caps|capsules|tablets|count)\b/i.exec(variant.name || "");
  return byName ? Number(byName[1]) : undefined;
}

function sizedVariants(product: BundleSizingFields): Array<{ units: number; cents: number }> {
  const out: Array<{ units: number; cents: number }> = [];
  for (const v of product.variants ?? []) {
    const units = unitsPerBottle(v);
    if (!units || !(typeof v.priceUSD === "number" && Number.isFinite(v.priceUSD) && v.priceUSD > 0)) continue;
    out.push({ units, cents: toCents(v.priceUSD) });
  }
  return out;
}

/** Capsules per bottle for the bundle's size: from `size`, else the variant at this price, else the smallest. */
function bundleUnitsPerBottle(
  sized: Array<{ units: number; cents: number }>,
  singleBottleCents: number,
  size?: string | null
): number | undefined {
  if (size !== undefined && size !== null && /^\d+$/.test(String(size))) return Number(size);
  if (sized.length === 0) return undefined;
  const atPrice = sized.filter((v) => v.cents === singleBottleCents).sort((a, b) => a.units - b.units)[0];
  if (atPrice) return atPrice.units;
  return sized.slice().sort((a, b) => a.units - b.units)[0].units;
}

/**
 * Highest single price (cents) among LARGER sizes whose capsule count is ≤ the
 * bundle's total capsules, or null when there is none. A bundle must cost more.
 */
export function largerSizeFloorCents(
  product: BundleSizingFields,
  singleBottlePriceUSD: number,
  bottles: number,
  size?: string | null
): number | null {
  const sized = sizedVariants(product);
  if (sized.length === 0) return null;
  const per = bundleUnitsPerBottle(sized, toCents(singleBottlePriceUSD), size);
  if (!per) return null;
  const total = per * bottles;
  const larger = sized.filter((v) => v.units > per && v.units <= total);
  if (larger.length === 0) return null;
  return Math.max(...larger.map((v) => v.cents));
}

/** One bundle offer for a product at a given single-bottle price, or null (= not offered). */
export function getBundleOffer(
  product: BundleOverrideFields & BundleSizingFields,
  singleBottlePriceUSD: number,
  bottles: BundleSize,
  options: BundleOfferOptions = {}
): BundleOffer | null {
  const config = options.config ?? COMMERCE_CONFIG;
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
  const bundleCents = bottleCents * bottles;
  // Larger-size guard: never cheaper than (or equal to) a bigger bottle with ≤ the same capsules.
  const floor = largerSizeFloorCents(product, singleBottlePriceUSD, bottles, options.size);
  if (floor !== null && bundleCents <= floor) return null;
  return {
    bottles,
    discountPerBottleCents,
    singleBottleCents,
    bottleCents,
    bundleCents,
    savingsCents: discountPerBottleCents * bottles,
  };
}

/** All bundle offers available for a product at a given single-bottle price. */
export function getBundleOffers(
  product: BundleOverrideFields & BundleSizingFields,
  singleBottlePriceUSD: number,
  options: BundleOfferOptions = {}
): BundleOffer[] {
  return BUNDLE_SIZES.map((b) => getBundleOffer(product, singleBottlePriceUSD, b, options)).filter(
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
