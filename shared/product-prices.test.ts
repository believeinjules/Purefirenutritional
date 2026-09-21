import { describe, it, expect } from "vitest";
import {
  findProduct,
  getUnitPriceUSD,
  resolveCheckoutLine,
  resolveCheckoutLines,
} from "./product-prices";

describe("product-prices catalog integrity", () => {
  it("finds products by id", () => {
    const p = findProduct({ productId: "bonomarlot" });
    expect(p?.name).toBe("Bonomarlot");
  });

  it("uses variant price for 60-count instead of trusting 2.5x", () => {
    const p = findProduct({ productId: "bonomarlot" })!;
    const unit = getUnitPriceUSD(p, "60");
    expect(unit).toBe(210);
    expect(unit).not.toBe(p.priceUSD * 2.5);
  });

  it("uses base/variant price for 20-count", () => {
    const p = findProduct({ productId: "bonomarlot" })!;
    expect(getUnitPriceUSD(p, "20")).toBe(88);
  });

  it("ignores client-sent price when resolving line items", () => {
    const line = resolveCheckoutLine({
      productId: "cartalax",
      name: "Hacked Name",
      price: 0.01,
      size: "60",
      quantity: 2,
    });
    expect(line.unitPriceUSD).toBe(175);
    expect(line.unitAmountCents).toBe(17500);
    expect(line.quantity).toBe(2);
    expect(line.name).toContain("Cartalax");
  });

  it("rejects unknown products", () => {
    expect(() =>
      resolveCheckoutLine({ productId: "not-a-real-sku", quantity: 1 })
    ).toThrow(/Unknown product/);
  });

  it("rejects empty carts", () => {
    expect(() => resolveCheckoutLines([])).toThrow(/Invalid or missing items/);
  });
});
