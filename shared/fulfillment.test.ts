import { describe, expect, it } from "vitest";
import { IN_STOCK_PRODUCT_IDS, resolveFulfillment } from "./fulfillment";
import { allProducts, products } from "../client/src/data/products";
import { validateProductPatch } from "../api/_lib/admin-products";

describe("fulfillment", () => {
  it("every in-stock id is a real, visible product", () => {
    for (const id of IN_STOCK_PRODUCT_IDS) expect(products.some((p) => p.id === id), id).toBe(true);
  });
  it("no Revilab sublingual is in stock", () => {
    expect([...IN_STOCK_PRODUCT_IDS].filter((id) => id.startsWith("revilab-sl"))).toEqual([]);
  });
  it("every catalog product resolves; default ships_2_weeks", () => {
    for (const p of allProducts) expect(p.fulfillment).toBe(IN_STOCK_PRODUCT_IDS.has(p.id) ? "in_stock" : "ships_2_weeks");
    expect(resolveFulfillment("unknown-firestore-only")).toBe("ships_2_weeks");
    expect(resolveFulfillment("sigumir", undefined)).toBe("in_stock");
    expect(resolveFulfillment("sigumir", "ships_2_weeks")).toBe("ships_2_weeks");
    expect(resolveFulfillment("x", "bogus")).toBe("ships_2_weeks");
  });
  it("admin validates the field", () => {
    expect(validateProductPatch({ fulfillment: "in_stock" })).toEqual({ fulfillment: "in_stock" });
    expect(validateProductPatch({ fulfillment: null })).toEqual({ fulfillment: null });
    expect(() => validateProductPatch({ fulfillment: "soon" })).toThrow();
  });
});
