import { describe, it, expect } from "vitest";
import { getSimilarProducts } from "./similarProducts";
import { products } from "@/data/products";
import { isHiddenProduct } from "@shared/hidden-products";

describe("getSimilarProducts", () => {
  it("picks endocrine relatives for Glandokort", () => {
    const ids = getSimilarProducts("glandokort").map((p) => p.id);
    expect(ids).toContain("thyreogen");
    expect(ids).not.toContain("glandokort");
  });
  it("never returns the current, hidden or unpriced products; 3–4 for every PDP", () => {
    for (const p of products) {
      const sim = getSimilarProducts(p.id);
      expect(sim.length).toBeLessThanOrEqual(4);
      for (const s of sim) {
        expect(s.id).not.toBe(p.id);
        expect(isHiddenProduct(s)).toBe(false);
        expect(s.priceUSD).toBeGreaterThan(0);
      }
    }
  });
});
