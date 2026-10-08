import { describe, expect, it } from "vitest";
import { formatReviewDate } from "./format";

describe("formatReviewDate", () => {
  it("formats ISO dates without timezone drift", () => {
    expect(formatReviewDate("2026-09-30")).toBe("September 30, 2026");
    expect(formatReviewDate("2026-01-01")).toBe("January 1, 2026");
  });
  it("returns empty for bad input", () => {
    expect(formatReviewDate("")).toBe("");
    expect(formatReviewDate("30/09/2026")).toBe("");
  });
});
