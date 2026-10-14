/**
 * Gold runner (v11): every case in pepita-gold.json through the real pipeline (answerPeppy, no LLM).
 * Checks word budgets, card counts and eligibility, sold-only cards, follow-up/chip counts, citations,
 * expandable details (collapsed by default: the payload never pre-opens anything), red-flag ordering,
 * no directions in L1 text unless asked, and the Endoluten Pepita-only direction exception.
 */
import { describe, expect, it } from "vitest";
import { products } from "../../client/src/data/products";
import { buildCatalog } from "./catalog";
import { answerPeppy } from "./respond";
import GOLDSET from "./pepita-gold.json";
import { GOLD, L1_MAX_WORDS, L3_MAX_WORDS, RELEVANCE_MAX_WORDS, wordCount } from "./gold";
import { getProductFacts, pepitaDirections } from "../product-facts";
import { CONSULT_LINE } from "./product-notes";
import { DISEASE_TERMS } from "./claims";

interface Case {
  question: string; gold: string; eligibleProducts: string[]; expectedShortAnswer?: string;
  followUps: number; minCitations: number; expandable?: "protocol" | "learnMore"; safety?: "medical-first" | "medical-first-products" | "urgent"; mustNotContain?: string;
  dosingFacts?: { dose: string; timing: string; course: string };
}
const CASES = (GOLDSET as { cases: Case[] }).cases;
const catalog = buildCatalog(products as never);
const DIRECTIONS = /\b(\d+(?:–\d+)?\s*(capsules?|drops?|tablets?|teaspoons?)|times a day|every \d+ days|once a day)\b/i;

