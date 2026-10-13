import { describe, expect, it } from "vitest";
import { products } from "../../client/src/data/products";
import { BANNED_TERMS, CLAIM_VERBS, DISEASE_TERMS, isCompliantProductCopy } from "./claims";
import { HIDDEN_PRODUCT_IDS } from "../hidden-products";
import {
  CONDITION_DISCLAIMER,
  DOCTOR_ONLY,
  MANUFACTURER_GUIDE,
  selectConditionDose,
} from "./manufacturer-guide";
import { buildLlmContext, PEPPY_SYSTEM_PROMPT } from "./prompt";
import { detectGuards, productsBlockedBy } from "./claims";

const visible = new Map(products.map(p => [p.id, p]));
const LIQUID = /\b(drops?|lingual|sublingual|liquid|syrup|ml|teaspoons?|tablespoons?|spoons?|solution|serum|oil|under the tongue)\b/i;
const FORBIDDEN_WORDS = /\b(drugs?|therap\w*|treatment\w*|prophyla\w*)\b/i;
const INTENSIVE = /\b(intensive|every \d+ (?:minutes|hours)|loading|until noon)\b/i;

/** Largest number of units per day the label allows (max units x max times). */
function labelMaxPerDay(usage: string): number {
  const m = usage.match(/(\d)(?:\s*[–-]\s*(\d))?\s*(?:capsules?|tablets?|caps)\b[^.]*?(?:(\d)(?:\s*[–-]\s*(\d))?\s*times|twice|once)?/i);
  if (!m) return 0;
  const units = Number(m[2] ?? m[1]);
  const times = /twice/i.test(m[0]) ? 2 : m[3] ? Number(m[4] ?? m[3]) : 1;
  return units * times;
}
function schedulePerDay(s: string): number {
  const units = Number(s.match(/^(\d)/)?.[1] ?? NaN);
  const every = s.match(/once every (\d+) days/);
  return every ? units / Number(every[1]) : units;
}

describe("manufacturer guide data", () => {
  it("uses only visible catalog ids, once each", () => {
    const ids = MANUFACTURER_GUIDE.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(visible.has(id), id).toBe(true);
      expect(HIDDEN_PRODUCT_IDS.has(id), id).toBe(false);
    }
  });

  it("has no drop / liquid entries", () => {
    for (const e of MANUFACTURER_GUIDE) {
      expect(LIQUID.test(e.directions), e.id).toBe(false);
      for (const d of e.conditionDoses ?? []) expect(LIQUID.test(d.schedule), `${e.id}: ${d.schedule}`).toBe(false);
      expect(LIQUID.test(visible.get(e.id)?.usage ?? ""), `${e.id} label`).toBe(false);
    }
  });

  it("directions are the product label (label wins) with no intensive schedule", () => {
    for (const e of MANUFACTURER_GUIDE) {
      const usage = visible.get(e.id)!.usage ?? "";
      expect(usage.length, e.id).toBeGreaterThan(0);
      for (const sentence of e.directions.split(/(?<=\.)\s+/)) expect(usage, e.id).toContain(sentence);
      expect(INTENSIVE.test(e.directions), e.id).toBe(false);
    }
  });

  it("every note passes the claim filter and is structure/function", () => {
    for (const e of MANUFACTURER_GUIDE)
      for (const n of e.notes) {
        expect(isCompliantProductCopy(n), `${e.id}: ${n}`).toBe(true);
        expect(FORBIDDEN_WORDS.test(n), `${e.id}: ${n}`).toBe(false);
      }
  });

  it("directions and schedules carry no disease, claim or banned words", () => {
    for (const e of MANUFACTURER_GUIDE) {
      for (const t of [e.directions, ...(e.conditionDoses ?? []).map(d => d.schedule)]) {
        expect(DISEASE_TERMS.test(t) || CLAIM_VERBS.test(t) || BANNED_TERMS.test(t) || FORBIDDEN_WORDS.test(t), `${e.id}: ${t}`).toBe(false);
        expect(INTENSIVE.test(t), `${e.id}: ${t}`).toBe(false);
      }
    }
  });

  it("condition schedules stay within the label maximum and frequency", () => {
    for (const e of MANUFACTURER_GUIDE)
      for (const d of e.conditionDoses ?? []) {
        const max = labelMaxPerDay(visible.get(e.id)!.usage ?? "");
        expect(max, e.id).toBeGreaterThan(0);
        expect(schedulePerDay(d.schedule), `${e.id}: ${d.schedule}`).toBeLessThanOrEqual(max);
        expect(Number(d.schedule.match(/^(\d)/)?.[1]), `${e.id}: ${d.schedule}`).toBeLessThanOrEqual(Number((visible.get(e.id)!.usage ?? "").match(/(\d)(?:\s*[–-]\s*(\d))?\s*(?:capsules?|tablets?)/)?.slice(1).filter(Boolean).pop()));
        expect(DOCTOR_ONLY.test(d.condition) || d.keywords.some(k => DOCTOR_ONLY.test(k)), `${e.id}: ${d.condition}`).toBe(false);
        expect(d.page).toBeGreaterThan(0);
      }
  });
});

