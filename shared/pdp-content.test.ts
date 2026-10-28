import { describe, expect, it } from "vitest";
import { PRODUCT_FACTS } from "./product-facts";
import { HIDDEN_PRODUCT_IDS } from "./hidden-products";
import { DISEASE_TERMS } from "./peppy/claims";
import { hasClaimLanguage, productMetaDescription } from "../client/src/lib/seo";

const WITH_PDP = Object.values(PRODUCT_FACTS).filter((f) => f.pdp && f.pdp.template !== "formula");
const FORMULA = Object.values(PRODUCT_FACTS).filter((f) => f.pdp?.template === "formula");
const BANNED = /\b(lifespan|life span|mortality|cancer\w*|tumou?r\w*|military|soldier\w*|cytamin\w*|gerontology\.ru|over 14|14\+|cures?|treats?)\b/i;

describe("full PDP copy (shared/product-facts.json → pdp)", () => {
  it("covers Glandokort and the other thin Khavinson pages", () => {
    for (const id of ["glandokort", "taxorest", "libidon", "chonluten", "ovagen", "pinealon"]) expect(PRODUCT_FACTS[id].pdp, id).toBeTruthy();
  });

  for (const f of WITH_PDP) {
    const p = f.pdp!;
    it(`${f.id}: template structure, compliant wording, verified directions only`, () => {
      expect(p.title).toMatch(new RegExp(`^${f.name} \\| .+ Peptide Bioregulator$`));
      expect(p.lineCode).toMatch(/^Khavinson Cyto(max|gen)® Peptide Complex/);
      expect(p.tags.length).toBeGreaterThanOrEqual(3);
      expect(p.tags.length).toBeLessThanOrEqual(4);
      expect(p.overview).toHaveLength(2);
      expect(p.interest.length).toBeGreaterThanOrEqual(3);
      expect(p.interestNote).toBe("These are areas of biological investigation, not guarantees of clinical benefit.");
      expect(p.faq.length).toBeGreaterThanOrEqual(4);
      expect(p.faq.length).toBeLessThanOrEqual(6);
      expect(p.safety).toMatch(/pregnan/i);
      expect(p.safety).toMatch(/allerg/i);
      expect(p.safety).toMatch(/healthcare professional/i);
      expect(p.disclaimer).toMatch(/Food and Drug Administration/);
      expect(p.metaDescription.length).toBeGreaterThanOrEqual(150);
      expect(p.metaDescription.length).toBeLessThanOrEqual(160);
      expect(productMetaDescription({ id: f.id, name: f.name })).toBe(p.metaDescription);
      expect(p.ingredients.slice(0, f.composition!.length)).toEqual(f.composition);
      expect(hasClaimLanguage(p.metaDescription), p.metaDescription).toBe(false);
      const verified = f.id === "endoluten" ? f.pepitaOverride!.text : f.manufacturerDirections.status === "verified" ? f.manufacturerDirections.text : null;
      expect(p.directions).toBe(verified ?? "Follow the directions on your package.");
      const copy = [p.title, p.lineCode, ...p.tags, ...p.overview, p.why, ...p.interest, ...p.differences, p.researchBackground, ...p.faq.flatMap((q) => [q.q, q.a]), p.metaDescription].join(" \n");
      expect(copy).not.toMatch(DISEASE_TERMS);
      expect(copy + p.safety).not.toMatch(BANNED);
      expect(copy).not.toMatch(/\d+\s*%/);
    });
  }

  it("Recommended Usage box: conflicting products say 'Follow the directions on your package.'; Endoluten keeps its storefront text", () => {
    for (const f of WITH_PDP) {
      if (f.id === "endoluten" || f.manufacturerDirections.status === "verified") continue;
      expect(f.pdp!.directions, f.id).toBe("Follow the directions on your package.");
    }
  });

  it("Ovagen keeps liver + GI; Pinealon is the brain peptide complex (AC-5)", () => {
    expect(PRODUCT_FACTS.ovagen.pdp!.overview.join(" ")).toMatch(/liver/i);
    expect(PRODUCT_FACTS.ovagen.pdp!.overview.join(" ")).toMatch(/digestive/i);
    expect(PRODUCT_FACTS.pinealon.pdp!.overview[0]).toMatch(/brain peptide complex \(AC-5\)/);
  });

  it("formula template covers every storefront product (the Indosine/Calsil-T holds are now hidden)", () => {
    const missing = Object.values(PRODUCT_FACTS).filter((f) => !f.pdp && !HIDDEN_PRODUCT_IDS.has(f.id)).map((f) => f.id).sort();
    expect(missing).toEqual([]);
  });

  for (const f of FORMULA) {
    const p = f.pdp!;
    it(`${f.id}: formula template, compliant wording, verified directions only`, () => {
      expect(p.overview.length).toBeGreaterThanOrEqual(1);
      // Prime Peptide Omega lists a single item by Regulatory Advisor decision (Merchant Center review, PR #66).
      expect(p.formulatedFor!.length).toBeGreaterThanOrEqual(f.id === "prime-peptide-omega" ? 1 : 3);
      expect(p.differences.length).toBeGreaterThanOrEqual(1);
      expect(p.ingredients.length).toBeGreaterThanOrEqual(1);
      expect(p.faq.length).toBeGreaterThanOrEqual(3);
      expect(p.faq.length).toBeLessThanOrEqual(5);
      expect(p.safety).toMatch(/pregnan/i);
      expect(p.safety).toMatch(/allerg/i);
      expect(p.safety).toMatch(/healthcare professional/i);
      expect(p.disclaimer).toMatch(/Food and Drug Administration/);
      expect(p.metaDescription.length).toBeGreaterThanOrEqual(150);
      expect(p.metaDescription.length).toBeLessThanOrEqual(160);
      expect(hasClaimLanguage(p.metaDescription), p.metaDescription).toBe(false);
      const verified = f.manufacturerDirections.status === "verified" ? f.manufacturerDirections.text : null;
      expect(p.directions).toBe(verified ?? "Follow the directions on your package.");
      const copy = [...p.overview, ...p.formulatedFor!, ...p.differences, ...p.ingredients, ...p.faq.flatMap((q) => [q.q, q.a]), p.metaDescription].join(" \n");
      expect(copy).not.toMatch(DISEASE_TERMS);
      expect(copy + p.safety).not.toMatch(BANNED);
      expect(copy).not.toMatch(/\d+\s*%|\d+x more/);
    });
  }
});
