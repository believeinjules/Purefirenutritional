/**
 * Bundle pricing used by BOTH the browser (display) and the server (charging).
 * The server never accepts a price from the client: the client sends only a
 * bundle kind, and the server recomputes the price from live single-bottle
 * prices (Firestore, code-catalog fallback).
 *
 * Storefront (20/60 products, Julia 2026-11-10):
 *   Buy More & Save appears only when the 60-cap size is selected.
 *   Offers:
 *     - "2x60"  — two 60-cap bottles at the Cerluten ratio $279 / $298.98
 *                 (~6.7% off), rounded to the nearest whole dollar.
 *     - "60+20" — one 60 + one 20 at (60-cap price) + ceil((20-cap price) / 2)
 *                 in whole dollars (e.g. $55 / 2 → $28; $58.99 / 2 → $30).
 *   2 × 20, 3 × 20 and 3 × 60 packs are not offered.
 *
 * Prime Peptide (frozen): 2- or 3-bottle cycle bundles of that product's
 * single size, at $4 / $8 off each bottle (COMMERCE_CONFIG.bundles.tiers),
 * still subject to the low-price and larger-size guards.
 */
import {
  BUNDLE_SIZES,
  COMMERCE_CONFIG,
  TWO_X60_REFERENCE,
  isAllowedBundleDiscount,
  toCents,
  type BundleSize,
  type CommerceConfig,
} from "./commerce-config.js";

/** Optional per-product fields (code catalog or Firestore `products/{id}`). */
export type BundleOverrideFields = {
  bundlesEnabled?: boolean;
  /** Per-bottle discount overrides keyed by bundle size, e.g. { "2": 5, "3": 9 }. Prime / legacy only. */
  bundleDiscountsUSD?: Partial<Record<"2" | "3", number | null>> | null;
};

/** A sellable size of a product (code catalog / Firestore `variants`). */
export type BundleSizeVariant = {
  id: string;
  name: string;
  priceUSD: number;
};

/** Product fields the larger-size guard and 20/60 pack math read. */
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

/** Storefront packs offered when a 20/60 product is on the 60-cap size. */
export const STOREFRONT_BUNDLES = ["2x60", "60+20"] as const;
export type StorefrontBundle = (typeof STOREFRONT_BUNDLES)[number];

/** Anything the cart / checkout may send: a storefront pack, a Prime 2/3-bottle, or 1 (single). */
export type CartBundleKind = StorefrontBundle | BundleSize;
export type ParsedBundle = 1 | CartBundleKind;

export type StorefrontBundleOffer = {
  kind: StorefrontBundle;
  /** Charged pack price, whole cents. */
  bundleCents: number;
  /** Regular price of the same bottles bought separately, whole cents. */
  regularCents: number;
  savingsCents: number;
  /** Always 2 bottles in these packs. */
  bottles: 2;
  /** Shopper-facing pack name, e.g. "60 + 20 capsules". */
  label: string;
};

/** Thrown for a bundle value the checkout does not accept (→ HTTP 400). */
export class BundleInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BundleInputError";
  }
}

function isStorefrontBundle(value: unknown): value is StorefrontBundle {
  return value === "2x60" || value === "60+20";
}

/**
 * Normalize the client's `bundle` field. Missing / 1 → 1 (single bottle).
 * Accepts storefront packs ("2x60" | "60+20") and Prime/legacy 2 or 3.
 */
export function parseCartBundle(raw: unknown): ParsedBundle {
  if (raw === undefined || raw === null || raw === "" || raw === 1 || raw === "1") return 1;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (isStorefrontBundle(s)) return s;
    if (/^\d+$/.test(s)) {
      const n = Number(s);
      if ((BUNDLE_SIZES as readonly number[]).includes(n)) return n as BundleSize;
    }
    throw new BundleInputError("Invalid bundle option");
  }
  if (typeof raw === "number" && Number.isInteger(raw) && (BUNDLE_SIZES as readonly number[]).includes(raw)) {
    return raw as BundleSize;
  }
  throw new BundleInputError("Invalid bundle option");
}

/**
 * Legacy helper: only 1, 2 or 3. Prefer `parseCartBundle` for cart/checkout.
 * Kept so existing call sites that only handle cycle-bundle sizes still typecheck.
 */
export function parseBundleSize(raw: unknown): 1 | BundleSize {
  const parsed = parseCartBundle(raw);
  if (parsed === 1 || parsed === 2 || parsed === 3) return parsed;
  throw new BundleInputError("Invalid bundle option");
}

/** Bottles represented by a parsed bundle (for cart quantity / stale-line expansion). */
export function bottlesInBundle(bundle: ParsedBundle | null | undefined): number {
  if (!bundle || bundle === 1) return 1;
  if (bundle === "2x60" || bundle === "60+20") return 2;
  return bundle;
}

/** Per-bottle discount (USD) for a legacy 2/3-bottle pack, or null when not offered. */
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
  if (override === null) return null;
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

/** 20- and 60-cap prices in cents when this product is sold in that pair; otherwise null. */
export function sizePairCents(product: BundleSizingFields): { p20: number; p60: number } | null {
  const sized = sizedVariants(product);
  const v20 = sized.find((v) => v.units === 20);
  const v60 = sized.find((v) => v.units === 60);
  if (!v20 || !v60) return null;
  return { p20: v20.cents, p60: v60.cents };
}

export function hasSizePair(product: BundleSizingFields): boolean {
  return sizePairCents(product) !== null;
}

/** Capsules per bottle for a legacy bundle's size. */
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
 * bundle's total capsules, or null when there is none. A legacy bundle must cost more.
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

