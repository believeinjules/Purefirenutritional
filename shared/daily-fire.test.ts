import { describe, expect, it } from "vitest";
import { randomInt } from "node:crypto";
import {
  DAILY_FIRE_CODE_RE,
  DAILY_FIRE_NAME,
  DAILY_FIRE_NAME_OPTIONS,
  DISCOUNT_TIERS,
  QUIZ_QUESTIONS,
  TOTAL_TIER_WEIGHT,
  couponIdForPercent,
  estimateDiscountCents,
  isDailyFireExcludedPath,
  normalizePromoCode,
  pickQuestion,
  questionById,
  tierForRoll,
} from "./daily-fire";

describe("Daily Fire tier weights", () => {
  it("uses the proposed weights 40/35/15/7/3 (sum 100) for 5–25%", () => {
    expect(DISCOUNT_TIERS.map((t) => [t.percentOff, t.weight])).toEqual([
      [5, 40],
      [10, 35],
      [15, 15],
      [20, 7],
      [25, 3],
    ]);
    expect(TOTAL_TIER_WEIGHT).toBe(100);
  });

  it("maps every roll exactly to its weight (exhaustive)", () => {
    const counts: Record<number, number> = {};
    for (let r = 0; r < TOTAL_TIER_WEIGHT; r++) {
      const t = tierForRoll(r);
      counts[t.percentOff] = (counts[t.percentOff] ?? 0) + 1;
    }
    expect(counts).toEqual({ 5: 40, 10: 35, 15: 15, 20: 7, 25: 3 });
  });

  it("clamps out-of-range rolls", () => {
    expect(tierForRoll(-5).percentOff).toBe(5);
    expect(tierForRoll(NaN).percentOff).toBe(5);
    expect(tierForRoll(999).percentOff).toBe(25);
  });

  it("crypto-random sampling lands within 1.5 points of each weight (200k draws)", () => {
    const n = 200_000;
    const counts: Record<number, number> = { 5: 0, 10: 0, 15: 0, 20: 0, 25: 0 };
    for (let i = 0; i < n; i++) counts[tierForRoll(randomInt(TOTAL_TIER_WEIGHT)).percentOff]++;
    for (const t of DISCOUNT_TIERS) {
      expect(Math.abs((counts[t.percentOff] / n) * 100 - t.weight)).toBeLessThan(1.5);
    }
    expect(((counts[5] + counts[10]) / n) * 100).toBeGreaterThan(70);
  });

  it("coupon ids and code format", () => {
    expect(couponIdForPercent(10)).toBe("pf-daily-fire-10");
    expect(DAILY_FIRE_CODE_RE.test("FIRE10-K7Q2MX")).toBe(true);
    expect(DAILY_FIRE_CODE_RE.test("FIRE30-K7Q2MX")).toBe(false);
    expect(DAILY_FIRE_CODE_RE.test("FIRE10-K7Q2M0")).toBe(false);
  });
});

