import { describe, expect, it } from "vitest";
import { allProducts, products } from "../client/src/data/products";
import DATA from "./peppy/product-data.json";
import { buildCatalog } from "./peppy/catalog";
import { DISEASE_TERMS } from "./peppy/claims";
import { PEPITA_DIRECTION_EXCEPTIONS, PRODUCT_FACTS, getProductFacts, pepitaDirections } from "./product-facts";
import type { ProductDataRecord } from "./peppy/product-data";

const RECORDS = DATA.products as unknown as ProductDataRecord[];

describe("one product-data source: storefront and Pepita cannot drift", () => {
  it("every catalog product has a facts record", () => {
    for (const p of allProducts) expect(PRODUCT_FACTS[p.id], p.id).toBeTruthy();
  });

  it("storefront usage and ingredients (PDP, cards, Firestore seed) come from the facts file", () => {
    // api/admin/seed-products.ts imports this same `products` export, so the seed carries these values.
    for (const p of allProducts) {
      const f = getProductFacts(p.id)!;
      expect(p.usage ?? null, p.id).toBe(f.storefrontUsage.text);
      expect(p.ingredients ?? null, p.id).toEqual(f.composition);
    }
  });

  it("Pepita states directions only when verified, and then exactly the product-page text", () => {
    for (const r of RECORDS) {
      const store = products.find(p => p.id === r.id)!;
      const allowed = pepitaDirections(r.id);
      if (PEPITA_DIRECTION_EXCEPTIONS.includes(r.id)) {
        // Known, intentional exception (pending Julia): Pepita states the override, the page keeps its text.
        expect(r.labelDirections.value, r.id).toBe(getProductFacts(r.id)!.pepitaOverride!.text);
        expect(store.usage ?? null, r.id).toBe(getProductFacts(r.id)!.storefrontUsage.text);
      } else if (r.labelDirections.status === "verified") {
        expect(allowed, r.id).not.toBeNull();
        expect(r.labelDirections.value, r.id).toBe(store.usage);
      } else {
        expect(allowed, r.id).toBeNull();
        expect(r.schedules.some(s => s.protocolType === "label"), r.id).toBe(false);
      }
      const f = getProductFacts(r.id)!;
      if (f.composition?.length) expect(r.ingredients.value, r.id).toBe(f.composition.join("; "));
    }
  });

  it("Pepita's product payload carries the same usage as the storefront", () => {
    const catalog = buildCatalog(products as never);
    for (const p of products) {
      const c = catalog.get(p.id);
      if (!c || !p.usage || PEPITA_DIRECTION_EXCEPTIONS.includes(p.id)) continue;
      // catalog.ts drops disease-term sentences; otherwise identical.
      expect(p.usage.startsWith(c.usage ?? ""), p.id).toBe(true);
    }
  });

  it("holds stay blocked with their sources recorded; conflicts are flagged, not picked", () => {
    for (const id of ["endoluten", "indosine", "calsil-t"]) {
      const f = getProductFacts(id)!;
      expect(f.verificationStatus, id).toBe("blocked");
      expect(f.hold, id).toBeTruthy();
      if (id === "endoluten") expect(pepitaDirections(id)).toMatch(/^Adults: 1 capsule every 3 days, in the morning or at midday\. Course: 20 days to 2 months\.$/);
      else expect(pepitaDirections(id), id).toBeNull();
    }
    expect(getProductFacts("endoluten")!.manufacturerDirections.options).toHaveLength(2);
    for (const f of Object.values(PRODUCT_FACTS))
      if (f.manufacturerDirections.status === "conflicting") expect(pepitaDirections(f.id), f.id).toBeNull();
  });

  it("the only storefront/Pepita direction exception is Endoluten (Pepita only, pending Julia)", () => {
    expect(PEPITA_DIRECTION_EXCEPTIONS).toEqual(["endoluten"]);
    const f = getProductFacts("endoluten")!;
    expect(f.pepitaOverride!.source).toMatch(/peptid\.ru/);
    expect(f.pepitaOverride!.exception).toMatch(/intentional exception/i);
    const page = allProducts.find(p => p.id === "endoluten")!.usage ?? "";
    expect(page).not.toMatch(/every 3 days/);
    const catalog = buildCatalog(products as never);
    expect(catalog.get("endoluten")!.usage).toMatch(/1 capsule every 3 days/);
  });

  it("alternative protocols are never the label and come from course documents", () => {
    for (const f of Object.values(PRODUCT_FACTS))
      for (const a of f.alternativeProtocols) {
        expect(a.text).not.toBe(f.storefrontUsage.text);
        expect(f.sources.some(s => s.url === a.source && s.type === "course"), f.id).toBe(true);
      }
  });

  it("no disease or treatment terms in storefront usage or ingredients", () => {
    for (const p of products) {
      expect(p.usage ?? "", p.id).not.toMatch(DISEASE_TERMS);
      for (const i of p.ingredients ?? []) expect(i, p.id).not.toMatch(DISEASE_TERMS);
    }
  });

  it("approved corrections are in place", () => {
    const get = (id: string) => products.find(p => p.id === id)!;
    expect(get("ovagen").description).toMatch(/digestive tract/);
    expect(get("pinealon").description).toMatch(/brain peptide complex \(AC-5/);
    expect(get("pinealon").description).not.toMatch(/EDR/);
    for (const s of ["brain", "collagen", "joints", "omega", "protect"]) expect(get(`prime-peptide-${s}`).usage).toMatch(/3 times a day/);
    expect(get("revifort").ingredients).toContain("Sodium selenite");
    expect(get("revifort").usage).toMatch(/break of at least 10 days/);
    expect(get("ensil").ingredients).toContain("Biotin");
    expect(get("revilab-sl-07").ingredients?.join()).toMatch(/Folic acid/);
    expect(get("revilab-sl-07").ingredients?.join()).not.toMatch(/thiamine/i);
    for (const id of ["ovagen", "pinealon", "chonluten", "taxorest", "glandokort", "libidon"]) expect(get(id).usage, id).toBeUndefined();
  });
});
