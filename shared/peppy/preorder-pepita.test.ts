import { describe, expect, it, vi } from "vitest";
import { products } from "../../client/src/data/products";
import { isPreorderProduct } from "../preorder";
import { buildCatalog } from "./catalog";
import { analyze, composeFallback, fairOrder } from "./engine";
import { buildLlmContext, PEPPY_SYSTEM_PROMPT } from "./prompt";
import { ensureProductNotes, PREORDER_LINE } from "./product-notes";
import { answerPeppy, llmCandidates } from "./respond";

const catalog = buildCatalog(products as never);
const text = (r: { summary: string; sections: { heading?: string; body: string }[] }) =>
  [r.summary, ...r.sections.map(s => `${s.heading ?? ""} ${s.body}`)].join("\n");
const base = { mode: "llm" as const, summary: "Answer.", sections: [], research: [], followUps: [], suggestions: [], showDisclaimer: true, topics: [] };
const sugg = (id: string) => ({ product: catalog.get(id)!, why: "x", evidenceNote: "y" });

describe("Pepita and pre-order (liquid) products", () => {
  it("prompt tells Pepita to mention pre-order and prefer capsules when equal", () => {
    expect(PEPPY_SYSTEM_PROMPT).toContain("preorder = true marks a liquid/drop product");
    expect(PEPPY_SYSTEM_PROMPT).toContain("Prefer the capsule/tablet option when it fits the person equally well");
    expect(PEPPY_SYSTEM_PROMPT).toContain(PREORDER_LINE);
  });

  it("server adds the pre-order line when a liquid product is suggested without it", () => {
    const out = ensureProductNotes({ ...base, products: [sugg("revilab-sl-06")] } as never);
    expect(text(out)).toContain(PREORDER_LINE);
  });

  it("doesn't add it when the answer already says pre-order, or for capsule products", () => {
    const said = ensureProductNotes({ ...base, summary: "Revilab SL 06 is a pre-order item.", products: [sugg("revilab-sl-06")] } as never);
    expect(text(said)).not.toContain(PREORDER_LINE);
    const caps = ensureProductNotes({ ...base, products: [sugg("revilab-ml-05")] } as never);
    expect(text(caps)).not.toContain(PREORDER_LINE);
  });

  it("candidate order puts capsules ahead of liquids, keeping order otherwise", () => {
    const ids = fairOrder([{ id: "revilab-sl-06" }, { id: "rinolax" }, { id: "revilab-ml-05" }]).map(x => x.id);
    expect(ids[0]).toBe("revilab-ml-05");
    expect(ids.slice(1).sort()).toEqual(["revilab-sl-06", "rinolax"]);
  });

  it("LLM context marks liquid candidates as pre-order", () => {
    const message = "Anything for my lungs?";
    const analysis = analyze({ message, catalog });
    const draft = composeFallback(analysis, catalog);
    const candidates = llmCandidates(analysis, catalog, draft);
    const ctx = buildLlmContext({ analysis, sources: [], candidates, draft, history: [] });
    const compact = ctx.user.replace(/\s+/g, "");
    expect(compact).toMatch(/"id":"revilab-sl-06"[^}]*"preorder":true/);
    expect(compact).toMatch(/"id":"revilab-ml-05"[^}]*"preorder":false/);
    expect(isPreorderProduct(candidates[0].product.id)).toBe(false);
  });

  it("fallback answers that include a liquid product mention pre-order", async () => {
    const { response } = await answerPeppy({ message: "Anything for my lungs?" }, { catalog });
    if (response.products.some(p => isPreorderProduct(p.product.id))) expect(text(response)).toMatch(/pre-order/i);
    expect(isPreorderProduct(response.products[0]!.product.id)).toBe(false);
  });

  it("LLM answer suggesting a liquid without mentioning pre-order gets the line appended", async () => {
    const callLlm = vi.fn(async () =>
      JSON.stringify({
        summary: "For the airways the basics are not smoking, staying active and vaccinations.",
        sections: [],
        sourceIds: [],
        products: [{ id: "revilab-sl-06", why: "Sublingual blend of bronchial peptide complexes.", evidenceNote: "No published trials of the finished formula." }],
        followUps: [],
        suggestions: ["Is it safe with my medications?", "What helps with sleep?"],
      })
    );
    const { response } = await answerPeppy({ message: "Anything for my lungs?" }, { catalog, callLlm });
    expect(response.products.map(p => p.product.id)).toContain("revilab-sl-06");
    expect(text(response)).toContain(PREORDER_LINE);
  });
});
