import { describe, expect, it } from "vitest";
import { allProducts } from "../client/src/data/products";
import { isHiddenProduct } from "./hidden-products";
import {
  addon20Cents,
  getStorefrontBundleOffer,
  hasSizePair,
  sizePairCents,
  twoX60PriceCents,
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

  it("2 × 60 and 60 + 20 are offered, cheaper than buying separately, and more than a single 60", () => {
    const failures: string[] = [];
    for (const { product, hidden, pair } of pairs) {
      const tag = `${product.id}${hidden ? " [hidden]" : ""}`;
      const two = getStorefrontBundleOffer(product, "2x60");
      const combo = getStorefrontBundleOffer(product, "60+20");
      if (!two) failures.push(`${tag}: 2×60 not offered`);
      else {
        if (two.bundleCents !== twoX60PriceCents(pair.p60)) failures.push(`${tag}: 2×60 formula mismatch`);
        if (two.bundleCents >= two.regularCents) failures.push(`${tag}: 2×60 is not a discount`);
        if (two.bundleCents <= pair.p60) failures.push(`${tag}: 2×60 does not cost more than one 60`);
      }
      if (!combo) failures.push(`${tag}: 60+20 not offered`);
      else {
        if (combo.bundleCents !== pair.p60 + addon20Cents(pair.p20)) failures.push(`${tag}: 60+20 formula mismatch`);
        if (combo.bundleCents >= combo.regularCents) failures.push(`${tag}: 60+20 is not a discount`);
        if (combo.bundleCents <= pair.p60) failures.push(`${tag}: 60+20 does not cost more than one 60`);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("Cerluten uses the prices Julia set: $55.77 / $154.99 / $289 / $182.99", () => {
    const p = allProducts.find((x) => x.id === "cerluten")!;
    const pair = sizePairCents(p)!;
    expect(pair.p20).toBe(5577);
    expect(pair.p60).toBe(15499);
    expect(getStorefrontBundleOffer(p, "2x60")!.bundleCents).toBe(28900);
    expect(getStorefrontBundleOffer(p, "60+20")!.bundleCents).toBe(18299);
    expect(addon20Cents(5577)).toBe(2800);
  });

  it("20-cap prices end in .99 except Julia's $55.77 / $70.77 prices", () => {
    const special: Record<string, number> = {
      cerluten: 5577,
      cartalax: 5577,
      crystagen: 5577,
      vesugen: 5577,
      bonomarlot: 7077,
    };
    const failures: string[] = [];
    for (const { product, pair } of pairs) {
      if (product.id in special) {
        if (pair.p20 !== special[product.id]) {
          failures.push(`${product.id} 20-count is ${(pair.p20 / 100).toFixed(2)}, expected ${(special[product.id] / 100).toFixed(2)}`);
        }
        continue;
      }
      if (pair.p20 % 100 !== 99) failures.push(`${product.id} 20-count is ${(pair.p20 / 100).toFixed(2)}, not x.99`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
