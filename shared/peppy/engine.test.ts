import { describe, expect, it, vi } from "vitest";
import { products } from "../../client/src/data/products";
import { buildCatalog } from "./catalog";
import { analyze, composeFallback } from "./engine";
import { answerPeppy } from "./respond";
import { RESEARCH_REGISTRY } from "./research-registry";

const catalog = buildCatalog(products as never);
const ask = (
  message: string,
  history: { role: "user" | "assistant"; content: string }[] = []
) => composeFallback(analyze({ message, history, catalog }), catalog);
const registry = new Set(RESEARCH_REGISTRY.map(s => s.id));

describe("deterministic answers", () => {
  it("answers a symptom question first, cites sources, and keeps products secondary", () => {
    const r = ask("I'm always tired, what should I take?");
    expect(r.summary).toMatch(/tired/i);
    expect(r.summary).not.toMatch(/panaxod|ensil/i);
    expect(r.research.length).toBeGreaterThanOrEqual(3);
    for (const s of r.research) expect(registry.has(s.id)).toBe(true);
    expect(r.products.length).toBeGreaterThan(0);
    expect(r.products.length).toBeLessThanOrEqual(2);
    expect(r.followUps.length).toBeLessThanOrEqual(3);
  });
  it("explains Epitalon without a follow-up wall", () => {
    const r = ask("What is Epitalon?");
    expect(r.summary).toMatch(/Ala-Glu-Asp-Gly/);
    expect(r.followUps).toEqual([]);
    expect(r.products.length).toBeLessThanOrEqual(1);
  });
  it("gives an honest evidence answer with no product pitch", () => {
    const r = ask("Do Khavinson peptides actually work in humans?");
    expect(r.summary).toMatch(/limited/i);
    expect(r.products).toEqual([]);
  });
  it("never suggests products in pregnancy, for children, for disease or when replacing a drug", () => {
    for (const q of [
      "I'm pregnant, can I take Vladonix?",
      "what can I give my 8 year old for sleep",
      "Can peptides cure my diabetes?",
      "Can I stop my thyroid medication and use Thyreogen?",
      "I have arthritis, what helps my knees?",
    ]) {
      expect(ask(q).products, q).toEqual([]);
    }
  });
  it("short-circuits emergencies with no sources or products", () => {
    const r = ask("I have crushing chest pain right now");
    expect(r.mode).toBe("urgent");
    expect(r.safety?.level).toBe("urgent");
    expect(r.summary).toMatch(/911/);
    expect(r.products).toEqual([]);
    expect(r.research).toEqual([]);
  });
  it("redirects off-topic questions and greets politely", () => {
    expect(ask("what's the weather today").summary).toMatch(
      /outside what I can help with/
    );
    expect(ask("hello").summary).toMatch(/^Hi, I'm Peppy/);
  });
  it("uses a short follow-up reply to refine the previous topic", () => {
    const r = ask("about 3 months, heavy periods, no meds", [
      { role: "user", content: "I'm always tired" },
      { role: "assistant", content: "..." },
    ]);
    expect(r.topics[0]).toBe("fatigue");
    expect(r.sections[0].heading).toBe("Based on what you've shared");
    expect(r.sections[0].body).toMatch(/ferritin/);
    expect(r.sections[0].body).not.toMatch(/Since you take medicines/);
    expect(r.followUps).toEqual([]);
  });
  it("gives manufacturer directions for dosage questions", () => {
    const r = ask("how do I take Cartalax?");
    expect(r.sections[0].heading).toBe("Manufacturer's directions");
    expect(r.sections[0].body).toMatch(/not personal dosing advice/);
  });
  it("names Endoluten + melatonin as unstudied rather than guessing", () => {
    const r = ask("Can I take Endoluten with melatonin?");
    expect(r.summary).toMatch(/no studies/i);
    expect(r.products).toEqual([]);
  });
});

describe("answerPeppy pipeline", () => {
  it("does not call PubMed or the LLM for emergencies", async () => {
    const searchPubmed = vi.fn(async () => []);
    const callLlm = vi.fn(async () => "{}");
    const { response } = await answerPeppy(
      { message: "I can't breathe" },
      { catalog, searchPubmed, callLlm }
    );
    expect(response.mode).toBe("urgent");
    expect(searchPubmed).not.toHaveBeenCalled();
    expect(callLlm).not.toHaveBeenCalled();
  });
  it("falls back to the curated answer when the LLM throws", async () => {
    const { response, meta } = await answerPeppy(
      { message: "Which Pure Fire product for sleep?" },
      { catalog, callLlm: async () => Promise.reject(new Error("timeout")) }
    );
    expect(meta.llm).toBe("error");
    expect(response.mode).toBe("fallback");
    expect(response.summary.length).toBeGreaterThan(20);
  });
  it("doesn't re-suggest a question the user already asked", async () => {
    const { response } = await answerPeppy(
      {
        message: "What is Epitalon?",
        history: [
          {
            role: "user",
            content: "Do Khavinson peptides actually work in humans?",
          },
        ],
      },
      { catalog }
    );
    expect(response.suggestions).not.toContain(
      "Do Khavinson peptides actually work in humans?"
    );
  });
});
