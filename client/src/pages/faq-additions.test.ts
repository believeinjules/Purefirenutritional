import { describe, expect, it } from "vitest";
import { faqs } from "./FAQ";

const APPROVED: Record<string, string> = {
  "Do bioregulators need to be injected?": "No. The bioregulators we carry are taken by mouth as capsules, and some come in liquid or under-the-tongue forms. Some related preparations were originally developed as injections in Russia, but these products are not injectables.",
  "How long do people usually take them?": "Bioregulators are usually taken as a course for a set period, then paused, rather than every day indefinitely. Each product page lists its label directions, and your doctor can help you decide what fits you.",
  "Are they safe, and who should check with a clinician first?": "Published studies have reported few side effects, but the research is limited and no supplement is right for everyone. Check with a clinician before starting if you are pregnant or breastfeeding, under 18, take prescription medication, have a medical condition, or have surgery coming up.",
  "Are bioregulators FDA approved?": "No. They are sold as dietary supplements, and the FDA does not approve supplements for effectiveness before they are sold. They are not intended to diagnose, treat, cure, or prevent any disease.",
};
const DRAFTED = [
  "How do I know a product is genuine?",
  "What's the difference between capsules and liquids?",
  "Which one should I start with?",
  "How much does shipping cost, and how long does it take?",
  "What is your return policy?",
];
const FDA_SENTENCE = "They are not intended to diagnose, treat, cure, or prevent any disease.";

describe("FAQ additions (Oct 2026)", () => {
  it("approved answers are verbatim", () => {
    for (const [q, a] of Object.entries(APPROVED)) expect(faqs.find((f) => f.question === q)?.answer, q).toBe(a);
  });
  it("no duplicate questions", () => {
    const qs = faqs.map((f) => f.question.toLowerCase());
    expect(new Set(qs).size).toBe(qs.length);
  });
  it("drafted answers are 2–4 sentences, no dosing figures or disease words", () => {
    for (const q of DRAFTED) {
      const a = faqs.find((f) => f.question === q)!.answer;
      const n = a.split(/(?<=[.!?])\s+/).length;
      expect(n, q).toBeGreaterThanOrEqual(2);
      expect(n, q).toBeLessThanOrEqual(4);
      expect(a, q).not.toMatch(/\bmg\b|capsules? (daily|a day)|times (a|per) day|\bcure|disease|treat/i);
      expect(a, q).not.toMatch(/\bonly\b|exclusive/i);
    }
    for (const q of Object.keys(APPROVED)) {
      expect(APPROVED[q].replace(FDA_SENTENCE, "")).not.toMatch(/\bcure|disease|\bmg\b/i);
    }
  });
  it("links: genuine → /authenticity, start → guide anchor + Ask Pepita, shipping/returns → policies", () => {
    const links = (q: string) => (faqs.find((f) => f.question === q)!.links ?? []).map((l) => l.href);
    expect(links("How do I know a product is genuine?")).toEqual(["/authenticity"]);
    expect(links("Which one should I start with?")[0]).toBe("/learn/what-are-khavinson-peptide-bioregulators#cytomaxes-vs-cytogens");
    expect(links("Which one should I start with?")[1]).toMatch(/^\/ai-assistant\?q=/);
    expect(links("How much does shipping cost, and how long does it take?")).toEqual(["/shipping"]);
    expect(links("What is your return policy?")).toEqual(["/returns"]);
  });
});