describe("Pepita gold set", () => {
  it("the consult line is exact", () => expect(CONSULT_LINE).toBe("Please consult with a medical/healthcare professional."));

  it("has 40–50 cases covering every gold answer", () => {
    expect(CASES.length).toBeGreaterThanOrEqual(40);
    expect(CASES.length).toBeLessThanOrEqual(50);
    for (const g of GOLD) expect(CASES.some(c => c.gold === g.id), g.id).toBe(true);
  });

  for (const c of CASES) {
    it(`${c.gold}: "${c.question}"`, async () => {
      const { response: r } = await answerPeppy({ message: c.question }, { catalog });
      const ids = r.products.map(p => p.product.id);
      expect(r.gold, "routed to gold answer").toBe(c.gold);
      // Word budgets (generated text only; cards/controls excluded).
      const budget = r.level === "deep" ? L3_MAX_WORDS : L1_MAX_WORDS;
      expect(wordCount(r.summary), `${wordCount(r.summary)} words`).toBeLessThanOrEqual(budget);
      // Cards: 0–3, eligible, sold, short relevance line.
      expect(ids.length).toBeLessThanOrEqual(3);
      for (const id of ids) {
        expect(c.eligibleProducts, id).toContain(id);
        expect(catalog.has(id), `${id} sold`).toBe(true);
      }
      if (c.eligibleProducts.length) expect(ids).toEqual(c.eligibleProducts.filter(id => catalog.has(id)));
      for (const p of r.products) expect(wordCount(p.why), p.why).toBeLessThanOrEqual(RELEVANCE_MAX_WORDS);
      // Follow-ups: 0–2 contextual questions, no generic chips.
      expect(r.followUps.length).toBe(c.followUps);
      expect(r.followUps.length).toBeLessThanOrEqual(2);
      expect(r.suggestions).toEqual([]);
      // Substantive answer: the UI opens with the consult line and closes with the health footer.
      expect(r.showDisclaimer || r.mode === "urgent").toBe(true);
      expect(r.summary).not.toMatch(/consult (with )?a (medical|healthcare)|not medical advice/i);
      // Dosing: verified facts block (rendered before any card).
      if (c.dosingFacts) {
        expect(r.dosingFacts).toMatchObject(c.dosingFacts);
        expect(r.summary).not.toMatch(DIRECTIONS);
      }
      // Citations ≤2 in L1, at least the minimum.
      expect(r.research.length).toBeLessThanOrEqual(2);
      expect(r.research.length).toBeGreaterThanOrEqual(c.minCitations);
      if (c.expectedShortAnswer) expect(r.summary).toMatch(new RegExp(c.expectedShortAnswer));
      if (c.mustNotContain) expect(r.summary).not.toMatch(new RegExp(c.mustNotContain, "i"));
      // No directions in the main text unless the question asked for them.
      if (!/dos|how (do|much|often)|take endoluten/i.test(c.question) && r.level === "show") expect(r.summary).not.toMatch(DIRECTIONS);
      // Expandable details exist but nothing is pre-opened (the payload has no open state; the UI opens on tap).
      if (c.expandable === "protocol") {
        expect(r.protocols?.length).toBeGreaterThan(0);
        for (const pr of r.protocols!) {
          expect(pr.phases.length).toBeGreaterThan(1);
          expect(pr.source).toMatch(/Complex application of products/);
          expect(pr.note).toMatch(/^Manufacturer-published educational reference, not a clinically validated regimen/);
          expect(pr.includes.length).toBeGreaterThan(0);
        }
      }
      if (c.expandable === "learnMore") expect(r.learnMore?.length).toBeGreaterThan(0);
      expect(JSON.stringify(r)).not.toMatch(/"(open|expanded|defaultOpen)":\s*true/);
      // Red flags: medical advice first, no cards (vertigo: medical guidance first, then compact rows).
      if (c.safety) {
        if (c.safety !== "medical-first-products") expect(ids).toEqual([]);
        expect(r.safety?.level).toBe(c.safety === "urgent" ? "urgent" : "caution");
        expect(r.summary.slice(0, 120)).toMatch(/doctor|medical|911|healthcare provider/i);
      }
      // Text never ties a product to disease terms.
      if (ids.length) expect(r.summary).not.toMatch(new RegExp(DISEASE_TERMS.source, "i"));
    });
  }

  const proto = async (q: string, id: string) => (await answerPeppy({ message: q }, { catalog })).response.protocols!.find(p => p.id === id)!;

  it("heart course follows Julia's brief, with every difference from the PDF flagged", async () => {
    const pr = await proto("Show me the full four-month course", "cardio-4-month");
    const names = pr.phases.map(ph => ph.items.map(i => i.name));
    expect(names).toEqual([["Revilab SL 01", "Revilab SL 03"], ["Revilab ML 04", "Ventfort", "Chelohart", "Olecap"], ["Olecap"], ["Canacor", "Vedomir"]]);
    for (const ph of pr.phases) expect(ph.discrepancy, ph.label).toMatch(/source's month/);
    const item = (n: string, m: number) => pr.phases[m].items.find(i => i.name === n)!;
    expect(item("Chelohart", 1).discrepancy).toMatch(/p\. 6.*month 3/);
    expect(item("Olecap", 1).discrepancy).toMatch(/month 4/);
    expect(item("Olecap", 2).discrepancy).toMatch(/month 4/);
    const ved = item("Vedomir", 3);
    expect(ved.notFound).toBe(true);
    expect(ved.discrepancy).toMatch(/^Not found in the source documents/);
    // "or" alternative stated by the source, never a silent substitution.
    expect(item("Ventfort", 1).orWith?.map(o => o.name)).toEqual(["Vesugen"]);
    expect(item("Ventfort", 1).sourceDirections).toMatch(/either one/);
    // Unsold items preserved and labeled (no card).
    for (const n of ["Olecap", "Canacor", "Vedomir"]) expect(pr.phases.flatMap(p => p.items).find(i => i.name === n)!.sold, n).toBe(false);
    expect(item("Revilab SL 01", 0).sold).toBe(true);
    // Per-item dosing from the manufacturer label when verified.
    expect(item("Revilab SL 01", 0).labelDirections).toBe(pepitaDirections("revilab-sl-01"));
    expect(item("Revilab ML 04", 1).labelDirections).toMatch(/1 capsule once a day/);
  });

  it("menopause course: SL 10 month 1, ML 08 month 2, differences from p. 62 flagged", async () => {
    const pr = await proto("Show me the menopause course", "menopause-2-month");
    expect(pr.phases.map(ph => ph.items.map(i => i.productId))).toEqual([["revilab-sl-10"], ["revilab-ml-08"]]);
    expect(pr.phases[0].items[0].discrepancy).toMatch(/months 3–4/);
    expect(pr.phases[1].items[0].discrepancy).toMatch(/months 1–2/);
    expect(pr.phases[0].discrepancy).toMatch(/p\. 64/);
  });

  it("heart + menopause question returns both courses", async () => {
    const { response: r } = await answerPeppy({ message: "What's the recommended protocol for heart and menopause support?" }, { catalog });
    expect(r.protocols!.map(p => p.id)).toEqual(["cardio-4-month", "menopause-2-month"]);
    expect(r.products).toEqual([]);
  });

  it("protocol items marked sold only when they are in the catalog", async () => {
    for (const q of ["Show me the full four-month course", "Show me the menopause course", "preventive cardiovascular protocol"]) {
      const { response: r } = await answerPeppy({ message: q }, { catalog });
      for (const ph of r.protocols!.flatMap(p => p.phases)) for (const it of ph.items) expect(!!it.sold, it.name).toBe(!!(it.productId && catalog.has(it.productId)));
    }
  });

  it("Endoluten: Pepita states the definitive directions; storefront page text unchanged (known exception)", async () => {
    const { response: r } = await answerPeppy({ message: "How do I take Endoluten?" }, { catalog });
    expect(r.dosingFacts).toMatchObject({ dose: "1 capsule every 3 days", timing: "In the morning or at midday", course: "20 days to 2 months" });
    expect(r.summary).not.toMatch(/daily dose|sources differ|check (the|your) package/i);
    expect(r.products.map(p => p.product.id)).toEqual(["endoluten"]);
    expect(pepitaDirections("endoluten")).toBe("Adults: 1 capsule every 3 days, in the morning or at midday. Course: 20 days to 2 months.");
    expect(products.find(p => p.id === "endoluten")!.usage).toBe(getProductFacts("endoluten")!.storefrontUsage.text);
  });

  it("v13 mockup layouts: dosing, protocol, symptom", async () => {
    const ask = async (q: string) => (await answerPeppy({ message: q }, { catalog })).response;
    const e = await ask("How do I take Endoluten?");
    expect(e.layout).toBe("dosing");
    expect(e.accordions!.map(a => a.title)).toEqual(["What is Endoluten?", "Research and potential benefits", "Safety and considerations"]);
    expect(e.research.length).toBeGreaterThan(0); // → "References (n)"
    const v = await ask("What can help with vertigo and feeling off balance?");
    expect(v.layout).toBe("symptom");
    expect(v.accordions!.map(a => a.title)).toEqual(["Common causes of vertigo", "How these peptides may help", "When to see a doctor"]);
    expect(v.supportive!.length).toBeGreaterThanOrEqual(3);
    expect(v.summary).toMatch(/^Vertigo and balance problems have many causes/);
    const sl = await ask("I can't sleep well");
    expect(sl.layout).toBe("symptom");
    const h = await ask("What's the recommended protocol for heart and menopause support?");
    expect(h.layout).toBe("protocol");
  });
});
