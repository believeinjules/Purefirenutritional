import { describe, expect, it } from "vitest";
import { getProductById } from "@/data/products";
import { getPdpContent } from "@shared/product-facts";
import { recommendationCardCopy } from "./recommendationCopy";

const IDS = ["prime-peptide-brain", "prime-peptide-joints", "anti-wrinkle-serum-7"] as const;

describe("recommendation card copy", () => {
  it("uses the same overview and key benefits as the product page", () => {
    for (const id of IDS) {
      const product = getProductById(id)!;
      const pdp = getPdpContent(id)!;
      const copy = recommendationCardCopy(product);
      expect(copy.description, id).toBe(pdp.overview[0]);
      expect(copy.benefits, id).toEqual(pdp.formulatedFor);
      expect(copy.description, id).not.toMatch(/blood-brain|neuroplasticity|serotonin|targeted cellular|lifting effect|deep wrinkle/i);
      expect(copy.benefits.join(" "), id).not.toMatch(/blood-brain|neuroplasticity|serotonin|targeted cellular|lifting|deep wrinkle/i);
    }
  });

  it("does not change stored prices or the catalog description field", () => {
    const prices = {
      "prime-peptide-brain": getProductById("prime-peptide-brain")!.priceUSD,
      "prime-peptide-joints": getProductById("prime-peptide-joints")!.priceUSD,
      "anti-wrinkle-serum-7": getProductById("anti-wrinkle-serum-7")!.priceUSD,
    };
    expect(prices).toEqual({
      "prime-peptide-brain": 162,
      "prime-peptide-joints": 189,
      "anti-wrinkle-serum-7": 144,
    });
    for (const id of IDS) {
      const product = getProductById(id)!;
      recommendationCardCopy(product);
      expect(product.priceUSD, id).toBe(prices[id]);
    }
    expect(getProductById("prime-peptide-brain")!.description).toMatch(/blood-brain barrier/);
    expect(getProductById("prime-peptide-joints")!.description).toMatch(/targeted cellular repair/);
    expect(getProductById("anti-wrinkle-serum-7")!.description).toMatch(/lifting effect/);
  });

  it("leaves other products on their own catalog description", () => {
    const endoluten = getProductById("endoluten")!;
    expect(recommendationCardCopy(endoluten).description).toBe(endoluten.description);
    expect(recommendationCardCopy(endoluten).benefits).toEqual(endoluten.benefits);
  });
});
