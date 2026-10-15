import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildPendingReview,
  looksLikeBot,
  reviewableProducts,
  validateReviewForm,
  type ReviewFormInput,
} from "./reviewSubmit";
import { parseReviewerName, reviewStatus, reviewsJsonLd, isPublicReview, type PublicReview } from "@shared/reviews";

const base: ReviewFormInput = {
  productId: "endoluten",
  rating: 5,
  text: "Arrived quickly and easy to take.",
  name: "Jane D.",
  email: "",
  usedProduct: true,
  website: "",
  elapsedMs: 10_000,
};

describe("public review form", () => {
  it("accepts a valid submission", () => {
    expect(validateReviewForm(base)).toEqual({});
  });
  it("requires rating, text, name, product and the used-product checkbox", () => {
    const e = validateReviewForm({ ...base, rating: 0, text: "short", name: " ", productId: "nope", usedProduct: false });
    expect(Object.keys(e).sort()).toEqual(["name", "productId", "rating", "text", "usedProduct"]);
  });
  it("caps text at 1000 chars and checks optional email", () => {
    expect(validateReviewForm({ ...base, text: "a".repeat(1001) }).text).toBeTruthy();
    expect(validateReviewForm({ ...base, email: "bad" }).email).toBeTruthy();
    expect(validateReviewForm({ ...base, email: "a@b.co" }).email).toBeUndefined();
  });
  it("flags honeypot and too-fast submissions", () => {
    expect(looksLikeBot({ website: "http://spam", elapsedMs: 10_000 })).toBe(true);
    expect(looksLikeBot({ website: "", elapsedMs: 500 })).toBe(true);
    expect(looksLikeBot({ website: "", elapsedMs: 10_000 })).toBe(false);
  });
  it("builds a pending, non-public doc", () => {
    const d = buildPendingReview({ ...base, email: " Jane@Example.com " }, "2026-10-15");
    expect(d).toMatchObject({ status: "pending", approved: false, verified: false, permission: true, firstName: "Jane", lastInitial: "D", email: "jane@example.com", date: "2026-10-15" });
    expect(isPublicReview(d)).toBe(false);
  });
  it("pending doc keys match firestore.rules hasOnly list", () => {
    const rules = readFileSync("firestore.rules", "utf8");
    const keys = [...Object.keys(buildPendingReview(base)), "createdAt"];
    for (const k of keys) expect(rules).toContain(`'${k}'`);
  });
  it("lists products without discontinued ones", () => {
    const ids = reviewableProducts().map((p) => p.id);
    expect(ids).toContain("endoluten");
    expect(ids).not.toContain("femalin");
  });
});

describe("shared review helpers", () => {
  it("parses reviewer names", () => {
    expect(parseReviewerName("Jane")).toEqual({ firstName: "Jane", lastInitial: "" });
    expect(parseReviewerName("jane doe")).toEqual({ firstName: "jane", lastInitial: "D" });
  });
  it("derives status for old docs", () => {
    expect(reviewStatus({ approved: true })).toBe("approved");
    expect(reviewStatus({ approved: false })).toBe("pending");
    expect(reviewStatus({ approved: false, status: "rejected" })).toBe("rejected");
  });
  it("rejected/pending status never public even if approved flag set", () => {
    const r = { productId: "x", firstName: "A", text: "fine", rating: 5, approved: true, permission: true };
    expect(isPublicReview(r)).toBe(true);
    expect(isPublicReview({ ...r, status: "rejected" as const })).toBe(false);
  });
  it("JSON-LD only with reviews", () => {
    const p = { id: "endoluten", name: "Endoluten", url: "https://x/products/endoluten" };
    expect(reviewsJsonLd(p, [])).toBeNull();
    const reviews: PublicReview[] = [
      { id: "1", productId: "endoluten", displayName: "A B.", date: "2026-10-01", text: "ok", rating: 4, verified: false },
      { id: "2", productId: "endoluten", displayName: "C.", date: "2026-10-02", text: "ok", rating: 5, verified: false },
    ];
    const ld = reviewsJsonLd(p, reviews) as any;
    expect(ld.aggregateRating).toMatchObject({ ratingValue: 4.5, reviewCount: 2 });
    expect(ld.review).toHaveLength(2);
    expect(ld["@id"]).toBe("https://x/products/endoluten#product");
  });
});
