import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { reviewableProducts, validateReviewForm, type ReviewFormInput } from "./reviewSubmit";
import { buildPendingDocs, looksLikeBot, parseReviewSubmission, CONSENT_LABEL } from "@shared/review-submission";
import { isReviewableProduct } from "@shared/reviewable-products";
import {
  isPublicReview,
  parseReviewerName,
  reviewStatus,
  reviewsJsonLd,
  summarizeByProduct,
  toPublicReview,
  type PublicReview,
  type ReviewDoc,
} from "@shared/reviews";

const base: ReviewFormInput = {
  productId: "endoluten",
  rating: 5,
  text: "Arrived quickly and easy to take.",
  firstName: "Jane",
  lastInitial: "D",
  email: "",
  consent: true,
  serviceText: "",
  website: "",
  elapsedMs: 10_000,
};
const parse = (f: unknown) => parseReviewSubmission(f, isReviewableProduct);

describe("public review form validation (shared zod schema)", () => {
  it("accepts a valid product review and a General review", () => {
    expect(validateReviewForm(base)).toEqual({});
    expect(validateReviewForm({ ...base, productId: "general" })).toEqual({});
  });
  it("requires product, rating, text, first name, last initial and consent", () => {
    const e = validateReviewForm({ ...base, productId: "nope", rating: 0, text: "short", firstName: " ", lastInitial: "", consent: false });
    expect(Object.keys(e).sort()).toEqual(["consent", "firstName", "lastInitial", "productId", "rating", "text"]);
  });
  it("rejects hidden/discontinued products and non-letters", () => {
    expect(validateReviewForm({ ...base, productId: "calsil-t" }).productId).toBeTruthy();
    expect(validateReviewForm({ ...base, productId: "panaxod" }).productId).toBeTruthy();
    expect(validateReviewForm({ ...base, lastInitial: "7" }).lastInitial).toBeTruthy();
    expect(validateReviewForm({ ...base, lastInitial: "d." })).toEqual({});
  });
  it("caps text at 1000 chars, checks optional email, rejects non-objects", () => {
    expect(validateReviewForm({ ...base, text: "a".repeat(1001) }).text).toBeTruthy();
    expect(validateReviewForm({ ...base, email: "bad" }).email).toBeTruthy();
    expect(validateReviewForm({ ...base, email: "a@b.co" })).toEqual({});
    expect(parse(null).ok).toBe(false);
    expect(parse({ ...base, rating: "5" }).ok).toBe(false);
  });
  it("flags honeypot and too-fast submissions", () => {
    expect(looksLikeBot({ website: "http://spam", elapsedMs: 10_000 })).toBe(true);
    expect(looksLikeBot({ website: "", elapsedMs: 500 })).toBe(true);
    expect(looksLikeBot({ website: "", elapsedMs: 10_000 })).toBe(false);
  });
  it("has the exact consent wording", () => {
    expect(CONSENT_LABEL).toBe("I agree Pure Fire may post my review with my first name and last initial.");
  });
  it("lists visible products without discontinued/hidden ones", () => {
    const ids = reviewableProducts().map((p) => p.id);
    expect(ids).toContain("endoluten");
    for (const id of ["femalin", "panaxod", "calsil-t", "indosine"]) expect(ids).not.toContain(id);
  });
});

describe("pending status", () => {
  const ok = (f: unknown) => {
    const r = parse(f);
    if (!r.ok) throw new Error(JSON.stringify(r.errors));
    return r.value;
  };
  it("every submission is stored pending, unapproved, untagged and not public", () => {
    const docs = buildPendingDocs(ok({ ...base, email: " Jane@Example.com ", serviceText: "Fast shipping, kind replies." }), "2026-10-15");
    expect(docs).toHaveLength(2);
    for (const d of docs) {
      expect(d).toMatchObject({ status: "pending", approved: false, verified: false, permission: true, tag: null, firstName: "Jane", lastInitial: "D", email: "jane@example.com", date: "2026-10-15" });
      expect(isPublicReview(d)).toBe(false);
      expect(reviewStatus(d)).toBe("pending");
    }
    expect(docs[0]).toMatchObject({ kind: "product", productId: "endoluten", rating: 5 });
    expect(docs[1]).toMatchObject({ kind: "service", productId: "", rating: 0, text: "Fast shipping, kind replies." });
  });
  it("General reviews have no product and no service doc unless answered", () => {
    const docs = buildPendingDocs(ok({ ...base, productId: "general" }));
    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({ kind: "general", productId: "" });
  });
  it("firestore.rules give browsers no access to reviews", () => {
    const rules = readFileSync("firestore.rules", "utf8");
    const block = rules.slice(rules.indexOf("match /reviews/{reviewId}"), rules.indexOf("\n    }", rules.indexOf("match /reviews/{reviewId}")));
    expect(block).toContain("allow read, write: if false;");
    expect(block).not.toContain("allow create");
  });
});

const approved = (over: Partial<ReviewDoc> = {}): ReviewDoc => ({
  productId: "endoluten", firstName: "Ann", lastInitial: "B", date: "2026-10-01", text: "Easy to take.", rating: 4,
  verified: false, approved: true, permission: true, status: "approved", kind: "product", ...over,
});

describe("JSON-LD only for approved product reviews", () => {
  const p = { id: "endoluten", name: "Endoluten", url: "https://x/products/endoluten" };
  it("null with no reviews, and pending/rejected docs never become public", () => {
    expect(reviewsJsonLd(p, [])).toBeNull();
    expect(isPublicReview(approved({ status: "pending", approved: false }))).toBe(false);
    expect(isPublicReview(approved({ status: "rejected" }))).toBe(false);
    expect(isPublicReview(approved({ text: "It cured me" }))).toBe(false);
  });
  it("uses only approved product reviews of this product (not general/service/other products)", () => {
    const docs: Array<[string, ReviewDoc]> = [
      ["1", approved()],
      ["2", approved({ rating: 5, tag: "purchased-through-julia" })],
      ["3", approved({ kind: "general", productId: "", rating: 1 })],
      ["4", approved({ kind: "service", productId: "", rating: 0 })],
      ["5", approved({ productId: "vladonix", rating: 1 })],
      ["6", approved({ status: "pending", approved: false, rating: 1 })],
    ];
    const pub: PublicReview[] = docs.filter(([, d]) => isPublicReview(d)).map(([id, d]) => toPublicReview(id, d));
    expect(pub.map((r) => r.id)).toEqual(["1", "2", "3", "4", "5"]);
    const ld = reviewsJsonLd(p, pub) as any;
    expect(ld.aggregateRating).toMatchObject({ ratingValue: 4.5, reviewCount: 2 });
    expect(ld.review).toHaveLength(2);
    expect(reviewsJsonLd(p, pub.filter((r) => r.kind !== "product"))).toBeNull();
    expect(summarizeByProduct(pub)).toEqual({ endoluten: { count: 2, average: 4.5 }, vladonix: { count: 1, average: 1 } });
    expect(pub[1]!.tagLabel).toBe("Purchased through Julia");
    expect(pub[3]!.rating).toBe(0);
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
});
