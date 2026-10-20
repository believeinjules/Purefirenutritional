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
      status: "pending",
      source: "admin",
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
    expect(validateReviewPatch({ approved: true })).toEqual({ approved: true, status: "approved" });
    expect(validateReviewPatch({ status: "rejected" })).toEqual({ status: "rejected", approved: false });
    expect(validateReviewPatch({ status: "approved" })).toEqual({ status: "approved", approved: true });
    expect(() => validateReviewPatch({ status: "live" })).toThrow(/status/);
    expect(validateReviewInput({ ...base, lastInitial: "" }).lastInitial).toBe("");
    expect(() => validateReviewPatch({})).toThrow(/Nothing/);
    const stored = { ...validateReviewInput({ ...base, permission: true }) };
    expect(() => assertApprovable({ ...stored, approved: true })).not.toThrow();
    expect(() => assertApprovable({ ...stored, approved: true, text: "It cured me" })).toThrow(/health claim/);
  });
});

import { itemMatchesProduct, orderConfirmsPurchase } from "./admin-reviews";
describe("verified buyer order match", () => {
  const order = { customer_email: "Jane@Example.com", payment_status: "paid", status: "processing", items: [{ product_id: "endoluten-n20" }] };
  it("matches paid order with the product (incl. size variant) by email", () => {
    expect(orderConfirmsPurchase(order, "jane@example.com", "endoluten")).toBe(true);
    expect(itemMatchesProduct("endoluten", "endoluten")).toBe(true);
  });
  it("rejects other emails, products, unpaid or refunded orders", () => {
    expect(orderConfirmsPurchase(order, "x@example.com", "endoluten")).toBe(false);
    expect(orderConfirmsPurchase(order, "jane@example.com", "cartalax")).toBe(false);
    expect(orderConfirmsPurchase({ ...order, payment_status: "unpaid" }, "jane@example.com", "endoluten")).toBe(false);
    expect(orderConfirmsPurchase({ ...order, status: "refunded" }, "jane@example.com", "endoluten")).toBe(false);
    expect(orderConfirmsPurchase(order, "", "endoluten")).toBe(false);
    expect(itemMatchesProduct("endoluten-forte", "endoluten")).toBe(false);
  });
});

describe("admin review tag", async () => {
  const { validateReviewPatch } = await import("./admin-reviews.js");
  it("accepts the two tags and clearing, rejects anything else", () => {
    expect(validateReviewPatch({ tag: "purchased-through-julia" })).toEqual({ tag: "purchased-through-julia" });
    expect(validateReviewPatch({ tag: "verified-buyer" })).toEqual({ tag: "verified-buyer" });
    expect(validateReviewPatch({ tag: null })).toEqual({ tag: null });
    expect(() => validateReviewPatch({ tag: "best-ever" })).toThrow();
  });
});
