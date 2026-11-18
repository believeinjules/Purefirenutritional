import { describe, expect, it } from "vitest";
import { DEFAULT_FULFILLMENT, resolveFulfillment } from "./fulfillment";
import { allProducts } from "../client/src/data/products";
import { validateProductPatch } from "../api/_lib/admin-products";

describe("fulfillment", () => {
  it("code default is in_stock (Julia, 2026-11-18: every variant ships now)", () => {
    expect(DEFAULT_FULFILLMENT).toBe("in_stock");
    for (const p of allProducts) expect(p.fulfillment).toBe("in_stock");
    expect(resolveFulfillment("unknown-firestore-only")).toBe("in_stock");
    expect(resolveFulfillment("sigumir", undefined)).toBe("in_stock");
    expect(resolveFulfillment("sigumir", "ships_2_weeks")).toBe("ships_2_weeks");
    expect(resolveFulfillment("x", "bogus")).toBe("in_stock");
  });
  it("admin validates the field", () => {
    expect(validateProductPatch({ fulfillment: "in_stock" })).toEqual({ fulfillment: "in_stock" });
    expect(validateProductPatch({ fulfillment: null })).toEqual({ fulfillment: null });
    expect(() => validateProductPatch({ fulfillment: "soon" })).toThrow();
  });
});
