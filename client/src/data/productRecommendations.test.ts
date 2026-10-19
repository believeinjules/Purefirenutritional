import { describe, it, expect } from "vitest";
import { productRecommendations, getRecommendations } from "./productRecommendations";
import { allProducts, getProductById } from "./products";
import { biologicalGroups, getSimilarProducts } from "@/lib/similarProducts";

/**
 * Pairings that cross body systems on purpose; each is backed by the products'
 * own descriptions (e.g. Vladonix: "commonly paired with Endoluten").
 */
const CROSS_SYSTEM_OK = new Set([
  "anti-wrinkle-serum-7>revilab-anti-age",
  "revilab-anti-age>anti-wrinkle-serum-7",
  "revilab-anti-age>endoluten",
  "endoluten>vladonix",
  "endoluten>revilab-anti-age",
  "vladonix>endoluten",
  "thyreogen>ventfort", // Thyreogen: "female hormonal protocol: Zhenoluten + Thyreogen + Ventfort"
  // Prime Peptide Collagen: "skin, hair, nail, and connective tissue support"
  "cartalax>prime-peptide-collagen",
  "prime-peptide-joints>prime-peptide-collagen",
  "revilab-ml-09>prime-peptide-collagen",
  "panaxod>levain", // Panaxod / Levain: adaptogen with immune support
  "panaxod>revilab-ml-02",
]);

describe("Frequently Bought Together data", () => {
  const entries = Object.entries(productRecommendations);

  it("every source is a catalog product and every companion is on the storefront", () => {
    for (const [id, recs] of entries) {
      expect(allProducts.some((p) => p.id === id), id).toBe(true);
      expect(recs.length, id).toBeGreaterThan(0);
      for (const r of recs) {
        expect(getProductById(r.productId), `${id} -> ${r.productId}`).toBeDefined();
        expect(r.productId).not.toBe(id);
      }
      expect(new Set(recs.map((r) => r.productId)).size, id).toBe(recs.length);
    }
  });

  it("companions share a body system with the product unless the pairing is a documented cross-system one", () => {
    for (const [id, recs] of entries) {
      if (!getProductById(id)) continue; // hidden source (no product page)
      const mine = biologicalGroups(id);
      for (const r of recs) {
        const shared = biologicalGroups(r.productId).filter((g) => mine.includes(g));
        if (CROSS_SYSTEM_OK.has(`${id}>${r.productId}`)) continue;
        expect(shared, `${id} -> ${r.productId} (${mine.join(",")} vs ${biologicalGroups(r.productId).join(",")})`).not.toEqual([]);
      }
    }
  });

  it("Revilab ML 07 is paired and labelled as the male reproductive/urinary formula it is", () => {
    const ml07 = getProductById("revilab-ml-07")!;
    expect(ml07.description).toMatch(/^Male reproductive and urinary system support formula/);
    const asCompanion = entries.flatMap(([, recs]) => recs.filter((r) => r.productId === "revilab-ml-07"));
    expect(asCompanion.length).toBeGreaterThan(0);
    for (const r of asCompanion) expect(r.reason).toMatch(/male reproductive/i);
    expect(getRecommendations("revilab-ml-07").map((r) => r.productId)).toEqual(["testoluten", "revilab-sl-09"]);
    expect(entries.some(([, recs]) => recs.some((r) => /brain/i.test(r.reason ?? "") && r.productId === "revilab-ml-07"))).toBe(false);
  });

  it("Prime Peptide Brain is paired with brain peptide bioregulators Pure Fire sells", () => {
    const recs = getRecommendations("prime-peptide-brain");
    expect(recs.map((r) => r.productId)).toEqual(["cerluten", "pinealon"]);
    for (const r of recs) {
      const p = getProductById(r.productId)!;
      expect(p.priceUSD).toBeGreaterThan(0);
      expect(p.description).toMatch(/brain peptide complex/);
      expect(biologicalGroups(r.productId)).toContain("brain");
    }
  });
});

describe("Similar Products labels", () => {
  it("GPL Man is grouped with male products, not the female GPL formula", () => {
    expect(biologicalGroups("gpl-man")).toContain("male");
    const ids = getSimilarProducts("gpl-man").map((p) => p.id);
    expect(ids).not.toContain("gpl-femme");
    expect(ids.some((id) => ["testoluten", "libidon", "revilab-ml-07", "revilab-sl-09"].includes(id))).toBe(true);
  });
});
