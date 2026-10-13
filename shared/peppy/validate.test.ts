import { describe, expect, it, vi } from "vitest";
import { products } from "../../client/src/data/products";
import { buildCatalog } from "./catalog";
import { analyze, composeFallback, pickSources } from "./engine";
import { llmCandidates, answerPeppy } from "./respond";
import { parseLlmJson, validateLlmAnswer } from "./validate";

const catalog = buildCatalog(products as never);

function setup(message: string) {
  const analysis = analyze({ message, catalog });
  const draft = composeFallback(analysis, catalog);
  const sources = pickSources(
    [
      ...draft.research.map(s => s.id),
      ...analysis.topics.flatMap(t => t.sourceIds),
    ],
    [],
    8
  );
  const candidates = llmCandidates(analysis, catalog, draft);
  return { analysis, draft, sources, candidates };
}

const good = (overrides: Record<string, unknown> = {}) => ({
  summary:
    "Better sleep starts with a fixed wake time and morning light; melatonin has modest evidence for falling asleep a little faster.",
  sections: [
    { heading: "What helps", body: "- Fixed wake time\n- Morning light" },
  ],
  sourceIds: ["pmid:23691095"],
  evidenceNote: "Melatonin: meta-analysis, small effect.",
  products: [
    {
      id: "endoluten",
      why: "A pineal gland peptide complex formulated to support the sleep–wake rhythm.",
      evidenceNote: "No published trials of this product.",
    },
  ],
  followUps: [],
  suggestions: ["Can I take Endoluten with melatonin?", "What is Epitalon?"],
  ...overrides,
});

describe("validateLlmAnswer", () => {
  it("accepts a well-formed answer", () => {
    const s = setup("Which Pure Fire product for sleep?");
    const out = validateLlmAnswer({
      raw: JSON.stringify(good()),
      catalog,
      ...s,
    });
    expect(out).not.toBeNull();
    expect(out!.response.mode).toBe("llm");
    expect(out!.response.research.map(r => r.id)).toEqual(["pmid:23691095"]);
    expect(out!.response.products.map(p => p.product.id)).toEqual([
      "endoluten",
    ]);
  });

  it("drops invented citations", () => {
    const s = setup("Which Pure Fire product for sleep?");
    const out = validateLlmAnswer({
      raw: good({
        sourceIds: ["pmid:99999999", "pmid:23691095", "doi:10.1/fake"],
      }),
      catalog,
      ...s,
    })!;
    expect(out.response.research.map(r => r.id)).toEqual(["pmid:23691095"]);
    expect(out.report.droppedSources).toEqual([
      "pmid:99999999",
      "doi:10.1/fake",
    ]);
  });

  it("falls back to curated sources when every citation is invented", () => {
    const s = setup("Which Pure Fire product for sleep?");
    const out = validateLlmAnswer({
      raw: good({ sourceIds: ["pmid:1"] }),
      catalog,
      ...s,
    })!;
    expect(out.response.research.map(r => r.id)).toEqual(
      s.draft.research.map(r => r.id)
    );
  });

  it("drops unknown and non-candidate products", () => {
    const s = setup("Which Pure Fire product for sleep?");
    const out = validateLlmAnswer({
      raw: good({
        products: [
          { id: "bpc-157", why: "x", evidenceNote: "y" },
          {
            id: "testoluten",
            why: "Supports men's health.",
            evidenceNote: "None.",
          },
          {
            id: "endoluten",
            why: "A pineal peptide complex.",
            evidenceNote: "No trials.",
          },
        ],
      }),
      catalog,
      ...s,
    })!;
    expect(out.response.products.map(p => p.product.id)).toEqual(["endoluten"]);
    expect(out.report.droppedProducts).toEqual(["bpc-157", "testoluten"]);
  });

  it("strips disease claims from prose and replaces non-compliant product copy", () => {
    const s = setup("Which Pure Fire product for sleep?");
    const out = validateLlmAnswer({
      raw: good({
        summary:
          "Sleep habits matter most. Endoluten cures insomnia. Endoluten is an oncoprotector.",
        products: [
          {
            id: "endoluten",
            why: "Treats insomnia and prevents cancer.",
            evidenceNote: "Clinically proven.",
          },
        ],
      }),
      catalog,
      ...s,
    })!;
    expect(out.response.summary).toBe("Sleep habits matter most.");
    const card = out.response.products[0];
    expect(card.why).not.toMatch(/insomnia|cancer/i);
    expect(card.why).toBe(
      s.candidates.find(c => c.product.id === "endoluten")!.why
    );
    expect(card.evidenceNote).not.toMatch(/proven/i);
    expect(out.report.rewrittenProductCopy).toBe(2);
  });

  it("ignores LLM products when guards block products", () => {
    const s = setup("I have arthritis, what helps my knees?");
    expect(s.analysis.productsAllowed).toBe(false);
    const out = validateLlmAnswer({
      raw: good({
        products: [
          {
            id: "cartalax",
            why: "Cartilage peptide.",
            evidenceNote: "Lab only.",
          },
        ],
      }),
      catalog,
      ...s,
    })!;
    expect(out.response.products).toEqual([]);
  });

  it("always keeps the deterministic safety notice", () => {
    const s = setup("Why am I tired in the afternoon?");
    const out = validateLlmAnswer({ raw: good(), catalog, ...s })!;
    expect(out.response.safety).toEqual(s.draft.safety);
  });

  it("rejects unusable output", () => {
    const s = setup("Which Pure Fire product for sleep?");
    expect(validateLlmAnswer({ raw: "not json", catalog, ...s })).toBeNull();
    expect(
      validateLlmAnswer({ raw: JSON.stringify({ summary: "" }), catalog, ...s })
    ).toBeNull();
  });

  it("parses fenced JSON", () => {
    expect(parseLlmJson('```json\n{"summary":"x"}\n```')).toEqual({
      summary: "x",
    });
  });
});

describe("LLM is never consulted for hard-guard questions", () => {
  it.each([
    "I'm pregnant, can I take Vladonix?",
    "Can peptides cure my diabetes?",
    "Can I stop my thyroid medication and use Thyreogen?",
    "I have chest pain",
  ])("%s", async message => {
    const callLlm = vi.fn(async () => JSON.stringify(good()));
    const { response } = await answerPeppy({ message }, { catalog, callLlm });
    expect(callLlm).not.toHaveBeenCalled();
    expect(response.products).toEqual([]);
  });
});
