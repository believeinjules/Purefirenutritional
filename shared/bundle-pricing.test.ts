import { describe, expect, it } from "vitest";
import {
  BUNDLE_DISCOUNT_LIMITS_USD,
  COMMERCE_CONFIG,
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
  it("uses the approved bundle discounts ($4 / $8 per bottle), all inside $3–$9", () => {
    const tiers = COMMERCE_CONFIG.bundles.tiers;
    expect(tiers.find((t) => t.bottles === 2)?.discountPerBottleUSD).toBe(4);
    expect(tiers.find((t) => t.bottles === 3)?.discountPerBottleUSD).toBe(8);
    for (const t of tiers) expect(isAllowedBundleDiscount(t.discountPerBottleUSD)).toBe(true);
    expect(BUNDLE_DISCOUNT_LIMITS_USD).toEqual({ min: 3, max: 9 });
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
  it("2 bottles = 2 × (price − $4)", () => {
    const offer = getBundleOffer(cytomax, 58.99, 2)!;
    expect(offer.bottleCents).toBe(5499);
    expect(offer.bundleCents).toBe(10998);
    expect(offer.savingsCents).toBe(800);
  });

  it("3 bottles = 3 × (price − $8)", () => {
    const offer = getBundleOffer(singleSize, 58.99, 3)!;
    expect(offer.bottleCents).toBe(5099);
    expect(offer.bundleCents).toBe(15297);
    expect(offer.savingsCents).toBe(2400);
  });

  it("applies to the 60-count price too (discount per bottle of that size)", () => {
    expect(getBundleOffer(cytomax, 153.99, 3)!.bundleCents).toBe(3 * (15399 - 800));
  });

  it("does not offer bundles that would take more than 20% off a low-priced bottle", () => {
    expect(getBundleOffer({}, 8.99, 2)).toBeNull();
    expect(getBundleOffer({}, 19.99, 2)).toBeNull(); // $4 off $19.99 = 20.01% off
    expect(getBundleOffer({}, 20, 2)!.bottleCents).toBe(1600);
    expect(getBundleOffer({}, 39.99, 3)).toBeNull();
    expect(getBundleOffer({}, 40, 3)!.bottleCents).toBe(3200);
    expect(getBundleOffers({}, 21.99).map((o) => o.bottles)).toEqual([2]);
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
      [{ productId: "cerluten", size: "60", quantity: 1, bundle: "60+20", price: 1 } as never],
      async () => new Map([["cerluten", cerluten]])
    );
    expect(line.unitAmountCents).toBe(17749);
    expect(line.bundleBottles).toBe(2);
    expect(line.bundleKind).toBe("60+20");
    expect(line.name).toBe("Cerluten 60 + 20 capsules");
  });

  it("prices from the live (Firestore) price, not the code catalog", async () => {
    const live: PriceableProduct = { ...cytomax, variants: [{ id: "20-count", name: "20 Capsules", priceUSD: 60 }] };
    const [line] = await resolveCheckoutLinesWith(
      [{ productId: "vladonix", size: "20", quantity: 2, bundle: 3 }],
      async () => new Map([["vladonix", live]])
    );
    expect(line.unitAmountCents).toBe(3 * (6000 - 800));
    expect(line.quantity).toBe(2);
  });

  it("display helper matches checkout", () => {
    const cerluten = products.find((p) => p.id === "cerluten")! as PriceableProduct;
    expect(getCartLineUnitUSD(cerluten, "20")).toBe(55);
    expect(getCartLineUnitUSD(cerluten, "20", "60+20")).toBeUndefined();
    expect(getCartLineUnitUSD(cerluten, "20", 2)).toBeUndefined();
    expect(getCartLineUnitUSD(cerluten, "60", "60+20")).toBe(177.49);
    expect(getCartLineUnitUSD(cerluten, "60", "2x60")).toBe(279);
    expect(getCartLineUnitUSD(cerluten, "20", 7)).toBeUndefined();
  });
});

