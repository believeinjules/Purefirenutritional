import { describe, expect, it } from "vitest";
import {
  BUNDLE_DISCOUNT_LIMITS_USD,
  COMMERCE_CONFIG,
  dealPriceCents,
  isAllowedBundleDiscount,
  type CommerceConfig,
} from "./commerce-config";
import {
  BundleInputError,
  getBundleOffer,
  getBundleOffers,
  getStorefrontBundleOffer,
  largerSizeFloorCents,
  parseBundleSize,
  parseCartBundle,
  readBundleOverrides,
  unitsPerBottle,
} from "./bundle-pricing";
import { products } from "../client/src/data/products";
import {
  CheckoutValidationError,
  getCartLineUnitUSD,
  resolveCheckoutLine,
  resolveCheckoutLinesWith,
  type PriceableProduct,
} from "./product-prices";
import { buildCheckoutSessionParams } from "../api/_lib/checkout-session";

const cytomax: PriceableProduct = {
  id: "vladonix",
  name: "Vladonix",
  priceUSD: 58.99,
  variants: [
    { id: "20-count", name: "20 Capsules", priceUSD: 58.99 },
    { id: "60-count", name: "60 Capsules", priceUSD: 153.99 },
  ],
};

/** One size only, so the larger-size guard does not apply (pure math checks). */
const singleSize: PriceableProduct = { id: "single-size", name: "Single size", priceUSD: 58.99 };

describe("commerce config", () => {
  it("uses the 2026-11-20 bundle discounts (4.4% / 8%); dollar overrides stay inside $3–$9", () => {
    const tiers = COMMERCE_CONFIG.bundles.tiers;
    expect(tiers.find((t) => t.bottles === 2)?.percentOff).toBe(4.4);
    expect(tiers.find((t) => t.bottles === 3)?.percentOff).toBe(8);
    expect(BUNDLE_DISCOUNT_LIMITS_USD).toEqual({ min: 3, max: 9 });
  });

  it("prices 20/60 packs at 4.4% (2 × 60) and 8% (3 × 60) off", () => {
    expect(COMMERCE_CONFIG.bundles.sizePairPacks).toEqual([
      { kind: "2x60", bottles: 2, percentOff: 4.4 },
      { kind: "3x60", bottles: 3, percentOff: 8 },
    ]);
  });

  it("rounds every deal DOWN to a whole dollar so the saving is at least the percent", () => {
    expect(dealPriceCents(36000, 4.4)).toBe(34400);
    expect(dealPriceCents(54000, 8)).toBe(49600);
    expect(dealPriceCents(28800, 4.4)).toBe(27500);
    expect(dealPriceCents(43200, 8)).toBe(39700);
    for (let regular = 100; regular <= 200000; regular += 137) {
      for (const pct of [4.4, 8]) {
        const deal = dealPriceCents(regular, pct);
        expect(deal % 100).toBe(0);
        expect((regular - deal) * 1000).toBeGreaterThanOrEqual(regular * pct * 10 - 1e-6);
      }
    }
  });

  it("rejects discounts outside $3–$9", () => {
    expect(isAllowedBundleDiscount(2.99)).toBe(false);
    expect(isAllowedBundleDiscount(9.01)).toBe(false);
    expect(isAllowedBundleDiscount(NaN)).toBe(false);
    expect(isAllowedBundleDiscount("5")).toBe(false);
    expect(isAllowedBundleDiscount(3)).toBe(true);
    expect(isAllowedBundleDiscount(9)).toBe(true);
  });
});

