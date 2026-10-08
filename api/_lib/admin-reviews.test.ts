import { describe, expect, it } from "vitest";
import {
  assertApprovable,
  validateReviewId,
  validateReviewInput,
  validateReviewPatch,
} from "./admin-reviews";

const base = {
  productId: "bonomarlot",
  firstName: "Jane",
  lastInitial: "d",
  date: "2026-09-30",
  text: "Easy to take and arrived quickly.",
  rating: 5,
};

describe("admin review validation", () => {
  it("creates unapproved reviews by default and normalises fields", () => {
    expect(validateReviewInput(base)).toEqual({
      ...base,
      lastInitial: "D",
      verified: false,
      approved: false,
      permission: false,
    });
  });

  it("rejects bad fields", () => {
    expect(() => validateReviewInput({ ...base, rating: 6 })).toThrow(/1–5/);
    expect(() => validateReviewInput({ ...base, lastInitial: "Doe" })).toThrow(/one letter/);
    expect(() => validateReviewInput({ ...base, date: "2026-02-30" })).toThrow(/real date/);
    expect(() => validateReviewInput({ ...base, date: "30/09/2026" })).toThrow(/YYYY-MM-DD/);
    expect(() => validateReviewInput({ ...base, text: "  " })).toThrow(/required/);
    expect(() => validateReviewInput({ ...base, productId: "Bad Id" })).toThrow(/product id/);
    expect(() => validateReviewInput({ ...base, approved: "yes" })).toThrow(/true or false/);
    expect(() => validateReviewId("../x")).toThrow();
  });

  it("refuses approval without permission", () => {
    expect(() => validateReviewInput({ ...base, approved: true })).toThrow(/permission/);
    expect(validateReviewInput({ ...base, approved: true, permission: true }).approved).toBe(true);
  });

  it("refuses approval of health claims (cured / treated / fixed)", () => {
    for (const text of ["It cured my insomnia", "This treated my joints", "Fixed my thyroid", "I'm off my meds now"]) {
      expect(() => validateReviewInput({ ...base, text, approved: true, permission: true })).toThrow(/health claim/);
      // can still be stored unapproved for follow-up
      expect(validateReviewInput({ ...base, text }).approved).toBe(false);
    }
  });

  it("patch validates only provided fields; approval checked on the merged doc", () => {
    expect(validateReviewPatch({ approved: true })).toEqual({ approved: true });
    expect(() => validateReviewPatch({})).toThrow(/Nothing/);
    const stored = { ...validateReviewInput({ ...base, permission: true }) };
    expect(() => assertApprovable({ ...stored, approved: true })).not.toThrow();
    expect(() => assertApprovable({ ...stored, approved: true, text: "It cured me" })).toThrow(/health claim/);
  });
});
