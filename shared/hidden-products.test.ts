import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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

  it("are not offered by Pepita or priceable from Firestore", () => {
    for (const p of allProducts.filter((x) => HIDDEN_PRODUCT_IDS.has(x.id))) {
      expect(toPeppyProduct(p as never), p.id).toBeNull();
      expect(firestoreDocToPriceable(p.id, p as never), p.id).toBeNull();
    }
  });

  it("old product URLs redirect to /products (vercel.json), like the other hidden products", () => {
    const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as {
      redirects: Array<{ source: string; destination: string; permanent?: boolean }>;
    };
    const rule = vercel.redirects.find((r) => r.source.startsWith("/products/:id(") && r.destination === "/products");
    expect(rule).toBeDefined();
    const ids = rule!.source.match(/\(([^)]+)\)/)![1].split("|");
    for (const id of Array.from(HIDDEN_PRODUCT_IDS)) expect(ids, id).toContain(id);
  });

  it("Panaxod is hidden (off the shop, Pepita, pairings and similar products)", () => {
    expect(HIDDEN_PRODUCT_IDS.has("panaxod")).toBe(true);
    expect(getProductById("panaxod")).toBeUndefined();
  });

  it("honors hidden / active flags on any product", () => {
    expect(isHiddenProduct({ id: "endoluten", hidden: true })).toBe(true);
    expect(isHiddenProduct({ id: "endoluten", active: false })).toBe(true);
    expect(isHiddenProduct({ id: "endoluten" })).toBe(false);
  });
});
