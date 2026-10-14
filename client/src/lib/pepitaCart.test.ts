import { describe, expect, it, vi } from "vitest";
import { allProducts as products, type Product } from "@/data/products";
import { TOPICS } from "@shared/peppy/topics";
import { buildCatalog } from "@shared/peppy/catalog";
import { analyze, composeFallback } from "@shared/peppy/engine";
import { cardPrice, cardSizeOptions, createCardAdder, purchaseState, wordCount } from "./pepitaCart";
import { shortAnswer } from "./pepitaPreview";

const byId = (id: string) => products.find(p => p.id === id)! as Product;

describe("Pepita card cart add", () => {
  it("adds the right product id and the selected size (variant), quantity 1, no bundle", async () => {
    const add = vi.fn();
    const endoluten = byId("endoluten");
    expect(cardSizeOptions(endoluten).map(o => o.size)).toEqual(["20", "60"]);
    expect(await createCardAdder(add)(endoluten, "60")).toBe("added");
    expect(add).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledWith(endoluten, 1, "60");
    expect(cardPrice(endoluten, "60")).toBe(endoluten.variants!.find(v => v.id === "60-count")!.priceUSD);
  });

  it("ignores a second tap while the first add is in flight (no duplicates)", async () => {
    const add = vi.fn();
    const adder = createCardAdder(add);
    const p = byId("pinealon");
    const [a, b] = await Promise.all([adder(p, "20"), adder(p, "20")]);
    expect([a, b].sort()).toEqual(["added", "busy"]);
    expect(add).toHaveBeenCalledTimes(1);
    expect(await adder(p, "20")).toBe("added"); // re-enabled afterwards
    expect(add).toHaveBeenCalledTimes(2);
  });

  it("never adds out-of-stock products or sold-out sizes", async () => {
    const add = vi.fn();
    const base = byId("endoluten");
    const soldOut = { ...base, variants: base.variants!.map(v => ({ ...v, inStock: false })) } as Product;
    const flagged = { ...base, inStock: false } as unknown as Product;
    const oneSize = { ...base, variants: base.variants!.map(v => ({ ...v, inStock: v.id !== "60-count" })) } as Product;
    expect(purchaseState(soldOut)).toBe("out-of-stock");
    expect(purchaseState(flagged)).toBe("out-of-stock");
    expect(await createCardAdder(add)(soldOut, "20")).toBe("blocked");
    expect(cardSizeOptions(oneSize).map(o => o.size)).toEqual(["20"]);
    expect(await createCardAdder(add)(oneSize, "60")).toBe("blocked");
    expect(add).not.toHaveBeenCalled();
    expect(purchaseState(null)).toBe("unavailable");
  });

  it("liquids keep the shop's pre-order labelling; capsules are plain Add to Cart", () => {
    expect(purchaseState(byId("revilab-sl-01"))).toBe("preorder");
    expect(purchaseState(byId("endoluten"))).toBe("available");
  });
});

describe("Pepita answer length", () => {
  it("every fallback topic summary is 2–3 sentences and 40–65 words", () => {
    for (const t of TOPICS) {
      const shown = shortAnswer(t.summary, 3);
      expect(shown, t.id).toBe(shortAnswer(t.summary, 10));
      const n = wordCount(shown);
      expect(n, `${t.id}: ${n} words`).toBeGreaterThanOrEqual(40);
      expect(n, `${t.id}: ${n} words`).toBeLessThanOrEqual(65);
    }
  });

  it("the composed sleep answer keeps 40–65 words, Endoluten first, no Pinalex, no schedule in the text", () => {
    const catalog = buildCatalog(products as never);
    const r = composeFallback(analyze({ message: "I can't sleep well", history: [], catalog }), catalog);
    const text = shortAnswer(r.summary, 3);
    expect(wordCount(text)).toBeGreaterThanOrEqual(40);
    expect(wordCount(text)).toBeLessThanOrEqual(65);
    expect(r.products[0].product.id).toBe("endoluten");
    expect(r.products.map(p => p.product.id)).not.toContain("pinalex-tab");
    expect(text).not.toMatch(/capsule|every 3 days|Epitalon/i);
    expect(r.products[0].protocol).toBeUndefined(); // Endoluten dosing on hold (facts file)
    expect(r.products[0].research?.length).toBeGreaterThan(0);
  });
});
