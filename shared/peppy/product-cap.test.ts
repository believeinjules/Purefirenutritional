import { describe, expect, it, vi } from "vitest";
import { products } from "../../client/src/data/products";
import { buildCatalog } from "./catalog";
import { analyze, composeFallback, fairOrder, FALLBACK_MAX_PRODUCTS, NEWER_LINE } from "./engine";
import { PEPPY_SYSTEM_PROMPT } from "./prompt";
import { answerPeppy, llmCandidates } from "./respond";
import { PEPPY_LIMITS } from "./types";

const catalog = buildCatalog(products as never);
const reply = (ids: string[]) =>
  JSON.stringify({
    summary: "Tiredness is usually about sleep, meals, caffeine timing and movement; check iron if it lasts weeks.",
    sections: [{ heading: "What helps", body: "A short walk after lunch." }],
    sourceIds: [],
    products: ids.map(id => ({ id, why: "Formulated for everyday energy.", evidenceNote: "No published trials of the finished formula." })),
    followUps: [],
    suggestions: ["What helps with sleep?", "Is it safe with my medications?"],
  });

describe("product cap", () => {
  it("is 3", () => expect(PEPPY_LIMITS.maxProducts).toBe(3));

  it("accepts three, drops a fourth", async () => {
    const msg = "I'm always tired, what can help?";
    const a = analyze({ message: msg, catalog });
    const draft = composeFallback(a, catalog);
    const ids = llmCandidates(a, catalog, draft).map(c => c.product.id);
    expect(ids.length).toBeGreaterThanOrEqual(4);
    const { response } = await answerPeppy({ message: msg }, { catalog, callLlm: vi.fn(async () => reply(ids.slice(0, 4))) });
    expect(response.products.map(p => p.product.id)).toEqual(ids.slice(0, 3));
  });

  it("has no forced minimum: one or zero products stay as given", async () => {
    const msg = "I'm always tired, what can help?";
    const a = analyze({ message: msg, catalog });
    const id = llmCandidates(a, catalog, composeFallback(a, catalog))[0].product.id;
    const one = await answerPeppy({ message: msg }, { catalog, callLlm: vi.fn(async () => reply([id])) });
    expect(one.response.products).toHaveLength(1);
    const none = await answerPeppy({ message: msg }, { catalog, callLlm: vi.fn(async () => reply([])) });
    expect(none.response.products).toHaveLength(0);
  });

  it("fallback answers never pad to three", async () => {
    for (const m of ["I'm always tired, what can help?", "What supports healthy ageing?", "What supports the immune system?"]) {
      const { response } = await answerPeppy({ message: m }, { catalog });
      expect(response.products.length).toBeLessThanOrEqual(FALLBACK_MAX_PRODUCTS);
    }
  });

  it("joints: a topic whose picks each serve a distinct reason shows three (bioregulator, joint formula, collagen)", async () => {
    const { response } = await answerPeppy({ message: "What supports joint comfort?" }, { catalog });
    expect(response.products.map(p => p.product.id)).toEqual(["cartalax", "prime-peptide-joints", "prime-peptide-collagen"]);
  });

  it("prompt states the restraint rule", () => {
    expect(PEPPY_SYSTEM_PROMPT).toContain("Max 3.");
    expect(PEPPY_SYSTEM_PROMPT).toContain("usually 1-2; never pad to three");
    expect(PEPPY_SYSTEM_PROMPT).toContain("distinct reason or fits a different kind of person (e.g. different focus, form, or budget)");
    expect(PEPPY_SYSTEM_PROMPT).toContain("briefly say why someone would choose each one");
    expect(PEPPY_SYSTEM_PROMPT).toMatch(/Revilab, Anti-Age NB, GPL, Prime Peptide/);
  });
});

describe("newer lines compete fairly", () => {
  it("fairOrder alternates older and newer lines", () => {
    const ids = fairOrder([{ id: "a" }, { id: "b" }, { id: "c" }, { id: "revilab-x" }, { id: "gpl-y" }]).map(x => x.id);
    expect(ids).toEqual(["a", "revilab-x", "b", "gpl-y", "c"]);
  });

  it.each(["What supports healthy ageing?", "What supports heart health?", "What supports joint comfort?", "What do you have for women's health?"])(
    "a newer-line product is in the first two candidates: %s",
    msg => {
      const a = analyze({ message: msg, catalog });
      const c = llmCandidates(a, catalog, composeFallback(a, catalog)).map(x => x.product.id);
      expect(c.slice(0, 2).some(id => NEWER_LINE.test(id)), c.join(",")).toBe(true);
    }
  );
});
