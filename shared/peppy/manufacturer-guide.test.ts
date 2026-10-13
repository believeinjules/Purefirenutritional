import { describe, expect, it } from "vitest";
import { products } from "../../client/src/data/products";
import { BANNED_TERMS, CLAIM_VERBS, DISEASE_TERMS, isCompliantProductCopy } from "./claims";
import { HIDDEN_PRODUCT_IDS } from "../hidden-products";
import {
  CONDITION_DISCLAIMER,
  DOCTOR_ONLY,
  MANUFACTURER_GUIDE,
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
      expect(LIQUID.test(visible.get(e.id)?.usage ?? ""), `${e.id} label`).toBe(false);
    }
  });

  it("every note passes the claim filter and is structure/function", () => {
    for (const e of MANUFACTURER_GUIDE)
      for (const n of e.notes) {
        expect(isCompliantProductCopy(n), `${e.id}: ${n}`).toBe(true);
        expect(FORBIDDEN_WORDS.test(n), `${e.id}: ${n}`).toBe(false);
      }
  });

  it("carries no dosing at all (schedules live only in verified product-data.json)", () => {
    for (const e of MANUFACTURER_GUIDE) expect(Object.keys(e).sort(), e.id).toEqual(["id", "notes", "pages"]);
  });
});

describe("prompt", () => {
  it("states the condition rules, required lines and source label", () => {
    expect(PEPPY_SYSTEM_PROMPT).toContain(CONDITION_DISCLAIMER);
    expect(PEPPY_SYSTEM_PROMPT).not.toContain("A protocol some people have followed is");
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

  it("condition questions never get a schedule in the LLM context", () => {
    expect(PEPPY_SYSTEM_PROMPT).toContain("no condition-specific schedules");
  });
});
