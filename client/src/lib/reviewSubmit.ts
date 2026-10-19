/**
 * Public review submission (/review form) — direct Firestore client write.
 *
 * firestore.rules only allow CREATE of a doc shaped exactly like
 * buildPendingReview() (status "pending", approved false, validated fields);
 * clients can never read, update or delete reviews. Julia approves in Admin.
 *
 * Spam protection (no captcha service): honeypot field, minimum time on the
 * form, and a per-browser throttle (localStorage). Rules enforce field shapes
 * and sizes server-side.
 */
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import {
  PUBLIC_EMAIL_MAX,
  PUBLIC_REVIEW_TEXT_MAX,
  PUBLIC_REVIEW_TEXT_MIN,
  parseReviewerName,
} from "@shared/reviews";
import { products as catalog } from "@/data/products";

/** Discontinued products (vercel.json redirects them to /products). */
const DISCONTINUED = new Set(["femalin", "temero-genero", "trezvon", "olecap", "panaxod", "previn", "regenart", "gelmigon", "calsil-t", "indosine"]);

export function reviewableProducts(): Array<{ id: string; name: string }> {
  return catalog
    .filter((p) => !DISCONTINUED.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function findReviewableProduct(id: string | undefined) {
  if (!id) return undefined;
  return reviewableProducts().find((p) => p.id === id);
}

export type ReviewFormInput = {
  productId: string;
  rating: number;
  text: string;
  name: string;
  email: string;
  usedProduct: boolean;
  /** Honeypot: real people leave it empty. */
  website: string;
  /** ms since the form was shown. */
  elapsedMs: number;
};

export const MIN_FILL_MS = 3000;
const THROTTLE_KEY = "pf_review_submits";
const THROTTLE_MAX = 3;
const THROTTLE_WINDOW_MS = 60 * 60 * 1000;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PRODUCT_ID_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;

/** Returns field → message. Empty object = valid. */
export function validateReviewForm(f: ReviewFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!PRODUCT_ID_RE.test(f.productId) || !findReviewableProduct(f.productId)) errors.productId = "Choose a product.";
  if (!Number.isInteger(f.rating) || f.rating < 1 || f.rating > 5) errors.rating = "Choose a star rating.";
  const text = f.text.trim();
  if (text.length < PUBLIC_REVIEW_TEXT_MIN) errors.text = `Please write at least ${PUBLIC_REVIEW_TEXT_MIN} characters.`;
  else if (text.length > PUBLIC_REVIEW_TEXT_MAX) errors.text = `Please keep it under ${PUBLIC_REVIEW_TEXT_MAX} characters.`;
  if (!parseReviewerName(f.name).firstName) errors.name = "Add your first name.";
  const email = f.email.trim();
  if (email && (email.length > PUBLIC_EMAIL_MAX || !EMAIL_RE.test(email))) errors.email = "Check your email address.";
  if (!f.usedProduct) errors.usedProduct = "Please confirm you bought or used this product.";
  return errors;
}

/** True when the submission looks automated (honeypot filled or too fast). */
export function looksLikeBot(f: Pick<ReviewFormInput, "website" | "elapsedMs">): boolean {
  return f.website.trim() !== "" || f.elapsedMs < MIN_FILL_MS;
}

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

/** The exact Firestore document firestore.rules accept (createdAt added on write). */
export function buildPendingReview(f: ReviewFormInput, today = new Date().toISOString().slice(0, 10)) {
  const { firstName, lastInitial } = parseReviewerName(f.name);
  return {
    productId: f.productId,
    rating: f.rating,
    text: f.text.trim(),
    firstName,
    lastInitial,
    email: f.email.trim().toLowerCase(),
    date: today,
    usedProduct: true,
    permission: true,
    verified: false,
    approved: false,
    status: "pending" as const,
    source: "customer-form" as const,
  };
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitReview(f: ReviewFormInput): Promise<SubmitResult> {
  const errors = validateReviewForm(f);
  if (Object.keys(errors).length) return { ok: false, error: Object.values(errors)[0]! };
  // Bots get a silent "success" so they learn nothing.
  if (looksLikeBot(f)) return { ok: true };
  if (isThrottled()) return { ok: false, error: "Thanks — we've already received several reviews from this device. Please try again later." };

  const doc = buildPendingReview(f);
  if (!isFirebaseConfigured()) {
    if (import.meta.env.DEV) {
      // Local preview without Firebase env: simulate success, write nothing.
      console.warn("[review] Firebase not configured — DEV simulated submit:", doc);
      recordSubmit();
      return { ok: true };
    }
    return { ok: false, error: "Reviews are temporarily unavailable. Please try again later." };
  }
  try {
    await addDoc(collection(db, "reviews"), { ...doc, createdAt: serverTimestamp() });
    recordSubmit();
    return { ok: true };
  } catch (err) {
    console.error("[review] submit failed:", err);
    return { ok: false, error: "Something went wrong sending your review. Please try again." };
  }
}
