import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminDb } from "./_lib/firebase.js";
import { firstQueryValue } from "./_lib/admin-auth.js";
import { sendReviewNotification } from "./_lib/email.js";
import { reviewClientKey, takeReviewSlot } from "./_lib/review-rate-limit.js";
import { FieldValue } from "firebase-admin/firestore";
import { buildPendingDocs, looksLikeBot, parseReviewSubmission } from "../shared/review-submission.js";
import { findReviewableProduct, isReviewableProduct } from "../shared/reviewable-products.js";
import {
  reviewDisplayName,
  isPublicReview,
  summarize,
  summarizeByProduct,
  toPublicReview,
  type PublicReview,
  type ReviewDoc,
} from "../shared/reviews.js";

const PRODUCT_ID_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;
const MAX_LATEST = 12;

/**
 * GET /api/reviews                    → { summary: { [productId]: { count, average } } }
 * GET /api/reviews?productId=<id>     → { reviews: PublicReview[], summary: { count, average } }
 * GET /api/reviews?latest=1           → { reviews: PublicReview[] } (product reviews, newest first, max 12)
 * GET /api/reviews?site=1             → { reviews: PublicReview[] } (approved general + service reviews, max 12)
 * POST /api/reviews                   → public /review form submission (see handleSubmit)
 *
 * Public, read-only. Reads Firestore `reviews` with the Admin SDK and returns
 * only reviews that pass shared/reviews.ts isPublicReview (approved + permission
 * + no health claims). No emails or private fields are ever returned.
 * Empty results (not errors) when Firebase Admin is not configured.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") return handleSubmit(req, res);
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const productId = firstQueryValue(req.query.productId as string | string[] | undefined);
  if (productId !== undefined && !PRODUCT_ID_RE.test(productId)) {
    return res.status(400).json({ error: "Invalid productId" });
  }
  const latest = firstQueryValue(req.query.latest as string | string[] | undefined) === "1";
  const site = firstQueryValue(req.query.site as string | string[] | undefined) === "1";

  let reviews: PublicReview[] = [];
  const db = getAdminDb();
  if (db) {
    try {
      let query = db.collection("reviews").where("approved", "==", true);
      if (productId) query = query.where("productId", "==", productId);
      const snap = await query.get();
      reviews = snap.docs
        .filter((d) => isPublicReview(d.data() as Partial<ReviewDoc>))
        .map((d) => toPublicReview(d.id, d.data() as ReviewDoc))
        .sort((a, b) => b.date.localeCompare(a.date));
    } catch (err) {
      console.error("[reviews] read failed:", err);
      reviews = [];
    }
  }

  // Short CDN cache; approvals show up within a few minutes.
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  const productReviews = reviews.filter((r) => r.kind === "product");
  if (productId) {
    return res.status(200).json({ reviews: productReviews, summary: summarize(productReviews) });
  }
  if (site) {
    return res.status(200).json({ reviews: reviews.filter((r) => r.kind !== "product").slice(0, MAX_LATEST) });
  }
  if (latest) {
    return res.status(200).json({ reviews: productReviews.slice(0, MAX_LATEST) });
  }
  return res.status(200).json({ summary: summarizeByProduct(reviews) });
}

/**
 * POST /api/reviews — public /review form. No login. Steps:
 *  1. zod validation (shared/review-submission.ts) + visible-product check;
 *  2. honeypot / too-fast → silent 200, nothing stored;
 *  3. per-IP rate limit (Firestore review_rate_limits, 5 per hour) → 429;
 *  4. write the pending doc(s) to `reviews` (never public until approved);
 *  5. email Julia (api/_lib/email.ts; skipped if SMTP env is missing).
 */
async function handleSubmit(req: VercelRequest, res: VercelResponse) {
  const body = typeof req.body === "string" ? safeJson(req.body) : req.body;
  if (JSON.stringify(body ?? null).length > 8000) return res.status(413).json({ error: "Submission too large" });
  const parsed = parseReviewSubmission(body, isReviewableProduct);
  if (!parsed.ok) {
    return res.status(400).json({ error: Object.values(parsed.errors)[0] ?? "Invalid review", errors: parsed.errors });
  }
  const s = parsed.value;
  if (looksLikeBot(s)) return res.status(200).json({ ok: true });

  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: "Reviews are temporarily unavailable. Please try again later." });

  const allowed = await takeReviewSlot(db, reviewClientKey(req.headers));
  if (!allowed) return res.status(429).json({ error: "Too many reviews from this connection. Please try again later." });

  const docs = buildPendingDocs(s);
  try {
    const main = await db.collection("reviews").add({ ...docs[0], createdAt: FieldValue.serverTimestamp() });
    for (const extra of docs.slice(1)) {
      await db.collection("reviews").add({ ...extra, linkedReviewId: main.id, createdAt: FieldValue.serverTimestamp() });
    }
  } catch (err) {
    console.error("[reviews] submit write failed:", err);
    return res.status(500).json({ error: "Something went wrong sending your review. Please try again." });
  }

  const first = docs[0]!;
  await sendReviewNotification({
    kindLabel: first.kind === "general" ? "general" : "product",
    productName: first.kind === "general" ? "General / not product-specific" : findReviewableProduct(first.productId)?.name ?? first.productId,
    rating: first.rating,
    text: first.text,
    displayName: reviewDisplayName(first.firstName, first.lastInitial),
    email: first.email ?? "",
    serviceText: s.serviceText,
  });
  return res.status(201).json({ ok: true });
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
