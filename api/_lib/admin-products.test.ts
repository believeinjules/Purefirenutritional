import { describe, it, expect } from "vitest";
import {
  ProductValidationError,
  validateProductId,
  validateProductInput,
  validateProductPatch,
} from "./admin-products";
import { normalizeCustomer, normalizeOrder } from "./admin-list";

const base = {
  name: "Test Peptide",
  category: "PEPTIDE BIOREGULATORS",
  description: "desc",
  priceUSD: 49.99,
  priceEUR: 40,
  rating: 4.8,
  image: "/products/test.png",
  benefits: ["a", " ", "b"],
};

describe("validateProductInput", () => {
  it("builds a camelCase doc matching the seed shape", () => {
    const doc = validateProductInput(base);
    expect(doc.priceUSD).toBe(49.99);
    expect(doc.benefits).toEqual(["a", "b"]);
    expect(doc.sizes).toBe(1);
    expect(doc.variants).toEqual([]);
    expect(doc.in_stock).toBe(true);
    expect(doc).not.toHaveProperty("price_usd");
  });

  it("uses the first variant price when no base price is given", () => {
    const doc = validateProductInput({
      ...base,
      priceUSD: undefined,
      variants: [
        { id: "20-count", name: "20 Capsules", priceUSD: 58.99, priceEUR: 40 },
        { id: "60-count", name: "60 Capsules", priceUSD: 153.99, priceEUR: 120 },
      ],
    });
    expect(doc.priceUSD).toBe(58.99);
    expect(doc.sizes).toBe(2);
    expect(doc.variants[1]!.inStock).toBe(true);
  });

  it("rejects bad categories, prices, images and duplicate variants", () => {
    expect(() => validateProductInput({ ...base, category: "X" })).toThrow(ProductValidationError);
    expect(() => validateProductInput({ ...base, priceUSD: -1 })).toThrow(/priceUSD/);
    expect(() => validateProductInput({ ...base, image: "javascript:alert(1)" })).toThrow(/image/);
    expect(() =>
      validateProductInput({
        ...base,
        variants: [
          { id: "20-count", name: "A", priceUSD: 1 },
          { id: "20-count", name: "B", priceUSD: 2 },
        ],
      })
    ).toThrow(/Duplicate/);
    expect(() => validateProductInput({ ...base, name: " " })).toThrow(/name/);
  });
});

describe("validateProductPatch", () => {
  it("only returns provided fields and syncs sizes with variants", () => {
    const patch = validateProductPatch({
      priceUSD: "19.5",
      variants: [{ id: "20-count", name: "20 Capsules", priceUSD: 19.5 }],
    });
    expect(patch).toEqual({
      priceUSD: 19.5,
      variants: [
        {
          id: "20-count",
          name: "20 Capsules",
          priceUSD: 19.5,
          priceEUR: 0,
          image: null,
          imageAlt: null,
          inStock: true,
        },
      ],
      sizes: 1,
    });
  });

  it("allows clearing optional text with null", () => {
    expect(validateProductPatch({ image: null, usage: null })).toEqual({ image: null, usage: null });
  });

  it("rejects empty patches", () => {
    expect(() => validateProductPatch({})).toThrow(/No product fields/);
  });
});

describe("validateProductId", () => {
  it("accepts slugs and rejects paths", () => {
    expect(validateProductId("bonomarlot")).toBe("bonomarlot");
    expect(() => validateProductId("../orders/x")).toThrow();
    expect(() => validateProductId("Has Spaces")).toThrow();
  });
});

describe("admin list normalizers", () => {
  it("maps webhook camelCase customer totals to the admin shape", () => {
    expect(
      normalizeCustomer({ id: "a@b.co", email: "a@b.co", totalOrders: 2, totalSpent: 100.456 })
    ).toMatchObject({ email: "a@b.co", total_orders: 2, total_spent: 100.46, name: null });
  });

  it("fills safe defaults for orders", () => {
    const o = normalizeOrder({ id: "cs_1" });
    expect(o.order_number).toBe("cs_1");
    expect(o.total).toBe(0);
    expect(o.items).toEqual([]);
  });
});