describe("bundle price math (cents)", () => {
  it("2 bottles = 4.4% off 2 × price, rounded down to a whole dollar", () => {
    const offer = getBundleOffer(cytomax, 58.99, 2)!;
    expect(offer.bundleCents).toBe(11200); // $117.98 × 0.956 = $112.79 → $112
    expect(offer.savingsCents).toBe(598);
  });

  it("3 bottles = 8% off 3 × price, rounded down to a whole dollar", () => {
    const offer = getBundleOffer(singleSize, 58.99, 3)!;
    expect(offer.bundleCents).toBe(16200); // $176.97 × 0.92 = $162.81 → $162
    expect(offer.savingsCents).toBe(1497);
  });

  it("Prime Peptide 2026-11-20 bundle prices", () => {
    const prime = (id: string) => products.find((p) => p.id === id)! as PriceableProduct;
    const totals = (id: string) => {
      const p = prime(id);
      return [p.priceUSD, getCartLineUnitUSD(p, undefined, 2), getCartLineUnitUSD(p, undefined, 3)];
    };
    expect(totals("prime-peptide-collagen")).toEqual([144, 275, 397]);
    expect(totals("prime-peptide-omega")).toEqual([144, 275, 397]);
    expect(totals("prime-peptide-brain")).toEqual([162, 309, 447]);
    expect(totals("prime-peptide-joints")).toEqual([189, 361, 521]);
    expect(totals("prime-peptide-protect")).toEqual([189, 361, 521]);
  });

  it("applies to the 60-count price too (discount per bottle of that size)", () => {
    expect(getBundleOffer(cytomax, 153.99, 3)!.bundleCents).toBe(42500); // $461.97 × 0.92 = $425.01 → $425
  });

  it("does not offer bundles that would take more than 20% off a low-priced bottle", () => {
    // Rounding down to a whole dollar can take a big share off a tiny price.
    expect(getBundleOffer({}, 2, 2)).toBeNull(); // $4 → $3 is 25% off
    expect(getBundleOffer({}, 3, 2)!.bundleCents).toBe(500); // $6 → $5 (16.7%)
    expect(getBundleOffer({}, 1, 3)).toBeNull(); // $3 → $2 is 33% off
    expect(getBundleOffer({}, 8.99, 2)!.bundleCents).toBe(1700);
    expect(getBundleOffers({}, 1.5).map((o) => o.bottles)).toEqual([3]); // $3 → $2 (33%) hidden; $4.50 → $4 kept
  });

  it("honours valid per-product overrides and ignores invalid ones", () => {
    expect(getBundleOffer({ bundleDiscountsUSD: { "2": 5 } }, 58.99, 2)!.bottleCents).toBe(5399);
    // outside $3–$9 → not offered at all (never silently clamped)
    expect(getBundleOffer({ bundleDiscountsUSD: { "3": 12 } }, 58.99, 3)).toBeNull();
    expect(getBundleOffer({ bundleDiscountsUSD: { "3": 2 } }, 58.99, 3)).toBeNull();
    expect(getBundleOffer({ bundleDiscountsUSD: { "3": null } }, 58.99, 3)).toBeNull();
    expect(getBundleOffers({ bundlesEnabled: false }, 58.99)).toEqual([]);
  });

  it("is off when the store config disables bundles", () => {
    const off: CommerceConfig = {
      ...COMMERCE_CONFIG,
      bundles: { ...COMMERCE_CONFIG.bundles, enabled: false },
    };
    expect(getBundleOffers({}, 58.99, { config: off })).toEqual([]);
  });

  it("reads Firestore override fields defensively", () => {
    expect(readBundleOverrides({ bundlesEnabled: false })).toEqual({ bundlesEnabled: false });
    expect(readBundleOverrides({ bundleDiscountsUSD: { "2": 5, "3": "x", "4": 1 } })).toEqual({
      bundleDiscountsUSD: { "2": 5 },
    });
    expect(readBundleOverrides({ bundlesEnabled: "no" })).toEqual({});
  });
});

