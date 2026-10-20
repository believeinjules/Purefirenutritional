/**
 * Public review submission (/review form) → POST /api/reviews.
 *
 * The server validates with the same zod schema (shared/review-submission.ts),
 * checks the honeypot, rate-limits per IP, writes `status: "pending"` docs with
 * the Admin SDK and emails Julia. Browsers never write Firestore `reviews`.
 * A per-browser throttle (localStorage) stops accidental repeat sends.
 */
import { findReviewableProduct, isReviewableProduct, reviewableProducts } from "@shared/reviewable-products";
import {
  GENERAL_REVIEW_VALUE,
  looksLikeBot,
  parseReviewSubmission,
  type ReviewSubmission,
} from "@shared/review-submission";

export { findReviewableProduct, isReviewableProduct, reviewableProducts };

export type ReviewFormInput = {
  productId: string;
  rating: number;
  text: string;
  firstName: string;
  lastInitial: string;
  email: string;
  consent: boolean;
  serviceText: string;
  website: string;
  elapsedMs: number;
};

/** Returns field → message. Empty object = valid. */
export function validateReviewForm(f: ReviewFormInput): Record<string, string> {
  const r = parseReviewSubmission(f, isReviewableProduct);
  return r.ok ? {} : r.errors;
}

const THROTTLE_KEY = "pf_review_submits";
const THROTTLE_MAX = 3;
const THROTTLE_WINDOW_MS = 60 * 60 * 1000;

function readThrottle(now: number): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(THROTTLE_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((t) => typeof t === "number" && now - t < THROTTLE_WINDOW_MS) : [];
  } catch {
    return [];
  }
}

export function isThrottled(now = Date.now()): boolean {
  if (typeof localStorage === "undefined") return false;
  return readThrottle(now).length >= THROTTLE_MAX;
}

function recordSubmit(now = Date.now()) {
  try {
    localStorage.setItem(THROTTLE_KEY, JSON.stringify([...readThrottle(now), now]));
  } catch {
    /* private mode: ignore */
  }
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitReview(f: ReviewFormInput): Promise<SubmitResult> {
  const errors = validateReviewForm(f);
  if (Object.keys(errors).length) return { ok: false, error: Object.values(errors)[0]! };
  // Bots get a silent "success" so they learn nothing.
  if (looksLikeBot({ website: f.website, elapsedMs: f.elapsedMs })) return { ok: true };
  if (isThrottled()) return { ok: false, error: "Thanks — we've already received several reviews from this device. Please try again later." };

  const body: ReviewSubmission = { ...f, consent: f.consent as true };
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      recordSubmit();
      return { ok: true };
    }
    if (res.status === 429) return { ok: false, error: "Thanks — we've received several reviews from you already. Please try again in an hour." };
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error || "Something went wrong sending your review. Please try again." };
  } catch (err) {
    console.error("[review] submit failed:", err);
    return { ok: false, error: "Something went wrong sending your review. Please try again." };
  }
}

export { GENERAL_REVIEW_VALUE };
