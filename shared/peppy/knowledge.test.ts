/**
 * Integrity of the curated knowledge: every citation exists and is verbatim-sourced,
 * every product exists, and all copy passes the claim filters.
 */
import { describe, expect, it } from "vitest";
import { products } from "../../client/src/data/products";
import {
  BANNED_TERMS,
  isCompliantEvidenceNote,
  isCompliantProductCopy,
  sanitizeAnswerProse,
} from "./claims";
import { buildCatalog } from "./catalog";
import {
  RESEARCH_REGISTRY,
  SCIENCE_PAGE_PMIDS_EXCLUDED,
} from "./research-registry";
import { PRODUCT_EVIDENCE, TOPICS } from "./topics";

const catalog = buildCatalog(products as never);
const registryIds = new Set(RESEARCH_REGISTRY.map(s => s.id));
const names = products.map(p => p.name);

describe("research registry", () => {
  it("has unique ids and well-formed PubMed / authority entries", () => {
    expect(registryIds.size).toBe(RESEARCH_REGISTRY.length);
    for (const s of RESEARCH_REGISTRY) {
      expect(s.finding, s.id).toBeTruthy();
      expect(s.limitation, s.id).toBeTruthy();
      expect(s.title.length, s.id).toBeGreaterThan(3);
      if (s.kind === "pubmed") {
        expect(s.id).toBe(`pmid:${s.pmid}`);
        expect(s.url).toBe(`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`);
      } else {
        expect(s.id.startsWith("ref:")).toBe(true);
        expect(s.url).toMatch(
          /^https:\/\/(www\.)?(nccih\.nih\.gov|ods\.od\.nih\.gov|medlineplus\.gov|www\.fda\.gov|fda\.gov|nei\.nih\.gov|www\.nei\.nih\.gov|niams\.nih\.gov|www\.niams\.nih\.gov)\//
        );
      }
    }
  });
  it("never includes the mismatched /science page PMIDs", () => {
    for (const pmid of SCIENCE_PAGE_PMIDS_EXCLUDED)
      expect(registryIds.has(`pmid:${pmid}`)).toBe(false);
  });
  it("our own finding/limitation copy has no banned terms (titles stay verbatim)", () => {
    for (const s of RESEARCH_REGISTRY) {
      expect(BANNED_TERMS.test(s.finding ?? ""), s.id).toBe(false);
      expect(BANNED_TERMS.test(s.limitation ?? ""), s.id).toBe(false);
    }
  });
});

describe("topics", () => {
  it("cite only registry sources and map only to real products", () => {
    for (const t of TOPICS) {
      for (const id of t.sourceIds)
        expect(registryIds.has(id), `${t.id} → ${id}`).toBe(true);
      for (const p of t.products)
        expect(catalog.has(p.id), `${t.id} → ${p.id}`).toBe(true);
    }
    for (const [id, ev] of Object.entries(PRODUCT_EVIDENCE)) {
      expect(catalog.has(id), id).toBe(true);
      for (const s of ev.sourceIds)
        expect(registryIds.has(s), `${id} → ${s}`).toBe(true);
    }
  });
  it("product lines are structure/function only", () => {
    for (const t of TOPICS)
      for (const p of t.products) {
        expect(isCompliantProductCopy(p.why), `${t.id}/${p.id}: ${p.why}`).toBe(
          true
        );
        expect(
          isCompliantEvidenceNote(p.evidenceNote),
          `${t.id}/${p.id}: ${p.evidenceNote}`
        ).toBe(true);
      }
  });
  it("prose never ties a product to a disease and never uses banned terms", () => {
    for (const t of TOPICS) {
      for (const text of [
        t.summary,
        ...t.sections.map(s => s.body),
        t.evidenceNote ?? "",
      ]) {
        expect(BANNED_TERMS.test(text), t.id).toBe(false);
        expect(
          sanitizeAnswerProse(text, names).removed,
          `${t.id}: ${text.slice(0, 80)}`
        ).toBe(0);
      }
      expect(t.followUps.length).toBeLessThanOrEqual(3);
      if (t.productPolicy === "never") expect(t.products).toEqual([]);
    }
  });
  it("keeps the corrected SKU mappings (no men's formula for brain health)", () => {
    const brain = TOPICS.find(t => t.id === "brain")!;
    expect(brain.products.map(p => p.id)).not.toContain("revilab-ml-07");
  });
});

describe("safety responses", () => {
  it("cite only registry sources and pass the claim sanitiser", async () => {
    const safety = await import("./safety");
    const endoluten = catalog.get("endoluten")!;
    const vladonix = catalog.get("vladonix")!;
    const parts = [
      ...(
        [
          "cardiac",
          "stroke",
          "breathing",
          "allergy",
          "overdose",
          "crisis",
          "bleeding",
          "neuro",
        ] as const
      ).map(k => safety.urgentResponse(k)),
      safety.pregnancyResponse(),
      safety.pediatricResponse(),
      safety.diseaseResponse("Can peptides cure my diabetes?"),
      safety.diseaseResponse("can this treat my condition"),
      safety.drugReplacementResponse(),
      safety.bloodThinnerResponse(catalog, [endoluten]),
      safety.combinationResponse("Can I take Endoluten with melatonin?", [
        endoluten,
      ]),
      safety.combinationResponse("Is Vladonix ok with alcohol?", [vladonix]),
      safety.combinationResponse(
        "Can I take Endoluten and Vladonix together?",
        [endoluten, vladonix]
      ),
      safety.medicationsResponse([endoluten]),
      safety.sideEffectsResponse([vladonix]),
    ];
    for (const p of parts) {
      for (const id of p.sourceIds) expect(registryIds.has(id), id).toBe(true);
      for (const text of [p.summary, ...p.sections.map(s => s.body)]) {
        expect(BANNED_TERMS.test(text)).toBe(false);
        expect(
          sanitizeAnswerProse(text, names).removed,
          text.slice(0, 100)
        ).toBe(0);
      }
    }
  });
});
