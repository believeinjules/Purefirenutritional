import { describe, expect, it } from "vitest";
import {
  getDefaultCartSize,
  getSizeOptions,
  hasMultipleSizes,
  variantToCartSize,
} from "./productSize";

describe("productSize", () => {
  const dual = {
    priceUSD: 88,
    priceEUR: 52,
    sizes: 2,
    variants: [
      { id: "20-count", name: "20 Capsules", priceUSD: 88, priceEUR: 52, inStock: true },
      { id: "60-count", name: "60 Capsules", priceUSD: 210, priceEUR: 145, inStock: true },
    ],
  };

  const single = {
    priceUSD: 40,
    priceEUR: 30,
    sizes: 1,
  };

  it("detects multiple sizes from variants", () => {
    expect(hasMultipleSizes(dual)).toBe(true);
    expect(hasMultipleSizes(single)).toBe(false);
  });

  it("maps variant ids to cart sizes", () => {
    expect(variantToCartSize(dual.variants[0])).toBe("20");
    expect(variantToCartSize(dual.variants[1])).toBe("60");
  });

  it("returns catalog prices for size options", () => {
    const opts = getSizeOptions(dual);
    expect(opts).toHaveLength(2);
    expect(opts[0].priceUSD).toBe(88);
    expect(opts[1].priceUSD).toBe(210);
  });

  it("defaults to first / 20 for single-size products", () => {
    expect(getDefaultCartSize(single)).toBe("20");
    expect(getSizeOptions(single)).toHaveLength(1);
  });

  it("never invents a 2.5x 60-count option for products without variants", () => {
    const legacy = { priceUSD: 40, priceEUR: 30, sizes: 2 };
    const opts = getSizeOptions(legacy);
    expect(opts).toHaveLength(1);
    expect(opts[0].priceUSD).toBe(40);
    expect(hasMultipleSizes(legacy)).toBe(false);
  });

  it("still offers variants when all are marked out of stock", () => {
    const allOut = {
      ...dual,
      variants: dual.variants.map((v) => ({ ...v, inStock: false })),
    };
    expect(getSizeOptions(allOut)).toHaveLength(2);
  });
});
