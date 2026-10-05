import { describe, it, expect } from "vitest";
import {
  CheckoutValidationError,
  findProduct,
  getUnitPriceUSD,
  resolveCheckoutLine,
  resolveCheckoutLines,
  resolveCheckoutLinesWith,
  resolveVariant,
  type PriceableProduct,
} from "./product-prices";
import { products } from "../client/src/data/products";

const bonomarlot = products.find((p) => p.id === "bonomarlot")!;
const bono20 = bonomarlot.variants!.find((v) => v.id === "20-count")!;
const bono60 = bonomarlot.variants!.find((v) => v.id === "60-count")!;
const singleSize = products.find((p) => !p.variants?.length)!;

describe("product-prices catalog integrity", () => {
  it("finds products by id", () => {
    const p = findProduct({ productId: "bonomarlot" });
    expect(p?.name).toBe("Bonomarlot");
  });

  it("uses the 60-count variant price (no 2.5x multiplier)", () => {
    const unit = getUnitPriceUSD(bonomarlot, "60");
    expect(unit).toBe(bono60.priceUSD);
    expect(unit).not.toBe(Number((bonomarlot.priceUSD * 2.5).toFixed(2)));
  });

  it("uses the 20-count variant price", () => {
    expect(getUnitPriceUSD(bonomarlot, "20")).toBe(bono20.priceUSD);
  });

  it("never multiplies single-size products for size 60 (display)", () => {
    expect(getUnitPriceUSD(singleSize, "60")).toBe(singleSize.priceUSD);
  });

  it("matches sizes strictly (20 never matches 120-count)", () => {
    const p: PriceableProduct = {
      id: "x",
      name: "X",
      priceUSD: 10,
      variants: [
        { id: "120-count", name: "120 Capsules", priceUSD: 99 },
        { id: "20-count", name: "20 Capsules", priceUSD: 10 },
      ],
    };
    expect(resolveVariant(p, "20")?.id).toBe("20-count");
  });

  it("ignores client-sent price when resolving line items", () => {
    const cartalax = products.find((p) => p.id === "cartalax")!;
    const cartalax60 = cartalax.variants!.find((v) => v.id === "60-count")!;
    const line = resolveCheckoutLine({
      productId: "cartalax",
      name: "Hacked Name",
      price: 0.01,
      size: "60",
      quantity: 2,
    });
    expect(line.unitPriceUSD).toBe(cartalax60.priceUSD);
    expect(line.unitAmountCents).toBe(Math.round(cartalax60.priceUSD * 100));
    expect(line.quantity).toBe(2);
    expect(line.name).toContain("Cartalax");
    expect(line.variantId).toBe("60-count");
  });

  it("rejects size 60 on single-size products", () => {
    expect(() =>
      resolveCheckoutLine({ productId: singleSize.id, size: "60", quantity: 1 })
    ).toThrow(CheckoutValidationError);
  });

  it("rejects unknown sizes", () => {
    expect(() =>
      resolveCheckoutLine({ productId: "bonomarlot", size: "45", quantity: 1 })
    ).toThrow(/Invalid size/);
  });

  it("defaults to the 20-count when an older client sends no size", () => {
    const line = resolveCheckoutLine({ productId: "bonomarlot", quantity: 1 });
    expect(line.unitPriceUSD).toBe(bono20.priceUSD);
  });

  it("rejects unknown products", () => {
    expect(() =>
      resolveCheckoutLine({ productId: "not-a-real-sku", quantity: 1 })
    ).toThrow(/Unknown product/);
  });

  it("rejects bad quantities", () => {
    expect(() =>
      resolveCheckoutLine({ productId: "bonomarlot", quantity: 0 })
    ).toThrow(/Invalid quantity/);
  });

  it("rejects empty carts", () => {
    expect(() => resolveCheckoutLines([])).toThrow(/Invalid or missing items/);
  });
});

describe("resolveCheckoutLinesWith (Firestore first, code fallback)", () => {
  const live: PriceableProduct = {
    id: "bonomarlot",
    name: "Bonomarlot",
    priceUSD: 70,
    variants: [
      { id: "20-count", name: "20 Capsules", priceUSD: 70 },
      { id: "60-count", name: "60 Capsules", priceUSD: 190 },
    ],
  };

  it("prefers the live (Firestore) price", async () => {
    const lines = await resolveCheckoutLinesWith(
      [
        { productId: "bonomarlot", size: "20", quantity: 1 },
        { productId: "bonomarlot", size: "60", quantity: 1 },
      ],
      async () => new Map([["bonomarlot", live]])
    );
    expect(lines.map((l) => l.unitPriceUSD)).toEqual([70, 190]);
  });

  it("falls back to the code catalog for products the lookup did not return", async () => {
    const lines = await resolveCheckoutLinesWith(
      [{ productId: "bonomarlot", size: "60", quantity: 1 }],
      async () => new Map()
    );
    expect(lines[0].unitPriceUSD).toBe(bono60.priceUSD);
  });

  it("falls back to the code catalog when the lookup throws", async () => {
    const lines = await resolveCheckoutLinesWith(
      [{ productId: "bonomarlot", size: "20", quantity: 3 }],
      async () => {
        throw new Error("firestore down");
      }
    );
    expect(lines[0].unitPriceUSD).toBe(bono20.priceUSD);
    expect(lines[0].quantity).toBe(3);
  });

  it("only asks the lookup for unique product ids", async () => {
    let asked: string[] = [];
    await resolveCheckoutLinesWith(
      [
        { productId: "bonomarlot", size: "20", quantity: 1 },
        { productId: "bonomarlot", size: "60", quantity: 1 },
        { productId: "cartalax", size: "20", quantity: 1 },
      ],
      async (ids) => {
        asked = ids;
        return new Map();
      }
    );
    expect(asked.sort()).toEqual(["bonomarlot", "cartalax"]);
  });

  it("still rejects invalid sizes for live products", async () => {
    await expect(
      resolveCheckoutLinesWith(
        [{ productId: "bonomarlot", size: "45", quantity: 1 }],
        async () => new Map([["bonomarlot", live]])
      )
    ).rejects.toThrow(CheckoutValidationError);
  });
});
