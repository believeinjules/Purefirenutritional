import { describe, expect, it } from "vitest";
import {
  hasHealthClaim,
  isPublicReview,
  reviewDisplayName,
  summarize,
  summarizeByProduct,
  toPublicReview,
  type ReviewDoc,
} from "./reviews";

const base: ReviewDoc = {
  productId: "vladonix",
  firstName: "Jane",
  lastInitial: "doe",
  date: "2026-09-01",
  text: "Easy to take, arrived quickly and well packed.",
  rating: 5,
  verified: true,
  approved: true,
  permission: true,
};

describe("review visibility", () => {
  it("shows only approved reviews with permission", () => {
    expect(isPublicReview(base)).toBe(true);
    expect(isPublicReview({ ...base, approved: false })).toBe(false);
    expect(isPublicReview({ ...base, permission: false })).toBe(false);
    expect(isPublicReview({ ...base, rating: 0 })).toBe(false);
    expect(isPublicReview({ ...base, rating: 4.5 })).toBe(false);
    expect(isPublicReview({ ...base, text: "  " })).toBe(false);
    expect(isPublicReview(null)).toBe(false);
  });

  it("never shows cured / treated / fixed claims, even when approved", () => {
    for (const text of [
      "This cured my insomnia",
      "It treated my joint problem",
      "Totally fixed my thyroid",
      "My doctor says it reversed things",
      "I no longer need my pills",
      "I came off my meds",
    ]) {
      expect(hasHealthClaim(text), text).toBe(true);
      expect(isPublicReview({ ...base, text })).toBe(false);
    }
    expect(hasHealthClaim("I like how simple the routine is")).toBe(false);
  });

  it("formats names as 'First L.' and never exposes extra fields", () => {
    expect(reviewDisplayName("Jane", "doe")).toBe("Jane D.");
    expect(reviewDisplayName("Jane", "")).toBe("Jane");
    const pub = toPublicReview("r1", { ...base, email: "x@y.z" } as ReviewDoc);
    expect(pub).toEqual({
      id: "r1",
      productId: "vladonix",
      displayName: "Jane D.",
      date: "2026-09-01",
      text: base.text,
      rating: 5,
      verified: true,
    });
  });

  it("summarizes counts and averages", () => {
    expect(summarize([])).toEqual({ count: 0, average: 0 });
    expect(summarize([{ rating: 5 }, { rating: 4 }])).toEqual({ count: 2, average: 4.5 });
    const pubs = [toPublicReview("a", base), toPublicReview("b", { ...base, productId: "x", rating: 3 })];
    expect(summarizeByProduct(pubs)).toEqual({
      vladonix: { count: 1, average: 5 },
      x: { count: 1, average: 3 },
    });
  });
});