describe("Stripe session params (server-side amounts)", () => {
  const origin = "https://example.test";

  it("charges the pack price per pack and records bundle metadata", async () => {
    const cerluten = products.find((p) => p.id === "cerluten")! as PriceableProduct;
    const resolved = await resolveCheckoutLinesWith(
      [{ productId: "cerluten", size: "60", quantity: 1, bundle: "60+20" }],
      async () => new Map([["cerluten", cerluten]])
    );
    const { params, merchandiseCents, shippingCents } = buildCheckoutSessionParams({ resolved, origin });
    expect(params.line_items[0].price_data.unit_amount).toBe(17749);
    expect(params.line_items[0].quantity).toBe(1);
    expect(params.line_items[0].price_data.product_data.name).toBe("Cerluten 60 + 20 capsules");
    expect(params.line_items[0].price_data.product_data.metadata).toMatchObject({
      product_id: "cerluten",
      size: "60",
      bundle_bottles: "2",
      bundle_kind: "60+20",
    });
    expect(params.metadata.bundles).toBe("cerluten:60:60+20x1");
    expect(merchandiseCents).toBe(17749);
    // $177.49 is at/above $150 → free shipping
    expect(shippingCents).toBe(0);
    expect(params.shipping_options[0].shipping_rate_data.fixed_amount.amount).toBe(0);
  });

  it("applies free shipping at/above $150 after pack discounts", async () => {
    const cerluten = products.find((p) => p.id === "cerluten")! as PriceableProduct;
    const resolved = await resolveCheckoutLinesWith(
      [{ productId: "cerluten", size: "60", quantity: 1, bundle: "60+20" }],
      async () => new Map([["cerluten", cerluten]])
    );
    const { params, merchandiseCents } = buildCheckoutSessionParams({ resolved, origin });
    expect(merchandiseCents).toBe(17749);
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
  // Live prices (Firestore = code catalog): Gotratix 20 caps $59.99, 60 caps $153.99.
  // The 20-cap price was raised just enough so 3 × 20 ($155.97) is above the 60-cap
  // bottle and can be offered; the 60-cap price was not changed.
  const gotratix = products.find((p) => p.id === "gotratix")! as PriceableProduct;
  const cartalax = products.find((p) => p.id === "cartalax")! as PriceableProduct;

  it("offers Gotratix 3 × 20 caps ($155.97 > one 60-cap bottle at $153.99)", () => {
    expect(getBundleOffer(gotratix, 59.99, 3, { size: "20" })!.bundleCents).toBe(15597);
    expect(largerSizeFloorCents(gotratix, 59.99, 3, "20")).toBe(15399);
    expect(getBundleOffers(gotratix, 59.99, { size: "20" }).map((o) => o.bottles)).toEqual([2, 3]);
    // size inferred from the price when not passed
    expect(getBundleOffer(gotratix, 59.99, 3)!.bundleCents).toBe(15597);
  });

  it("still hides a 3 × 20 bundle when the 20-cap price is low enough to undercut the 60", () => {
    // Safety net: same 60-cap floor, previous $58.99 20-cap price ($152.97 ≤ $153.99).
    expect(getBundleOffer(gotratix, 58.99, 3, { size: "20" })).toBeNull();
    expect(largerSizeFloorCents(gotratix, 58.99, 3, "20")).toBe(15399);
  });

  it("keeps Gotratix 2 × 20 caps (40 caps — fewer than the 60-cap bottle) and the 60-cap bundles", () => {
    expect(getBundleOffer(gotratix, 59.99, 2, { size: "20" })!.bundleCents).toBe(11198);
    expect(largerSizeFloorCents(gotratix, 59.99, 2, "20")).toBeNull();
    expect(getBundleOffer(gotratix, 153.99, 3, { size: "60" })!.bundleCents).toBe(43797);
  });

  it("keeps Cartalax 3 × 20 caps ($119.97 > one 60-cap bottle at $116.99)", () => {
    expect(getBundleOffer(cartalax, 47.99, 3, { size: "20" })!.bundleCents).toBe(11997);
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
    // 3 × (50 − 8) = 126.00
    expect(getBundleOffer(p(126), 50, 3, { size: "20" })).toBeNull();
    expect(getBundleOffer(p(125.99), 50, 3, { size: "20" })!.bundleCents).toBe(12600);
  });

  it("charges Gotratix 2 × 60 and 60 + 20; a 3 × 20 pack is not offered", () => {
    expect(getCartLineUnitUSD(gotratix, "20", 3)).toBeUndefined();
    expect(() => resolveCheckoutLine({ productId: "gotratix", size: "20", quantity: 1, bundle: 3 })).toThrow(
      CheckoutValidationError,
    );
    const two = getStorefrontBundleOffer(gotratix, "2x60")!;
    const combo = getStorefrontBundleOffer(gotratix, "60+20")!;
    expect(resolveCheckoutLine({ productId: "gotratix", size: "60", quantity: 1, bundle: "2x60" }).unitAmountCents).toBe(
      two.bundleCents,
    );
    expect(resolveCheckoutLine({ productId: "gotratix", size: "60", quantity: 1, bundle: "60+20" }).unitAmountCents).toBe(
      combo.bundleCents,
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
    expect(getBundleOffer({}, 19.99, 2)).toBeNull();
  });

  it("reads capsule counts from variant id or name", () => {
    expect(unitsPerBottle({ id: "60-count", name: "" })).toBe(60);
    expect(unitsPerBottle({ id: "x", name: "120 Capsules" })).toBe(120);
    expect(unitsPerBottle({ id: "lingual", name: "Lingual drops" })).toBeUndefined();
  });
});
