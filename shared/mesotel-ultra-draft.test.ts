import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { allProducts, getProductById } from "../client/src/data/products";
import { HIDDEN_PRODUCT_IDS, isHiddenProduct } from "./hidden-products";
import { firestoreDocToPriceable } from "../api/_lib/catalog";

/**
 * Mesotel Ultra is drafted in the code catalog (Julia, 2026-11-19) but stays
 * hidden until she supplies a photo. These checks make it impossible to
 * publish it by accident without a real price and image.
 */
describe("Mesotel Ultra draft", () => {
  const p = allProducts.find((x) => x.id === "mesotel-ultra");

  it("exists in the full catalog in the Mesotel line and category", () => {
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

  it("is hidden: not in the shop, not on a product page, not chargeable", () => {
    expect(HIDDEN_PRODUCT_IDS.has("mesotel-ultra")).toBe(true);
    expect(getProductById("mesotel-ultra")).toBeUndefined();
    // Even if a Firestore doc says hidden:false, the id list wins.
    expect(isHiddenProduct({ id: "mesotel-ultra", hidden: false, active: true })).toBe(true);
    expect(firestoreDocToPriceable("mesotel-ultra", { ...p, hidden: false } as never)).toBeNull();
  });

  it("can only be un-hidden with a real price and an existing photo", () => {
    if (isHiddenProduct(p)) return;
    expect(p!.priceUSD).toBeGreaterThan(0);
    expect(p!.image, "Mesotel Ultra needs a photo before it is published").toBeTruthy();
    expect(existsSync(`client/public${p!.image}`)).toBe(true);
  });

  it("no visible product is ever priced at 0", () => {
    for (const x of allProducts.filter((y) => !isHiddenProduct(y))) {
      const prices = x.variants?.length ? x.variants.map((v) => v.priceUSD) : [x.priceUSD];
      for (const price of prices) expect(price, x.id).toBeGreaterThan(0);
    }
  });
});
