import { describe, expect, it, vi } from "vitest";
import { allProducts, products } from "../../client/src/data/products";
import { isHiddenProduct } from "../hidden-products";
import { buildCatalog } from "./catalog";
import { analyze, GENERIC_PUBMED_QUERY } from "./engine";
import { PEPPY_SYSTEM_PROMPT } from "./prompt";
import {
  DOCTOR_CONSULT_LINE,
  DOSING_NOTE,
  ensureProductNotes,
  PRODUCT_NOTES_HEADING,
} from "./product-notes";
import { answerPeppy, wantsLivePubmed } from "./respond";
import { RESEARCH_REGISTRY } from "./research-registry";
const getSource = (id: string) => RESEARCH_REGISTRY.find(s => s.id === id);
import { TOPICS } from "./topics";

const catalog = buildCatalog(products as never);
const VERBATIM =
  "Dosage may vary depending on factors like sex, age, health status, and whether the goal is preventive (general upkeep) or regenerative (more active support); label directions are on the product page, and your doctor can help decide what's right for you, ideally informed by proper blood tests.";

const fullText = (r: { summary: string; sections: { heading?: string; body: string }[] }) =>
  [r.summary, ...r.sections.map(s => `${s.heading ?? ""} ${s.body}`)].join("\n");

const PRODUCT_QUESTIONS = [
  "I'm always tired, what can help?",
  "What supports joint comfort?",
  "What helps with sleep?",
  "What do you have for liver support?",
  "What supports the immune system?",
  "Anything for my lungs?",
  "What supports healthy ageing?",
  "What supports skin elasticity?",
];

describe("universal dosing note", () => {
  it("is the exact approved text", () => {
    expect(DOSING_NOTE).toBe(VERBATIM);
  });

  it("is required in the system prompt", () => {
    expect(PEPPY_SYSTEM_PROMPT).toContain(DOSING_NOTE);
    // v11: the per-answer doctor line is replaced by the permanent health footer (rendered by the UI).
    expect(PEPPY_SYSTEM_PROMPT).toMatch(/HEALTH FOOTER/);
  });

  const base = {
    mode: "llm" as const,
    summary: "Some answer about energy.",
    sections: [{ heading: "What helps", body: "Sleep and daylight." }],
    research: [],
    followUps: [],
    suggestions: [],
    showDisclaimer: true,
    topics: [],
  };
  const someProduct = { product: [...catalog.values()][0], why: "x", evidenceNote: "y" };

  it("appends both lines when products are suggested and the lines are missing", () => {
    const out = ensureProductNotes({ ...base, products: [someProduct] } as never);
    const last = out.sections[out.sections.length - 1];
    expect(last.heading).toBe(PRODUCT_NOTES_HEADING);
    expect(last.body).toContain(DOCTOR_CONSULT_LINE);
    expect(last.body).toContain(DOSING_NOTE);
  });

  it("does not duplicate lines already present (including curly apostrophes)", () => {
    const curly = DOSING_NOTE.replace("what's", "what’s");
    const r = {
      ...base,
      sections: [...base.sections, { body: `${DOCTOR_CONSULT_LINE} ${curly}` }],
      products: [someProduct],
    };
    expect(ensureProductNotes(r as never).sections).toHaveLength(2);
  });

  it("appends only the missing line", () => {
    const r = { ...base, sections: [{ body: DOCTOR_CONSULT_LINE }], products: [someProduct] };
    const out = ensureProductNotes(r as never);
    expect(out.sections[1].body).toBe(DOSING_NOTE);
  });

  it("leaves answers without products alone", () => {
    const r = { ...base, products: [] };
    expect(ensureProductNotes(r as never)).toBe(r);
  });

  it.each(PRODUCT_QUESTIONS)("fallback answer with products carries both lines: %s", async message => {
    const { response } = await answerPeppy({ message }, { catalog });
    if (response.products.length) {
      expect(fullText(response)).toContain(DOSING_NOTE);
      expect(fullText(response)).toContain(DOCTOR_CONSULT_LINE);
    }
  });

  it("LLM answers that leave the lines out get them appended on the server", async () => {
    const message = "I'm always tired, what can help?";
    const a = analyze({ message, catalog });
    expect(a.productsAllowed).toBe(true);
    const topic = a.topics[0];
    const id = topic.products.find(p => catalog.has(p.id) && catalog.get(p.id)!.inStock !== false)!.id;
    const callLlm = vi.fn(async () =>
      JSON.stringify({
        summary:
          "Tiredness is usually about sleep, meals, caffeine timing and movement; check iron and thyroid if it lasts weeks.",
        sections: [{ heading: "What helps", body: "A short walk after lunch helps many people." }],
        sourceIds: [],
        products: [{ id, why: "From our catalog.", evidenceNote: "No published trials of the finished formula." }],
        followUps: [],
        suggestions: ["Is it safe with my medications?", "What helps with sleep?"],
      })
    );
    const { response } = await answerPeppy({ message }, { catalog, callLlm });
    expect(callLlm).toHaveBeenCalled();
    expect(response.products.length).toBeGreaterThan(0);
    expect(fullText(response)).toContain(DOSING_NOTE);
    expect(fullText(response)).toContain(DOCTOR_CONSULT_LINE);
  });

  it("hard-guard answers (no products) don't get the dosing note", async () => {
    const { response } = await answerPeppy({ message: "I'm going through chemo, what helps my knees?" }, { catalog });
    expect(response.products).toEqual([]);
    expect(fullText(response)).not.toContain(DOSING_NOTE);
  });
});