describe("condition-dose gate", () => {
  const base = { productId: "endoluten", intent: "dosage", safetyKind: null, redFlag: null };
  it("only answers an explicit dose request for a listed condition", () => {
    expect(selectConditionDose({ ...base, message: "What dose of Endoluten should I take for migraines?" })?.page).toBe(28);
    expect(selectConditionDose({ ...base, message: "Is Endoluten good for migraines?", intent: "info" })).toBeNull();
    expect(selectConditionDose({ ...base, message: "How much Endoluten should I take?" })).toBeNull();
  });
  it("never answers doctor-only topics or safety turns", () => {
    expect(selectConditionDose({ ...base, message: "What dose of Endoluten for migraines while on warfarin?" })).toBeNull();
    expect(selectConditionDose({ ...base, message: "Endoluten dose for my child's migraines?" })).toBeNull();
    expect(selectConditionDose({ ...base, message: "What dose of Endoluten for migraines?", safetyKind: "pregnancy" })).toBeNull();
    expect(selectConditionDose({ ...base, message: "Endoluten dosage for migraines so I can stop my medication" })).toBeNull();
  });
  it("never answers in a product-recommendation turn", () => {
    expect(selectConditionDose({ ...base, message: "Which product and what dose for migraines?", intent: "product-finding" })).toBeNull();
  });
});

describe("prompt", () => {
  it("states the condition rules, required lines and source label", () => {
    expect(PEPPY_SYSTEM_PROMPT).toContain(CONDITION_DISCLAIMER);
    expect(PEPPY_SYSTEM_PROMPT).toContain("A protocol some people have followed is");
    expect(PEPPY_SYSTEM_PROMPT).toContain("manufacturer's directions");
    expect(PEPPY_SYSTEM_PROMPT).not.toMatch(/peptideproduct|ebook|user guide|product guide|\.pdf/i);
    expect(typeof buildLlmContext).toBe("function");
  });
});

describe("disease-question format (Regulatory, approved 2026-10-13)", () => {
  it("orders doctor → products → studies → dosing → closing in the prompt", () => {
    const p = PEPPY_SYSTEM_PROMPT;
    const order = [
      "Please check with your doctor before buying",
      "Products that support [organ] function:",
      "Published studies",
      "A protocol some people have followed is",
      "About dosing: The right amount and course can vary",
      "Educational information, not medical advice. Not intended to diagnose, treat, cure, or prevent any disease.",
    ].map(t => p.indexOf(t));
    for (const i of order) expect(i).toBeGreaterThan(-1);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(p).toContain("call 911 now");
    expect(p).toMatch(/Russian studies on Russian participants are human evidence/);
  });

  it("doctor-only topics block products (and so studies/doses in the LLM context)", () => {
    for (const m of [
      "I'm on chemo, what can support my liver?",
      "We're doing IVF, anything for egg quality?",
      "Can I reduce my thyroid medication if I take Thyreogen?",
      "I'm breastfeeding, what helps sleep?",
      "What can my kids take for focus?",
    ])
      expect(productsBlockedBy(detectGuards(m)).length, m).toBeGreaterThan(0);
  });

  it("other condition questions may show organ-support products", () => {
    expect(productsBlockedBy(detectGuards("Is there something I can take to help my fatty liver?"))).toEqual([]);
  });

  it("no-dose topics still never get a protocol", () => {
    for (const m of ["What dose of Endoluten for migraines? I'm on Eliquis", "What dose of Revilab ML 01 for my thyroid? I'm diabetic", "Endoluten dose for migraines with epilepsy?"])
      expect(selectConditionDose({ message: m, productId: m.includes("ML 01") ? "revilab-ml-01" : "endoluten", intent: "dosage", safetyKind: null, redFlag: null }), m).toBeNull();
  });
});