describe("bundle input validation", () => {
  it("accepts only 1, 2 or 3", () => {
    expect(parseBundleSize(undefined)).toBe(1);
    expect(parseBundleSize(null)).toBe(1);
    expect(parseBundleSize(1)).toBe(1);
    expect(parseBundleSize("2")).toBe(2);
    expect(parseBundleSize(3)).toBe(3);
    for (const bad of [0, 4, -2, 2.5, "3 bottles", "abc", {}, [2], true, Infinity]) {
      expect(() => parseBundleSize(bad)).toThrow(BundleInputError);
    }
  });

  it("checkout rejects bad bundle values with a 400-type error", () => {
    for (const bad of [4, "10", -1, 2.5, "free", { bottles: 3 }]) {
      expect(() =>
        resolveCheckoutLine({ productId: "bonomarlot", size: "20", quantity: 1, bundle: bad as never })
      ).toThrow(CheckoutValidationError);
    }
  });

  it("checkout rejects a bundle the product does not offer", async () => {
    const noBundles: PriceableProduct = { ...cytomax, bundlesEnabled: false };
    await expect(
      resolveCheckoutLinesWith(
        [{ productId: "vladonix", size: "20", quantity: 1, bundle: 3 }],
        async () => new Map([["vladonix", noBundles]])
      )
    ).rejects.toThrow(/not available/);
  });

  it("checkout refuses hidden products (Calsil-T, Indosine)", () => {
    for (const productId of ["calsil-t", "indosine"])
      expect(() => resolveCheckoutLine({ productId, quantity: 1 })).toThrow(CheckoutValidationError);
  });

  it("ignores any client-sent price for bundles", async () => {
    const cerluten = products.find((p) => p.id === "cerluten")! as PriceableProduct;
    const [line] = await resolveCheckoutLinesWith(
      [{ productId: "cerluten", size: "60", quantity: 1, bundle: "3x60", price: 1 } as never],
      async () => new Map([["cerluten", cerluten]])
    );
    expect(line.unitAmountCents).toBe(49600);
    expect(line.bundleBottles).toBe(3);
    expect(line.bundleKind).toBe("3x60");
    expect(line.name).toBe("Cerluten — 3 × 60 capsules");
  });

  it("rejects the retired 60 + 20 pack at checkout", () => {
    expect(() => resolveCheckoutLine({ productId: "cerluten", size: "60", quantity: 1, bundle: "60+20" })).toThrow(
      /not available/
    );
  });

  it("prices from the live (Firestore) price, not the code catalog", async () => {
    const live: PriceableProduct = { ...cytomax, variants: [{ id: "20-count", name: "20 Capsules", priceUSD: 60 }] };
    const [line] = await resolveCheckoutLinesWith(
      [{ productId: "vladonix", size: "20", quantity: 2, bundle: 3 }],
      async () => new Map([["vladonix", live]])
    );
    expect(line.unitAmountCents).toBe(16500); // $180 × 0.92 = $165.60 → $165
    expect(line.quantity).toBe(2);
  });

  it("display helper matches checkout", () => {
    const cerluten = products.find((p) => p.id === "cerluten")! as PriceableProduct;
    expect(getCartLineUnitUSD(cerluten, "20")).toBe(72);
    expect(getCartLineUnitUSD(cerluten, "60")).toBe(180);
    expect(getCartLineUnitUSD(cerluten, "20", "3x60")).toBeUndefined();
    expect(getCartLineUnitUSD(cerluten, "20", 2)).toBeUndefined();
    expect(getCartLineUnitUSD(cerluten, "60", "60+20")).toBeUndefined();
    expect(getCartLineUnitUSD(cerluten, "60", "2x60")).toBe(344);
    expect(getCartLineUnitUSD(cerluten, "60", "3x60")).toBe(496);
    expect(getCartLineUnitUSD(cerluten, "20", 7)).toBeUndefined();
  });
});