describe("live PubMed lookup on every product-suggestion answer", () => {
  it.each(PRODUCT_QUESTIONS)("%s", async message => {
    const searchPubmed = vi.fn(async () => []);
    const { response } = await answerPeppy({ message }, { catalog, searchPubmed });
    if (response.products.length) expect(searchPubmed).toHaveBeenCalledTimes(1);
  });

  it("product questions without a topic query fall back to the generic query", () => {
    const a = analyze({ message: "Tell me about Bonomarlot", catalog });
    expect(wantsLivePubmed(a)).toBeTruthy();
  });

  it("every product-suggesting topic has a live query", () => {
    for (const t of TOPICS.filter(t => t.productPolicy !== "never"))
      expect(t.pubmedQuery, t.id).toBeTruthy();
    expect(GENERIC_PUBMED_QUERY).toMatch(/Khavinson/);
  });
});

describe("topic coverage", () => {
  it("every visible catalog product is mapped to at least one topic", () => {
    const mapped = new Set(TOPICS.flatMap(t => t.products.map(p => p.id)));
    const missing = allProducts
      .filter(p => !isHiddenProduct(p as never))
      .map(p => p.id)
      .filter(id => !mapped.has(id));
    expect(missing).toEqual([]);
  });

  it("new Russian-language studies resolve in the registry", () => {
    for (const id of ["pmid:12577695", "pmid:25051774", "pmid:24738258", "pmid:30607912", "pmid:16075683"])
      expect(getSource(id), id).toBeTruthy();
  });
});

import { withoutGenericDoctorLines } from "./product-notes";
describe("withoutGenericDoctorLines", () => {
  it("removes generic doctor reminders, keeps red-flag guidance", () => {
    expect(
      withoutGenericDoctorLines(
        "Melatonin helps a little. Please talk with your doctor before starting. Always consult your doctor before starting any new supplement. Seek urgent care for chest pain. If it lasts 3 weeks, see a doctor."
      )
    ).toBe("Melatonin helps a little. Seek urgent care for chest pain. If it lasts 3 weeks, see a doctor.");
  });
  it("drops a section body that was only the reminder", () => {
    expect(withoutGenericDoctorLines("Talk with your clinician first.")).toBe("");
  });
});
