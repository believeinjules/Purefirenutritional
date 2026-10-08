/**
 * Validation for admin review writes (/api/admin/reviews).
 * Pure — no Firebase imports — so it is unit-testable.
 *
 * Approval guard: a review cannot be saved as approved when the customer has
 * not given permission, or when its text makes a health claim
 * (cured / treated / fixed … — see shared/reviews.ts hasHealthClaim).
 */
import { hasHealthClaim, type ReviewDoc } from "../../shared/reviews.js";

export class ReviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewValidationError";
  }
}

function fail(message: string): never {
  throw new ReviewValidationError(message);
}

const PRODUCT_ID_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;
const REVIEW_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const REVIEW_TEXT_MAX = 2000;

export function validateReviewId(id: unknown): string {
  if (typeof id !== "string" || !REVIEW_ID_RE.test(id)) fail("Invalid review id");
  return id;
}

function productId(v: unknown): string {
  if (typeof v !== "string" || !PRODUCT_ID_RE.test(v)) fail("productId must be a product id");
  return v;
}

function firstName(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s || s.length > 40) fail("First name is required (max 40 characters)");
  if (/\s/.test(s) && s.split(/\s+/).length > 2) fail("Use the first name only");
  return s;
}

function lastInitial(v: unknown): string {
  const s = typeof v === "string" ? v.trim().replace(/\.$/, "") : "";
  if (!/^[A-Za-z\u00C0-\u024F]$/.test(s)) fail("Last initial must be one letter");
  return s.toUpperCase();
}

function date(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  const m = DATE_RE.exec(s);
  if (!m) fail("Date must be YYYY-MM-DD");
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) fail("Date must be a real date");
  return s;
}

function text(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) fail("Review text is required");
  if (s.length > REVIEW_TEXT_MAX) fail(`Review text is too long (max ${REVIEW_TEXT_MAX})`);
  return s;
}

function rating(v: unknown): number {
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isInteger(n) || n < 1 || n > 5) fail("Rating must be 1–5");
  return n;
}

function bool(v: unknown, field: string): boolean {
  if (typeof v !== "boolean") fail(`${field} must be true or false`);
  return v;
}

/** Throws when the (merged) review may not be approved. */
export function assertApprovable(r: Pick<ReviewDoc, "approved" | "permission" | "text">): void {
  if (!r.approved) return;
  if (r.permission !== true) fail("Cannot approve: the customer has not given permission to publish");
  if (hasHealthClaim(r.text)) {
    fail("Cannot approve: the review makes a health claim (e.g. cured, treated, fixed). Ask the customer to rephrase.");
  }
}

/** Full review for POST. approved/verified/permission default to false. */
export function validateReviewInput(body: unknown): ReviewDoc {
  if (!body || typeof body !== "object") fail("Body must be an object");
  const b = body as Record<string, unknown>;
  const doc: ReviewDoc = {
    productId: productId(b.productId),
    firstName: firstName(b.firstName),
    lastInitial: lastInitial(b.lastInitial),
    date: date(b.date),
    text: text(b.text),
    rating: rating(b.rating),
    verified: b.verified === undefined ? false : bool(b.verified, "verified"),
    approved: b.approved === undefined ? false : bool(b.approved, "approved"),
    permission: b.permission === undefined ? false : bool(b.permission, "permission"),
  };
  assertApprovable(doc);
  return doc;
}

/** Partial update for PATCH. Call assertApprovable on the merged doc afterwards. */
export function validateReviewPatch(body: unknown): Partial<ReviewDoc> {
  if (!body || typeof body !== "object") fail("Body must be an object");
  const b = body as Record<string, unknown>;
  const out: Partial<ReviewDoc> = {};
  if ("productId" in b) out.productId = productId(b.productId);
  if ("firstName" in b) out.firstName = firstName(b.firstName);
  if ("lastInitial" in b) out.lastInitial = lastInitial(b.lastInitial);
  if ("date" in b) out.date = date(b.date);
  if ("text" in b) out.text = text(b.text);
  if ("rating" in b) out.rating = rating(b.rating);
  if ("verified" in b) out.verified = bool(b.verified, "verified");
  if ("approved" in b) out.approved = bool(b.approved, "approved");
  if ("permission" in b) out.permission = bool(b.permission, "permission");
  if (Object.keys(out).length === 0) fail("Nothing to update");
  return out;
}
