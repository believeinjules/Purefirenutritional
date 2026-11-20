import { describe, expect, it } from "vitest";
import { allProducts } from "../client/src/data/products";
import { isHiddenProduct } from "./hidden-products";
import {
  getStorefrontBundleOffer,
  hasSizePair,
  sizePairCents,
  resolveBundleOffer,
  unitsPerBottle,
} from "./bundle-pricing";
import { toCents } from "./commerce-config";

const pair = (p: Parameters<typeof sizePairCents>[0]) => sizePairCents(p)!;

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

  it("no Khavinson 20/60 product offers any multi-bottle pack (deals are Prime Peptide only)", () => {
    const failures: string[] = [];
    for (const { product, hidden } of pairs) {
      const tag = `${product.id}${hidden ? " [hidden]" : ""}`;
      for (const kind of ["2x60", "3x60", "60+20"] as const)
        if (getStorefrontBundleOffer(product, kind)) failures.push(`${tag}: ${kind} is offered`);
      for (const bottles of [2, 3])
        for (const size of ["20", "60"])
          if (resolveBundleOffer(product, size === "20" ? pair(product).p20 / 100 : pair(product).p60 / 100, bottles, { size }))
            failures.push(`${tag}: ${bottles} × ${size} resolves`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("2026-11-20 prices: standard Khavinson $72 / $180, Endoluten $128 / $288; Bonomarlot unchanged at $81.99 / $229.99", () => {
    const check = (id: string, p20: number, p60: number) => {
      const p = allProducts.find((x) => x.id === id)!;
      expect([pair(p).p20, pair(p).p60], id).toEqual([p20, p60]);
    };
    check("gotratix", 7200, 18000);
    check("cerluten", 7200, 18000);
    check("endoluten", 12800, 28800);
    check("bonomarlot", 8199, 22999);
    expect(allProducts.find((x) => x.id === "bonomarlot")!.priceUSD).toBe(81.99);
  });

  it("20/60 prices are whole dollars (Bonomarlot is excluded from the update and keeps its cents)", () => {
    const failures: string[] = [];
    for (const { product, pair: pr } of pairs) {
      if (product.id === "bonomarlot") continue;
      if (pr.p20 % 100 !== 0 || pr.p60 % 100 !== 0) failures.push(`${product.id} is not whole dollars`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
