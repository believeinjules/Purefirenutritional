import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { allProducts, getProductById } from "../client/src/data/products";
import { HIDDEN_PRODUCT_IDS, isHiddenProduct } from "./hidden-products";
import { firestoreDocToPriceable } from "../api/_lib/catalog";
import { getBatchByKey } from "./batches";

/** Mesotel Ultra: published 2026-11-19 with Julia's price and photos. */
describe("Mesotel Ultra", () => {
  const p = allProducts.find((x) => x.id === "mesotel-ultra");

  it("is in the catalog in the Mesotel line and category at $37.99", () => {
    expect(p).toBeDefined();
    expect(p!.name).toBe("Mesotel Ultra");
    expect(p!.category).toBe("ANTI AGING-LONGEVITY");
    expect(p!.priceUSD).toBe(37.99);
  });

  it("uses the manufacturer bottle-and-box render as the main image and the box cutout second", () => {
    expect(p!.image).toBe("/products/mesotel-ultra-main.jpg");
    expect(p!.imageAlt).toBe("Mesotel Ultra bottle and box, 120 ml");
    expect(p!.images).toEqual(["/products/mesotel-ultra-main.jpg", "/products/mesotel-ultra-box-front.webp"]);
    for (const src of p!.images!) expect(existsSync(`client/public${src}`), src).toBe(true);
  });

  it("is published: in the shop, priceable, and linked from its Batch Passport page", () => {
    expect(HIDDEN_PRODUCT_IDS.has("mesotel-ultra")).toBe(false);
    expect(getProductById("mesotel-ultra")).toBeDefined();
    expect(firestoreDocToPriceable("mesotel-ultra", p as never)?.priceUSD).toBe(37.99);
    expect(getBatchByKey("mesotel-ultra-001")?.catalogProductId).toBe("mesotel-ultra");
  });

  it("a visible product always has a real price and an existing photo", () => {
    for (const x of allProducts.filter((y) => !isHiddenProduct(y))) {
      const prices = x.variants?.length ? x.variants.map((v) => v.priceUSD) : [x.priceUSD];
      for (const price of prices) expect(price, x.id).toBeGreaterThan(0);
    }
    expect(p!.image && existsSync(`client/public${p!.image}`)).toBe(true);
  });
});
