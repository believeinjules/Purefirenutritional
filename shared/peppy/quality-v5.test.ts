import { describe, expect, it } from "vitest";
import { products } from "../../client/src/data/products";
import { doctorQuestionsFromConversation, isMedicallyRelevant } from "../../client/src/lib/peppyContext";
import { buildCatalog } from "./catalog";
import { analyze, composeFallback } from "./engine";
import { PEPPY_SYSTEM_PROMPT } from "./prompt";

const catalog = buildCatalog(products as never);
const ask = (message: string, history: { role: "user" | "assistant"; content: string }[] = []) =>
  composeFallback(analyze({ message, history, catalog }), catalog);

describe("v5 answer quality (rules, not canned text)", () => {
  it("melatonin vs Endoluten: answers No first, from catalog lineage", () => {
    const r = ask("Is Endoluten the same as melatonin?");
    expect(r.summary).toMatch(/^No\. Melatonin is a hormone/);
    expect(r.summary).toContain("peptide complex");
  });
  it("'every peptide daily?' names non-daily schedules from verified data", () => {
    const r = ask("Do I take every peptide daily?");
    expect(r.summary).toMatch(/^No, schedules differ/);
    expect(r.summary).toMatch(/Revifort/);
  });
  it("uses the pack size the user already gave, without re-asking", () => {
    const r = ask("How long will it last?", [{ role: "user", content: "I have Endoluten 60" }, { role: "assistant", content: "Sure." }]);
    expect(r.summary).toMatch(/your 60-capsule pack lasts about 180 days/);
    expect(r.followUps).toEqual([]);
  });
  it("comparison shows up to two cards; combination never assumes safety", () => {
    expect(ask("Should I take Vesugen or Ventfort?").products).toHaveLength(2);
    const c = ask("Can I take Endoluten and Vladonix together?");
    expect(c.summary).toMatch(/unknown/);
    expect(c.products).toEqual([]);
  });
  it("ketamine + bladder points to a urologist first", () => {
    expect(ask("Chitomur for my bladder after ketamine use?").summary).toMatch(/urologist/);
  });
  it("prompt carries the v5 rules", () => {
    for (const t of ["Never re-ask", "researchers have investigated", "intensive is not \"better\"", "Never infer sex", "theshortpeptide.com", "hasn't been evaluated by the FDA for treating medical conditions", "QUALITY EXAMPLES (style guidance only"])
      expect(PEPPY_SYSTEM_PROMPT).toContain(t);
  });
});

describe("Questions for my doctor", () => {
  it("builds 3–5 questions only from what the user volunteered", () => {
    const qs = doctorQuestionsFromConversation(["I take levothyroxine for my thyroid. How much Thyreogen should I take?"], ["Thyreogen"]);
    expect(qs.length).toBeGreaterThanOrEqual(3);
    expect(qs.length).toBeLessThanOrEqual(5);
    expect(qs.join(" ")).toMatch(/levothyroxine/);
    expect(qs.join(" ")).not.toMatch(/pregnan|menopaus|breastfeed/);
  });
  it("is offered only after medically relevant questions", () => {
    expect(isMedicallyRelevant("Can I take Endoluten with my blood pressure medication?")).toBe(true);
    expect(isMedicallyRelevant("What are peptide bioregulators?")).toBe(false);
  });
});