describe("Daily Fire question pool", () => {
  const all = QUIZ_QUESTIONS.map((q) => [q.prompt, ...q.options.map((o) => o.label), q.fact ?? ""].join(" ")).join("\n");

  it("has 15–20 questions with unique ids across goals, peptides and the body", () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(15);
    expect(QUIZ_QUESTIONS.length).toBeLessThanOrEqual(20);
    expect(new Set(QUIZ_QUESTIONS.map((q) => q.id)).size).toBe(QUIZ_QUESTIONS.length);
    for (const kind of ["goals", "peptides", "body"] as const) {
      expect(QUIZ_QUESTIONS.filter((q) => q.kind === kind).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("every question has 2–4 unique options (5 when allowOther); trivia has a valid answer and a fact", () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.length).toBeLessThanOrEqual(q.allowOther ? 5 : 4);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
      if (q.allowOther) {
        expect(q.options.some((o) => o.id === "e" && o.label === "Other")).toBe(true);
      }
      if (q.answerId) {
        expect(q.options.some((o) => o.id === q.answerId)).toBe(true);
        expect(q.fact).toBeTruthy();
      }
    }
  });

  it("goal-time allows Other (answer e); retired ids are gone; Khavinson copy updated", () => {
    const q = questionById("goal-time");
    expect(q?.allowOther).toBe(true);
    expect(q?.prompt).toBe("What do you wish you had more time for?");
    expect(q?.options.map((o) => o.id)).toEqual(["a", "b", "c", "d", "e"]);
    expect(q?.options.find((o) => o.id === "e")?.label).toBe("Other");
    expect(questionById("goal-morning")).toBeUndefined();
    expect(questionById("goal-habit")).toBeUndefined();
    expect(questionById("goal-aging")).toBeUndefined();
    expect(questionById("goal-supplement")?.prompt).toBe("What matters most to you when choosing a supplement?");
    expect(questionById("goal-next-year")?.prompt).toBe("What's one wellness goal for the year ahead?");
    const kh = questionById("pep-khavinson");
    expect(kh?.prompt).toBe("Professor Vladimir Khavinson's peptide research is centered in which city?");
    expect(kh?.answerId).toBe("a");
    expect(kh?.options[0].label).toBe("St. Petersburg");
    const cy = questionById("pep-cytogen-length");
    expect(cy?.prompt).toBe("Khavinson peptides are usually how many amino acids long?");
    expect(cy?.options.find((o) => o.id === cy.answerId)?.label).toBe("2 to 4");
  });

  it("uses structure/function wording only: no disease, treatment, cure or medical-advice language", () => {
    expect(all).not.toMatch(/\b(cure[sd]?|treat(s|ed|ment|ing)?|disease|diagnos\w*|prevent\w*|heal(s|ing)?|illness|disorder|cancer|diabetes|arthritis|anxiety|depression|insomnia|dose|dosage|prescri\w*|FDA)\b/i);
    expect(all).not.toMatch(/\bnew store\b/i);
    expect(all).not.toMatch(/https?:|www\./i);
    expect(all).not.toMatch(/\bUS\b|\bUSA\b/);
    expect(all).not.toMatch(/Prime Peptide/);
  });

  it("pickQuestion stays in range and questionById round-trips", () => {
    expect(pickQuestion(() => 0)).toBe(QUIZ_QUESTIONS[0]);
    expect(pickQuestion(() => 0.999999)).toBe(QUIZ_QUESTIONS[QUIZ_QUESTIONS.length - 1]);
    expect(questionById("body-bones")?.answerId).toBe("c");
    expect(questionById("nope")).toBeUndefined();
    expect(questionById(42)).toBeUndefined();
  });

  it("offers three names with Daily Fire as the default", () => {
    expect(DAILY_FIRE_NAME).toBe("Daily Fire");
    expect(DAILY_FIRE_NAME_OPTIONS).toHaveLength(3);
  });
});

describe("helpers", () => {
  it("normalizePromoCode", () => {
    expect(normalizePromoCode(" fire10-k7q2mx ")).toBe("FIRE10-K7Q2MX");
    expect(normalizePromoCode("bad code!")).toBeNull();
    expect(normalizePromoCode("")).toBeNull();
    expect(normalizePromoCode(undefined)).toBeNull();
  });

  it("estimateDiscountCents rounds to the cent", () => {
    expect(estimateDiscountCents(17899, 10)).toBe(1790);
    expect(estimateDiscountCents(0, 10)).toBe(0);
    expect(estimateDiscountCents(10000, 0)).toBe(0);
  });

  it("excludes checkout, success, admin and account pages", () => {
    for (const p of ["/checkout", "/checkout/success?session_id=x", "/admin", "/admin/products", "/login", "/signup", "/auth/action", "/review/x", "/dashboard"]) {
      expect(isDailyFireExcludedPath(p)).toBe(true);
    }
    for (const p of ["/", "/products", "/products/cerluten", "/cart", "/learn", "/reviews-page"]) {
      expect(isDailyFireExcludedPath(p)).toBe(false);
    }
  });
});
