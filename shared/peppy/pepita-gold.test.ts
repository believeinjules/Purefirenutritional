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
import { DISEASE_TERMS } from "./claims";

interface Case {
  question: string; gold: string; eligibleProducts: string[]; expectedShortAnswer?: string;
  followUps: number; minCitations: number; expandable?: "protocol" | "learnMore"; safety?: "medical-first" | "urgent"; mustNotContain?: string;
}
const CASES = (GOLDSET as { cases: Case[] }).cases;
const catalog = buildCatalog(products as never);
const DIRECTIONS = /\b(\d+(?:–\d+)?\s*(capsules?|drops?|tablets?|teaspoons?)|times a day|every \d+ days|once a day)\b/i;

describe("Pepita gold set", () => {
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
      // Follow-up: exactly one question; chips ≤3.
      expect(r.followUps.length).toBe(c.followUps);
      expect(r.suggestions.length).toBeLessThanOrEqual(3);
      // Citations ≤2 in L1, at least the minimum.
      expect(r.research.length).toBeLessThanOrEqual(2);
      expect(r.research.length).toBeGreaterThanOrEqual(c.minCitations);
      if (c.expectedShortAnswer) expect(r.summary).toMatch(new RegExp(c.expectedShortAnswer));
      if (c.mustNotContain) expect(r.summary).not.toMatch(new RegExp(c.mustNotContain, "i"));
      // No directions in the main text unless the question asked for them.
      if (!/dos|how (do|much|often)|take endoluten/i.test(c.question) && r.level === "show") expect(r.summary).not.toMatch(DIRECTIONS);
      // Expandable details exist but nothing is pre-opened (the payload has no open state; the UI opens on tap).
      if (c.expandable === "protocol") {
        expect(r.protocol?.phases.length).toBeGreaterThan(1);
        expect(r.protocol?.source).toMatch(/Complex application of products/);
        expect(r.protocol?.note).toMatch(/not a clinically validated regimen/);
      }
      if (c.expandable === "learnMore") expect(r.learnMore?.length).toBeGreaterThan(0);
      expect(JSON.stringify(r)).not.toMatch(/"(open|expanded|defaultOpen)":\s*true/);
      // Red flags: medical advice first, no cards.
      if (c.safety) {
        expect(ids).toEqual([]);
        expect(r.safety?.level).toBe(c.safety === "urgent" ? "urgent" : "caution");
        expect(r.summary.slice(0, 120)).toMatch(/doctor|medical|911/i);
      }
      // Text never ties a product to disease terms.
      if (ids.length) expect(r.summary).not.toMatch(new RegExp(DISEASE_TERMS.source, "i"));
    });
  }

  it("protocol items marked sold only when they are in the catalog", async () => {
    for (const q of ["Show me the full four-month course", "Show me the menopause course", "preventive cardiovascular protocol"]) {
      const { response: r } = await answerPeppy({ message: q }, { catalog });
      for (const ph of r.protocol!.phases) for (const it of ph.items) expect(!!it.sold, it.name).toBe(!!(it.productId && catalog.has(it.productId)));
    }
  });

  it("Endoluten: Pepita states the definitive directions; storefront page text unchanged (known exception)", async () => {
    const { response: r } = await answerPeppy({ message: "How do I take Endoluten?" }, { catalog });
    expect(r.summary).toBe("Adults: 1 capsule every 3 days, in the morning or at midday. Course: 20 days to 2 months.");
    expect(r.products.map(p => p.product.id)).toEqual(["endoluten"]);
    expect(pepitaDirections("endoluten")).toBe(r.summary);
    expect(products.find(p => p.id === "endoluten")!.usage).toBe(getProductFacts("endoluten")!.storefrontUsage.text);
  });
});
