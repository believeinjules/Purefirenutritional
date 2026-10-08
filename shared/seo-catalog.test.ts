import { describe, expect, it } from "vitest";
import { decodeFirestoreFields, loadSeoCatalog, mergeFirestoreProduct } from "./seo-catalog";
import { products } from "../client/src/data/products";

describe("seo catalog", () => {
  it("decodes Firestore REST values", () => {
    expect(
      decodeFirestoreFields({
        name: { stringValue: "A" },
        priceUSD: { doubleValue: 9.5 },
        qty: { integerValue: "3" },
        in_stock: { booleanValue: false },
        variants: {
          arrayValue: {
            values: [{ mapValue: { fields: { id: { stringValue: "20-count" } } } }],
          },
        },
      })
    ).toEqual({ name: "A", priceUSD: 9.5, qty: 3, in_stock: false, variants: [{ id: "20-count" }] });
  });

  it("uses Firestore prices (what checkout charges) over the code catalog", () => {
    const code = products.find((p) => p.id === "bonomarlot")!;
    const merged = mergeFirestoreProduct(
      "bonomarlot",
      {
        name: "Bonomarlot",
        priceUSD: 70,
        variants: [
          { id: "20-count", name: "20 Capsules", priceUSD: 70, inStock: true },
          { id: "60-count", name: "60 Capsules", priceUSD: 180, inStock: false },
        ],
      },
      code
    )!;
    expect(merged.variants!.map((v) => v.priceUSD)).toEqual([70, 180]);
    expect(merged.variants![1]!.inStock).toBe(false);
    expect(merged.image).toBe(code.image);
    expect(merged.description).toBe(code.description);
  });

  it("rejects docs checkout would reject (falls back to code)", () => {
    expect(mergeFirestoreProduct("x", { name: "X", priceUSD: 0 }, undefined)).toBeNull();
  });

  it("without a project id uses the code catalog", async () => {
    const r = await loadSeoCatalog({});
    expect(r.live).toBe(false);
    expect(r.entries.map((e) => e.product.id)).toEqual(products.map((p) => p.id));
  });
});