describe("Stripe session params (server-side amounts)", () => {
  const origin = "https://example.test";

  it("charges the pack price per pack and records bundle metadata", async () => {
    const cerluten = products.find((p) => p.id === "cerluten")! as PriceableProduct;
    const resolved = await resolveCheckoutLinesWith(
      [{ productId: "cerluten", size: "60", quantity: 1, bundle: "2x60" }],
      async () => new Map([["cerluten", cerluten]])
    );
    const { params, merchandiseCents, shippingCents } = buildCheckoutSessionParams({ resolved, origin });
    expect(params.line_items[0].price_data.unit_amount).toBe(34400);
    expect(params.line_items[0].quantity).toBe(1);
    expect(params.line_items[0].price_data.product_data.name).toBe("Cerluten — 2 × 60 capsules");
    expect(params.line_items[0].price_data.product_data.metadata).toMatchObject({
      product_id: "cerluten",
      size: "60",
      bundle_bottles: "2",
      bundle_kind: "2x60",
    });
    expect(params.metadata.bundles).toBe("cerluten:60:2x60x1");
    expect(merchandiseCents).toBe(34400);
    // $344 is at/above $155 → free shipping
    expect(shippingCents).toBe(0);
    expect(params.shipping_options[0].shipping_rate_data.fixed_amount.amount).toBe(0);
  });

  it("charges $11.98 shipping below $155 (two 20-cap bottles, $144)", async () => {
    const cerluten = products.find((p) => p.id === "cerluten")! as PriceableProduct;
    const resolved = await resolveCheckoutLinesWith(
      [{ productId: "cerluten", size: "20", quantity: 2 }],
      async () => new Map([["cerluten", cerluten]])
    );
    const { params, merchandiseCents, shippingCents } = buildCheckoutSessionParams({ resolved, origin });
    expect(merchandiseCents).toBe(14400);
    expect(shippingCents).toBe(1198);
    expect(params.shipping_options[0].shipping_rate_data.fixed_amount.amount).toBe(1198);
  });

  it("applies free shipping at/above $155 (one 60-cap bottle, $180)", async () => {
    const cerluten = products.find((p) => p.id === "cerluten")! as PriceableProduct;
    const resolved = await resolveCheckoutLinesWith(
      [{ productId: "cerluten", size: "60", quantity: 1 }],
      async () => new Map([["cerluten", cerluten]])
    );
    const { params, merchandiseCents } = buildCheckoutSessionParams({ resolved, origin });
    expect(merchandiseCents).toBe(18000);
    expect(params.shipping_options).toHaveLength(1);
    expect(params.shipping_options[0].shipping_rate_data.fixed_amount.amount).toBe(0);
    expect(params.shipping_options[0].shipping_rate_data.display_name).toBe("Free shipping");
    expect(params.metadata.shipping_quote).toBe("0.00");
  });

  it("single bottles keep their normal price and no bundle metadata", async () => {
    const resolved = await resolveCheckoutLinesWith(
      [{ productId: "vladonix", size: "20", quantity: 2 }],
      async () => new Map([["vladonix", cytomax]])
    );
    const { params } = buildCheckoutSessionParams({ resolved, origin });
    expect(params.line_items[0].price_data.unit_amount).toBe(5899);
    expect(params.line_items[0].price_data.product_data.metadata.bundle_bottles).toBe("1");
    expect(params.metadata.bundles).toBe("");
  });
});

