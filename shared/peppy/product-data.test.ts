import { describe, expect, it } from "vitest";
import { products } from "../../client/src/data/products";
import { HIDDEN_PRODUCT_IDS } from "../hidden-products";
import { buildCatalog } from "./catalog";
import { analyze, composeFallback } from "./engine";
import DATA from "./product-data.json";
import { PRODUCT_DATA_FIELDS, dosingAnswer, getProductData, verified, verifiedFacts } from "./product-data";
import { buildLlmContext } from "./prompt";

const catalog = buildCatalog(products as never);
const ask = (message: string) =>
  composeFallback(analyze({ message, history: [], catalog }), catalog);
const nums = (s: string) => s.match(/\d+(?:[–-]\d+)?/g) ?? [];

describe("product data layer (single JSON file)", () => {
  it("covers every visible product and no hidden one", () => {
    const ids = new Set(DATA.products.map(p => p.id));
    for (const p of products) expect(ids.has(p.id)).toBe(true);
    for (const h of HIDDEN_PRODUCT_IDS) expect(ids.has(h)).toBe(false);
  });
  it("every field has a status; unverified fields carry no value", () => {
    for (const r of DATA.products as any[]) for (const f of PRODUCT_DATA_FIELDS) {
      expect(["verified", "unverified"]).toContain(r[f].status);
      if (r[f].status === "unverified") expect(r[f].value).toBeNull();
      if (r[f].status === "verified") expect(r[f].source).toBeTruthy();
    }
  });
  it("candidate text is never returned as a verified value", () => {
    const r = getProductData("cytogen-cardiogen") ?? (DATA.products as any[]).find(p => p.labelDirections.candidate);
    if (r) expect(verified(r.id, "labelDirections")).toBeNull();
  });
});

describe("no invented doses", () => {
  it("every number in a dosing answer maps to a verified field, for every product", () => {
    for (const p of products) {
      const r = ask(`How much ${p.name} should I take?`);
      const facts = Object.values(verifiedFacts(p.id)).join(" ");
      const allowed = new Set([...nums(facts), ...nums(p.name)]);
      for (const n of nums(r.summary)) expect(allowed.has(n), `${p.id}: "${n}" in "${r.summary}"`).toBe(true);
    }
  });
  it("gives exact verified label numbers when we have them", () => {
    const r = ask("How much Endoluten should I take?");
    expect(r.summary).toContain("1–2 capsules 1–2 times daily with meals");
    expect(r.summary).toMatch(/manufacturer guidance, not evidence from clinical trials/);
  });
  it("says plainly when label directions aren't verified, without numbers", () => {
    const p = products.find(x => !verified(x.id, "labelDirections") && !/\d/.test(x.name))!;
    const r = ask(`How should I take ${p.name}?`);
    expect(r.summary).toMatch(/don't have verified label directions/);
    expect(nums(r.summary)).toEqual([]);
    expect(dosingAnswer(p.id, p.name).verified).toBe(false);
  });
  it("LLM context exposes only verified fields", () => {
    const a = analyze({ message: "How much Endoluten should I take?", history: [], catalog });
    const ctx = buildLlmContext({ analysis: a, sources: [], candidates: [], history: [], draft: ask("How much Endoluten should I take?") });
    expect(ctx.user).toContain("verifiedData");
    expect(ctx.user).not.toMatch(/Intensive: N60/);
  });
});
