import { describe, expect, it } from "vitest";
import { products } from "../../client/src/data/products";
import { HIDDEN_PRODUCT_IDS, PENDING_PRODUCT_IDS } from "../hidden-products";
import { buildCatalog } from "./catalog";
import { analyze, composeFallback } from "./engine";
import DATA from "./product-data.json";
import {
  PRODUCT_DATA_FIELDS,
  dosingAnswer,
  packageDurationDays,
  parseSchedule,
  verified,
  verifiedFacts,
  verifiedSchedules,
  type ProductDataRecord,
} from "./product-data";
import { PEPPY_SYSTEM_PROMPT, buildLlmContext } from "./prompt";

const catalog = buildCatalog(products as never);
const ask = (message: string) => composeFallback(analyze({ message, history: [], catalog }), catalog);
const nums = (s: string) => s.match(/\d+(?:[–-]\d+)?/g) ?? [];
const RECORDS = DATA.products as unknown as ProductDataRecord[];
/** The two shared strings that used to be copied across 20 products. */
const TEMPLATES = ["1–2 capsules 1–2 times daily with meals", "Take 1 capsule daily in the morning on an empty stomach"];

describe("product data layer (single JSON file)", () => {
  it("covers every visible product and no hidden one", () => {
    const ids = new Set(RECORDS.map(p => p.id));
    for (const p of products) expect(ids.has(p.id)).toBe(true);
    for (const h of HIDDEN_PRODUCT_IDS) expect(ids.has(h)).toBe(PENDING_PRODUCT_IDS.has(h));
  });
  it("every field has a status; unverified fields carry no value; verified ones carry a source", () => {
    for (const r of RECORDS)
      for (const f of PRODUCT_DATA_FIELDS) {
        expect(["verified", "unverified"]).toContain(r[f].status);
        if (r[f].status === "unverified") expect(r[f].value).toBeNull();
        else expect(r[f].source, `${r.id}.${f}`).toBeTruthy();
      }
  });
  it("no product shows a schedule without a per-product RD source", () => {
    for (const r of RECORDS)
      for (const s of r.schedules) {
        expect(s.source, r.id).toMatch(/^RD .*https?:\/\//);
        expect(["label", "manufacturer-protocol", "research-regimen"]).toContain(s.protocolType);
      }
  });
  it("no generic template schedule is verified for any product", () => {
    for (const r of RECORDS) {
      const label = verified(r.id, "labelDirections") ?? "";
      for (const t of TEMPLATES) expect(label.includes(t), r.id).toBe(false);
    }
  });
  it("Endoluten: verified institute directions, stated confidently with pack duration, no source-disagreement framing", () => {
    const s = verifiedSchedules("endoluten", "label")[0];
    expect(s).toMatchObject({ unitsPerDose: [1, 1], dosesPerDay: [1, 1], everyNDays: 3 });
    expect(s.source).toContain("https://peptid.ru/catalog/naturalnye-peptidnye-kompleksy-tsitomaksy/endoluten/");
    expect(verified("endoluten", "contraindications")).toBe("individual intolerance to the components, pregnancy, breastfeeding");
    const t = dosingAnswer("endoluten", "Endoluten").text;
    expect(t).toMatch(/^The manufacturer's directions for Endoluten: Adults take 1 capsule once every 3 days, in the morning or at midday, for a course of about 20 days to 2 months\./);
    expect(t).toMatch(/20-capsule pack lasts about 60 days and a 60-capsule pack lasts about 180 days/);
    expect(t).not.toMatch(/catalog|differen|disagree|conflict|Maintenance|Intensive|1–2 capsules/i);
  });
  it("says 'Adults', never an 'over 14' age line, and no arithmetic aside, for every product", () => {
    for (const p of products) {
      const t = ask(`How much ${p.name} should I take?`).summary;
      expect(t, p.id).not.toMatch(/over 14|older 14|14 years|simple arithmetic/i);
    }
    expect(dosingAnswer("revifort", "Revifort").text).toMatch(/^The manufacturer's directions for Revifort: Adults take 1 capsule 2 times a day/);
  });
  it("no answer or prompt hedges with 'other catalogs/sources differ'", () => {
    const HEDGE = /(other|some|english) (catalogs?|sources?)[^.]*(differ|different|disagree|show)/i;
    expect(PEPPY_SYSTEM_PROMPT).not.toMatch(HEDGE);
    for (const p of products) expect(ask(`How much ${p.name} should I take?`).summary, p.id).not.toMatch(HEDGE);
  });
  it("never presents Pure Fire's Maintenance/Intensive labels as manufacturer protocols", () => {
    for (const r of RECORDS) {
      expect(JSON.stringify(verifiedFacts(r.id)), r.id).not.toMatch(/Maintenance: 20-capsule|Intensive: N60/);
      for (const p of products) if (p.id === r.id) expect(ask(`How much ${p.name} should I take?`).summary).not.toMatch(/Maintenance:|Intensive:/);
    }
  });
  it("the four products RD couldn't verify say so", () => {
    for (const id of ["anti-wrinkle-serum-7", "calsil-t", "reviform-cocktail", "rinolax"])
      expect(dosingAnswer(id, id).verified, id).toBe(false);
  });
});

describe("schedule parsing and package duration", () => {
  it("parses daily, ranged and intermittent schedules", () => {
    expect(parseSchedule("adults by 1 or 2 capsules 2 times a day during meals")).toEqual({ unit: "capsule", unitsPerDose: [1, 2], dosesPerDay: [2, 2], everyNDays: 1 });
    expect(parseSchedule("1 capsule once every 3 days, in the morning with a meal")).toEqual({ unit: "capsule", unitsPerDose: [1, 1], dosesPerDay: [1, 1], everyNDays: 3 });
    expect(parseSchedule("Take 1 capsule every third day")?.everyNDays).toBe(3);
    expect(parseSchedule("adults by 1 tablet once or 2 times a day, with meal")?.dosesPerDay).toEqual([1, 2]);
    expect(parseSchedule("for adults 3 capsules (2190 mg) a day")).toMatchObject({ unitsPerDose: [3, 3], dosesPerDay: [1, 1] });
    expect(parseSchedule("Make two or three sprays of the balm")).toBeNull();
  });
  it("computes pack duration, including every-N-day dosing", () => {
    const every3 = { unitsPerDose: [1, 1] as [number, number], dosesPerDay: [1, 1] as [number, number], everyNDays: 3 };
    expect(packageDurationDays(20, every3)).toEqual([60, 60]);
    expect(packageDurationDays(60, every3)).toEqual([180, 180]);
    expect(packageDurationDays(20, { unitsPerDose: [2, 2], dosesPerDay: [1, 1], everyNDays: 3 })).toEqual([30, 30]);
    expect(packageDurationDays(60, { unitsPerDose: [1, 2], dosesPerDay: [2, 2], everyNDays: 1 })).toEqual([15, 30]);
    expect(packageDurationDays(90, { unitsPerDose: [1, 1], dosesPerDay: [3, 3], everyNDays: 1 })).toEqual([30, 30]);
    // Revifort-style cycling: 15 days on, >=10 off, 15 on. 60 caps at 2/day = 30 dosing days + one 10-day break.
    expect(packageDurationDays(60, { unitsPerDose: [1, 1], dosesPerDay: [2, 2], everyNDays: 1, cycle: { onDays: 15, offDays: 10 } })).toEqual([40, 40]);
    expect(packageDurationDays(20, { unitsPerDose: [1, 1], dosesPerDay: [2, 2], everyNDays: 1, cycle: { onDays: 15, offDays: 10 } })).toEqual([10, 10]);
  });
  it("parses Revifort's on/off cycle from its verified label", () => {
    const s = verifiedSchedules("revifort", "label")[0];
    expect(s.cycle).toEqual({ onDays: 15, offDays: 10 });
    expect(dosingAnswer("revifort", "Revifort").text).toMatch(/60-capsule pack lasts about 40 days/);
  });
});

describe("no invented doses", () => {
  it("every number in any dosing answer maps to a verified field or its pack arithmetic", () => {
    for (const p of products) {
      const r = ask(`How much ${p.name} should I take?`);
      const facts = JSON.stringify(verifiedFacts(p.id));
      const allowed = new Set([...nums(facts), ...nums(p.name)]);
      for (const n of nums(r.summary)) expect(allowed.has(n), `${p.id}: "${n}" in "${r.summary}"`).toBe(true);
    }
  });
  it("gives exact verified label numbers and pack duration when verified", () => {
    const r = ask("How much Ensil should I take?");
    expect(r.summary).toContain("1 capsule 3 times a day");
    expect(r.summary).toMatch(/90-capsule pack lasts about 30 days/);
    expect(r.summary).toMatch(/manufacturer guidance, not results from clinical trials/);
  });
  it("says plainly when not verified, with no numbers", () => {
    const r = ask("How should I take Calsil-T?");
    expect(r.summary).toMatch(/haven't been verified/);
    expect(nums(r.summary)).toEqual([]);
  });
  it("LLM context carries only verified data and no catalog or template schedule", () => {
    const a = analyze({ message: "How much Endoluten should I take?", history: [], catalog });
    const ctx = buildLlmContext({ analysis: a, sources: [], candidates: [], history: [], draft: ask("How much Endoluten should I take?") });
    expect(ctx.user).toContain("verifiedData");
    for (const t of [...TEMPLATES, "1 or 2 capsules 2 times a day", "Intensive: N60", "English catalogs"]) expect(ctx.user).not.toContain(t);
  });
});

describe("LLM dose guard", () => {
  it("rejects a dose number that isn't in a verified field", async () => {
    const { numbersAreVerified } = await import("./validate");
    const m = [{ id: "ensil", name: "Ensil" }];
    expect(numbersAreVerified("Take 1 capsule 3 times a day; a 90-capsule pack lasts 30 days.", m)).toBe(true);
    expect(numbersAreVerified("Take 2 capsules twice daily for 10 days.", [{ id: "endoluten", name: "Endoluten" }])).toBe(false);
  });
});
