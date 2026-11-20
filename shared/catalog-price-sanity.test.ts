import { describe, expect, it } from "vitest";
import { allProducts } from "../client/src/data/products";
import { isHiddenProduct } from "./hidden-products";
import {
  getStorefrontBundleOffer,
  hasSizePair,
  sizePairCents,
  sizePairPackCents,
  unitsPerBottle,
} from "./bundle-pricing";
import { toCents } from "./commerce-config";

describe("catalog size and storefront pack sanity", () => {
  const pairs = allProducts
    .filter((p) => hasSizePair(p))
    .map((p) => ({ product: p, hidden: isHiddenProduct(p), pair: sizePairCents(p)! }));

  it("finds the 20/60 products", () => {
    expect(pairs.length).toBeGreaterThan(0);
  });

  it("the 60-cap bottle is always the better per-capsule price, and costs more in total than the 20", () => {
    const failures: string[] = [];
    for (const { product, hidden, pair } of pairs) {
      const per20 = pair.p20 / 20;
      const per60 = pair.p60 / 60;
      const tag = `${product.id}${hidden ? " [hidden]" : ""}`;
      if (per20 < per60 - 1e-9) failures.push(`${tag}: 20 is cheaper per cap`);
      if (pair.p20 >= pair.p60) failures.push(`${tag}: 20 costs as much or more than 60`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("2 × 60 and 3 × 60 are offered at 4.4% / 8% off (rounded down to a dollar), cheaper than separately, more than fewer 60s", () => {
    const failures: string[] = [];
    for (const { product, hidden, pair } of pairs) {
      const tag = `${product.id}${hidden ? " [hidden]" : ""}`;
      const two = getStorefrontBundleOffer(product, "2x60");
      const three = getStorefrontBundleOffer(product, "3x60");
      if (!two) failures.push(`${tag}: 2×60 not offered`);
      else {
        if (two.bundleCents !== sizePairPackCents(pair.p60, 2, 4.4)) failures.push(`${tag}: 2×60 formula mismatch`);
        if (two.bundleCents >= two.regularCents) failures.push(`${tag}: 2×60 is not a discount`);
        if (two.bundleCents <= pair.p60) failures.push(`${tag}: 2×60 does not cost more than one 60`);
        if (two.bundleCents % 100 !== 0) failures.push(`${tag}: 2×60 is not whole dollars`);
      }
      if (!three) failures.push(`${tag}: 3×60 not offered`);
      else {
        if (three.bundleCents !== sizePairPackCents(pair.p60, 3, 8)) failures.push(`${tag}: 3×60 formula mismatch`);
        if (three.bundleCents >= three.regularCents) failures.push(`${tag}: 3×60 is not a discount`);
        if (two && three.bundleCents <= two.bundleCents) failures.push(`${tag}: 3×60 does not cost more than 2×60`);
        if (three.bundleCents % 100 !== 0) failures.push(`${tag}: 3×60 is not whole dollars`);
      }
      if (getStorefrontBundleOffer(product, "60+20")) failures.push(`${tag}: retired 60+20 is still offered`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("2026-11-20 prices: standard Khavinson $72 / $180 / $344 / $496; Bonomarlot and Endoluten", () => {
    const check = (id: string, p20: number, p60: number, two: number, three: number) => {
      const p = allProducts.find((x) => x.id === id)!;
      const pair = sizePairCents(p)!;
      expect([pair.p20, pair.p60], id).toEqual([p20, p60]);
      expect(getStorefrontBundleOffer(p, "2x60")!.bundleCents, id).toBe(two);
      expect(getStorefrontBundleOffer(p, "3x60")!.bundleCents, id).toBe(three);
    };
    check("gotratix", 7200, 18000, 34400, 49600);
    check("cerluten", 7200, 18000, 34400, 49600);
    check("bonomarlot", 9000, 23400, 44700, 64500);
    check("endoluten", 12800, 28800, 55000, 79400);
  });

  it("20/60 prices are whole dollars", () => {
    const failures: string[] = [];
    for (const { product, pair } of pairs) {
      if (pair.p20 % 100 !== 0 || pair.p60 % 100 !== 0) failures.push(`${product.id} is not whole dollars`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