describe("larger-size guard (a bundle never undercuts a bigger bottle)", () => {
  // Live prices (code catalog, 2026-11-20): Gotratix 20 caps $72, 60 caps $180.
  // 3 × 20 at 8% off ($198) stays above the 60-cap bottle, so the legacy math allows it
  // (the storefront and checkout still never offer legacy packs on 20/60 products).
  const gotratix = products.find((p) => p.id === "gotratix")! as PriceableProduct;

  it("allows Gotratix 3 × 20 caps in the legacy math ($198 > one 60-cap bottle at $180)", () => {
    expect(getBundleOffer(gotratix, 72, 3, { size: "20" })!.bundleCents).toBe(19800);
    expect(largerSizeFloorCents(gotratix, 72, 3, "20")).toBe(18000);
    expect(getBundleOffers(gotratix, 72, { size: "20" }).map((o) => o.bottles)).toEqual([2, 3]);
    // size inferred from the price when not passed
    expect(getBundleOffer(gotratix, 72, 3)!.bundleCents).toBe(19800);
  });

  it("still hides a 3 × 20 bundle when the 20-cap price is low enough to undercut the 60", () => {
    // Safety net: same 60-cap floor, a lower $58.99 20-cap price ($149.97 ≤ $180).
    expect(getBundleOffer(gotratix, 58.99, 3, { size: "20" })).toBeNull();
    expect(largerSizeFloorCents(gotratix, 58.99, 3, "20")).toBe(18000);
  });

  it("keeps Gotratix 2 × 20 caps (40 caps — fewer than the 60-cap bottle) and the 60-cap bundles", () => {
    expect(getBundleOffer(gotratix, 72, 2, { size: "20" })!.bundleCents).toBe(13700);
    expect(largerSizeFloorCents(gotratix, 72, 2, "20")).toBeNull();
    expect(getBundleOffer(gotratix, 180, 3, { size: "60" })!.bundleCents).toBe(49600);
  });

  it("hides when the bundle EQUALS the bigger bottle, offers when it is a cent above", () => {
    const p = (big: number): PriceableProduct => ({
      id: "x",
      name: "X",
      priceUSD: 50,
      variants: [
        { id: "20-count", name: "20 Capsules", priceUSD: 50 },
        { id: "60-count", name: "60 Capsules", priceUSD: big },
      ],
    });
    // $150 × 0.92 = $138.00
    expect(getBundleOffer(p(138), 50, 3, { size: "20" })).toBeNull();
    expect(getBundleOffer(p(137.99), 50, 3, { size: "20" })!.bundleCents).toBe(13800);
  });

  it("charges Gotratix 2 × 60 and 3 × 60; a 3 × 20 pack is not offered", () => {
    expect(getCartLineUnitUSD(gotratix, "20", 3)).toBeUndefined();
    expect(() => resolveCheckoutLine({ productId: "gotratix", size: "20", quantity: 1, bundle: 3 })).toThrow(
      CheckoutValidationError,
    );
    const two = getStorefrontBundleOffer(gotratix, "2x60")!;
    const three = getStorefrontBundleOffer(gotratix, "3x60")!;
    expect([two.bundleCents, three.bundleCents]).toEqual([34400, 49600]);
    expect(resolveCheckoutLine({ productId: "gotratix", size: "60", quantity: 1, bundle: "2x60" }).unitAmountCents).toBe(
      two.bundleCents,
    );
    expect(resolveCheckoutLine({ productId: "gotratix", size: "60", quantity: 1, bundle: "3x60" }).unitAmountCents).toBe(
      three.bundleCents,
    );
  });

  it("does not reprice — a bundle that still undercuts a larger size is unavailable at checkout (→ 400)", async () => {
    // cytomax fixture still uses the previous $58.99 / $153.99 pair so the guard can be tested.
    expect(getCartLineUnitUSD(cytomax, "20", 3)).toBeUndefined();
    await expect(
      resolveCheckoutLinesWith(
        [{ productId: "vladonix", size: "20", quantity: 1, bundle: 3 }],
        async () => new Map([["vladonix", cytomax]])
      )
    ).rejects.toThrow(CheckoutValidationError);
  });

  it("keeps the low-price guard alongside it", () => {
    expect(getBundleOffer({}, 2, 2)).toBeNull();
  });

  it("reads capsule counts from variant id or name", () => {
    expect(unitsPerBottle({ id: "60-count", name: "" })).toBe(60);
    expect(unitsPerBottle({ id: "x", name: "120 Capsules" })).toBe(120);
    expect(unitsPerBottle({ id: "lingual", name: "Lingual drops" })).toBeUndefined();
  });
});
