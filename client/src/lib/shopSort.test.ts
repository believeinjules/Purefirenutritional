import { describe, expect, it } from "vitest";
import { HIDDEN_PRODUCT_IDS } from "@shared/hidden-products";
import { isKhavinsonAuthorizedProduct } from "@/data/retailerAuthorization";
import { products } from "@/data/products";
import { sortProducts } from "./shopSort";

describe("shop default sort", () => {
  const visible = products.filter((p) => !HIDDEN_PRODUCT_IDS.has(p.id));

  it("featured puts the Khavinson authorized line first, A–Z inside each group", () => {
    const sorted = sortProducts(visible, "featured");
    expect(sorted.map((p) => p.id)).not.toEqual(sortProducts(visible, "name-asc").map((p) => p.id));
    const firstNon = sorted.findIndex((p) => !isKhavinsonAuthorizedProduct(p.id));
    expect(firstNon).toBeGreaterThan(0);
    const khavinson = sorted.slice(0, firstNon);
    const rest = sorted.slice(firstNon);
    expect(khavinson.every((p) => isKhavinsonAuthorizedProduct(p.id))).toBe(true);
    expect(rest.every((p) => !isKhavinsonAuthorizedProduct(p.id))).toBe(true);
    expect(khavinson.map((p) => p.name)).toEqual([...khavinson].map((p) => p.name).sort((a, b) => a.localeCompare(b)));
    expect(rest.map((p) => p.name)).toEqual([...rest].map((p) => p.name).sort((a, b) => a.localeCompare(b)));
    expect(sorted.some((p) => HIDDEN_PRODUCT_IDS.has(p.id))).toBe(false);
  });

  it("keeps A–Z, price and rating as selectable sorts", () => {
    const az = sortProducts(visible, "name-asc");
    expect(az.map((p) => p.name)).toEqual([...visible].map((p) => p.name).sort((a, b) => a.localeCompare(b)));
    const za = sortProducts(visible, "name-desc");
    expect(za[0].name.localeCompare(za[za.length - 1].name)).toBeGreaterThan(0);
    const cheap = sortProducts(visible, "price-asc");
    expect(cheap[0].priceUSD).toBeLessThanOrEqual(cheap[cheap.length - 1].priceUSD);
  });
});