/** 2 × 60 pack price: Cerluten ratio $279 / $298.98, nearest whole dollar, in cents. */
export function twoX60PriceCents(p60Cents: number): number {
  const regularCents = p60Cents * 2;
  const saleDollars = (regularCents * TWO_X60_REFERENCE.saleUSD) / toCents(TWO_X60_REFERENCE.regularUSD);
  return Math.round(saleDollars) * 100;
}

/** Extra 20 in a 60 + 20 pack: ceil((20-cap price) / 2) as whole dollars, in cents. */
export function addon20Cents(p20Cents: number): number {
  return Math.ceil(p20Cents / 200) * 100;
}

/** One storefront pack for a 20/60 product, or null if that pack is not offered. */
export function getStorefrontBundleOffer(
  product: BundleOverrideFields & BundleSizingFields,
  kind: StorefrontBundle,
  config: CommerceConfig = COMMERCE_CONFIG
): StorefrontBundleOffer | null {
  if (!config.bundles.enabled) return null;
  if (product.bundlesEnabled === false) return null;
  const pair = sizePairCents(product);
  if (!pair) return null;
  if (kind === "2x60") {
    const regularCents = pair.p60 * 2;
    const bundleCents = twoX60PriceCents(pair.p60);
    if (bundleCents <= 0 || bundleCents >= regularCents) return null;
    return {
      kind,
      bundleCents,
      regularCents,
      savingsCents: regularCents - bundleCents,
      bottles: 2,
      label: "2 × 60 capsules",
    };
  }
  const addon = addon20Cents(pair.p20);
  const regularCents = pair.p60 + pair.p20;
  const bundleCents = pair.p60 + addon;
  if (addon <= 0 || bundleCents <= pair.p60 || bundleCents >= regularCents) return null;
  return {
    kind,
    bundleCents,
    regularCents,
    savingsCents: regularCents - bundleCents,
    bottles: 2,
    label: "60 + 20 capsules",
  };
}

/** Storefront packs available for this 20/60 product (empty when it has no pair or bundles are off). */
export function getStorefrontBundleOffers(
  product: BundleOverrideFields & BundleSizingFields,
  config: CommerceConfig = COMMERCE_CONFIG
): StorefrontBundleOffer[] {
  return STOREFRONT_BUNDLES.map((kind) => getStorefrontBundleOffer(product, kind, config)).filter(
    (o): o is StorefrontBundleOffer => o !== null
  );
}

/**
 * Resolve a cart bundle against a product and selected size.
 * - 20/60 products: only "2x60" and "60+20", and only when the selected size is 60.
 *   A legacy numeric `2` with size 60 is treated as "2x60" (old carts).
 * - Single-size products (Prime Peptide): legacy 2- or 3-bottle cycle bundles.
 */
export function resolveBundleOffer(
  product: BundleOverrideFields & BundleSizingFields,
  singleBottlePriceUSD: number,
  bundle: unknown,
  options: BundleOfferOptions = {}
):
  | { kind: StorefrontBundle; offer: StorefrontBundleOffer; bottles: 2 }
  | { kind: BundleSize; offer: BundleOffer; bottles: BundleSize }
  | null {
  let parsed: ParsedBundle;
  try {
    parsed = parseCartBundle(bundle);
  } catch {
    return null;
  }
  if (parsed === 1) return null;

  const size = options.size !== undefined && options.size !== null ? String(options.size) : undefined;
  const pair = hasSizePair(product);

  if (isStorefrontBundle(parsed) || (parsed === 2 && pair && size === "60")) {
    const kind: StorefrontBundle = parsed === 2 ? "2x60" : parsed;
    if (pair && size && size !== "60") return null;
    const offer = getStorefrontBundleOffer(product, kind, options.config ?? COMMERCE_CONFIG);
    return offer ? { kind, offer, bottles: 2 } : null;
  }

  if ((parsed === 2 || parsed === 3) && !pair) {
    const offer = getBundleOffer(product, singleBottlePriceUSD, parsed, options);
    return offer ? { kind: parsed, offer, bottles: parsed } : null;
  }
  return null;
}

/** Shopper-facing label for a pack, e.g. "60 + 20 capsules" or "3-bottle bundle". */
export function bundleLabel(bundle: ParsedBundle | number | string): string {
  if (bundle === "2x60") return "2 × 60 capsules";
  if (bundle === "60+20") return "60 + 20 capsules";
  if (bundle === 2 || bundle === 3 || bundle === "2" || bundle === "3") return `${bundle}-bottle bundle`;
  return "Bundle";
}

/** Cart / checkout line title, e.g. "Cerluten 60 + 20 capsules". */
export function bundleLineTitle(productName: string, bundle: ParsedBundle | number | string): string {
  if (bundle === "60+20") return `${productName} 60 + 20 capsules`;
  if (bundle === "2x60") return `${productName} — 2 × 60 capsules`;
  if (bundle === 2 || bundle === 3 || bundle === "2" || bundle === "3") {
    return `${productName} — ${bundleLabel(bundle)}`;
  }
  return productName;
}

/** One legacy 2/3-bottle offer for a product at a given single-bottle price, or null. */
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
  if (bottleCents < Math.ceil(singleBottleCents * config.bundles.minDiscountedShareOfPrice)) return null;
  if (bottleCents <= 0) return null;
  const bundleCents = bottleCents * bottles;
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

/** All legacy 2/3-bottle offers available for a product at a given single-bottle price. */
export function getBundleOffers(
  product: BundleOverrideFields & BundleSizingFields,
  singleBottlePriceUSD: number,
  options: BundleOfferOptions = {}
): BundleOffer[] {
  return BUNDLE_SIZES.map((b) => getBundleOffer(product, singleBottlePriceUSD, b, options)).filter(
    (o): o is BundleOffer => o !== null
  );
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
