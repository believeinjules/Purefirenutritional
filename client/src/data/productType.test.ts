import { describe, it, expect } from "vitest";
import { PRODUCT_FACTS } from "@shared/product-facts";
import { HIDDEN_PRODUCT_IDS } from "@shared/hidden-products";
import { products, getProductById } from "./products";
import {
  NEEDS_CONFIRMATION,
  SHARED_COMPLEXES,
  compareLine,
  compareLineText,
  counterpartsFor,
  isPrimePeptide,
  productTypeFor,
} from "./productType";
import { EXPLAINER_PARAGRAPHS } from "@/components/shop/ProductTypeParts";

const names = (id: string) => getProductById(id)?.name;
const NEVER_SURFACED = ["calsil-t", "indosine", "panaxod"];
// Disease / treatment wording that must not appear in new copy.
const BANNED = /\b(chemo\w*|radiother\w*|radiation|cancer|tumou?r|oncolog\w*|disease|cure[sd]?|treat\w*|heal(s|ed|ing)?|prevent\w*|diagnos\w*|therap\w*|anemi\w*|leuk\w*)\b/i;

describe("product type map", () => {
  it("every SHARED_COMPLEXES entry quotes the product's own composition (shared/product-facts.json)", () => {
    for (const c of SHARED_COMPLEXES) {
      for (const [id, quoted] of [...Object.entries(c.targeted), ...Object.entries(c.broad)]) {
        expect(PRODUCT_FACTS[id]?.composition ?? [], `${id}: "${quoted}"`).toContain(quoted);
      }
      for (const id of Object.keys(c.targeted)) expect(productTypeFor(id), id).toBe("targeted");
      for (const id of Object.keys(c.broad)) expect(productTypeFor(id), id).toBe("broad-spectrum");
    }
  });

  it("every mapped counterpart is a live storefront product", () => {
    for (const p of products) {
      for (const c of counterpartsFor(p.id)) expect(getProductById(c.id), `${p.id} -> ${c.id}`).toBeDefined();
    }
  });

  it("never tags or links hidden products (Calsil-T, Indosine, Panaxod and the rest)", () => {
    for (const id of [...HIDDEN_PRODUCT_IDS, ...NEVER_SURFACED]) {
      expect(productTypeFor(id)).toBeUndefined();
      expect(counterpartsFor(id)).toEqual([]);
    }
    const mapped = SHARED_COMPLEXES.flatMap((c) => [...Object.keys(c.targeted), ...Object.keys(c.broad)]);
    for (const id of mapped) expect(HIDDEN_PRODUCT_IDS.has(id), id).toBe(false);
    for (const p of products) {
      for (const c of counterpartsFor(p.id)) expect(NEVER_SURFACED).not.toContain(c.id);
    }
  });

  it("Prime Peptide products get the Broad-spectrum tag but no compare line", () => {
    const prime = products.filter((p) => isPrimePeptide(p.id));
    expect(prime.length).toBeGreaterThan(0);
    for (const p of prime) {
      expect(productTypeFor(p.id)).toBe("broad-spectrum");
      expect(compareLine(p.id, names)).toBeNull();
    }
    for (const c of SHARED_COMPLEXES) {
      for (const id of [...Object.keys(c.targeted), ...Object.keys(c.broad)]) expect(isPrimePeptide(id), id).toBe(false);
    }
  });

  it("needs-confirmation products have no compare line", () => {
    for (const id of Object.keys(NEEDS_CONFIRMATION)) {
      expect(productTypeFor(id), id).toBe("targeted");
      expect(compareLine(id, names), id).toBeNull();
    }
  });

  it("Bonomarlot and Revilab ML 02 point at each other", () => {
    expect(counterpartsFor("bonomarlot").map((c) => c.id)).toEqual(["revilab-ml-02", "revilab-sl-07"]);
    expect(counterpartsFor("revilab-ml-02").map((c) => c.id)).toContain("bonomarlot");
  });

  it("new copy uses no disease/treatment wording", () => {
    for (const p of products) {
      const text = compareLineText(p.id, names);
      if (text) expect(text, p.id).not.toMatch(BANNED);
    }
    expect(EXPLAINER_PARAGRAPHS.join(" ")).not.toMatch(BANNED);
  });
});
