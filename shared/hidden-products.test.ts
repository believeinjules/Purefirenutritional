import { describe, expect, it } from "vitest";
import { HIDDEN_PRODUCT_IDS, isHiddenProduct } from "./hidden-products";
import { allProducts, products, getProductById } from "../client/src/data/products";
import { toPeppyProduct } from "./peppy/catalog";
import { firestoreDocToPriceable } from "../api/_lib/catalog";

describe("hidden products", () => {
  it("are dropped from the storefront catalog but kept in the full catalog", () => {
    for (const id of Array.from(HIDDEN_PRODUCT_IDS)) {
      expect(allProducts.some((p) => p.id === id), id).toBe(true);
      expect(products.some((p) => p.id === id), id).toBe(false);
      expect(getProductById(id), id).toBeUndefined();
    }
  });

  it("are not offered by Peppy or priceable from Firestore", () => {
    for (const p of allProducts.filter((x) => HIDDEN_PRODUCT_IDS.has(x.id))) {
      expect(toPeppyProduct(p as never), p.id).toBeNull();
      expect(firestoreDocToPriceable(p.id, p as never), p.id).toBeNull();
    }
  });

  it("honors hidden / active flags on any product", () => {
    expect(isHiddenProduct({ id: "endoluten", hidden: true })).toBe(true);
    expect(isHiddenProduct({ id: "endoluten", active: false })).toBe(true);
    expect(isHiddenProduct({ id: "endoluten" })).toBe(false);
  });
});
