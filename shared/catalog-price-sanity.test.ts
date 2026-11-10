import { describe, expect, it } from "vitest";
import { allProducts } from "../client/src/data/products";
import { isHiddenProduct } from "./hidden-products";
import { getBundleOffer, unitsPerBottle } from "./bundle-pricing";

/**
 * Merchandising rules (Julia, 2026-11-09):
 * - The larger size must always be the best per-unit deal.
 * - A bundle of smaller bottles whose total units meet or exceed a larger size
 *   must cost more than that larger bottle (so the offer can be shown, and the
 *   larger bottle stays the better buy). Fix by raising the smaller size only;
 *   never lower a larger-size price.
 */
describe("catalog size and bundle price sanity", () => {
  const sized = allProducts.flatMap((p) => {
    const variants = (p.variants ?? [])
      .map((v) => {
        const units = unitsPerBottle(v);
        return units && typeof v.priceUSD === "number" ? { id: v.id, units, priceUSD: v.priceUSD } : null;
      })
      .filter((v): v is { id: string; units: number; priceUSD: number } => v !== null);
    return variants.length >= 2 ? [{ product: p, hidden: isHiddenProduct(p), variants }] : [];
  });

  it("every multi-size product has at least one 20/60 (or other unit) pair to check", () => {
    expect(sized.length).toBeGreaterThan(0);
  });

  it("the larger size is always the better per-unit price, and the smaller size is not more expensive in total", () => {
    const failures: string[] = [];
    for (const { product, hidden, variants } of sized) {
      for (const a of variants) {
        for (const b of variants) {
          if (a.units >= b.units) continue;
          const perA = a.priceUSD / a.units;
          const perB = b.priceUSD / b.units;
          const tag = `${product.id}${hidden ? " [hidden]" : ""} ${a.units}u @ $${a.priceUSD.toFixed(2)} vs ${b.units}u @ $${b.priceUSD.toFixed(2)}`;
          if (perA < perB - 1e-9) failures.push(`${tag}: smaller is cheaper per unit ($${perA.toFixed(4)} < $${perB.toFixed(4)})`);
          if (a.priceUSD >= b.priceUSD) failures.push(`${tag}: smaller costs as much or more in total`);
        }
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("a 3-bottle (or 2-bottle) smaller-size bundle never undercuts a larger bottle of ≤ the same units, so the offer can be shown", () => {
    const failures: string[] = [];
    for (const { product, hidden, variants } of sized) {
      for (const a of variants) {
        for (const bottles of [2, 3] as const) {
          const totalUnits = a.units * bottles;
          const offer = getBundleOffer(product, a.priceUSD, bottles, { size: String(a.units) });
          const larger = variants.filter((b) => b.units > a.units && b.units <= totalUnits);
          if (larger.length === 0) continue;
          const floor = Math.max(...larger.map((b) => b.priceUSD));
          const tag = `${product.id}${hidden ? " [hidden]" : ""} ${bottles}×${a.units} vs larger @ $${floor.toFixed(2)}`;
          if (!offer) {
            failures.push(`${tag}: bundle is hidden (would not beat the larger bottle). Raise the ${a.units}-count price.`);
            continue;
          }
          if (offer.bundleCents / 100 <= floor + 1e-9) {
            failures.push(`${tag}: offered bundle $${(offer.bundleCents / 100).toFixed(2)} ≤ larger bottle`);
          }
        }
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("20-cap prices in 20/60 pairs use charm pricing ending in .99", () => {
    const failures: string[] = [];
    for (const { product, variants } of sized) {
      for (const v of variants) {
        if (v.units !== 20) continue;
        const cents = Math.round(v.priceUSD * 100);
        if (cents % 100 !== 99) failures.push(`${product.id} 20-count is $${v.priceUSD.toFixed(2)}, not x.99`);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
