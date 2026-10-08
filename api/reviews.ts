import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminDb } from "./_lib/firebase.js";
import { firstQueryValue } from "./_lib/admin-auth.js";
import {
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
 * GET /api/reviews?latest=1           → { reviews: PublicReview[] } (newest first, max 12)
 *
 * Public, read-only. Reads Firestore `reviews` with the Admin SDK and returns
 * only reviews that pass shared/reviews.ts isPublicReview (approved + permission
 * + no health claims). No emails or private fields are ever returned.
 * Empty results (not errors) when Firebase Admin is not configured.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const productId = firstQueryValue(req.query.productId as string | string[] | undefined);
  if (productId !== undefined && !PRODUCT_ID_RE.test(productId)) {
    return res.status(400).json({ error: "Invalid productId" });
  }
  const latest = firstQueryValue(req.query.latest as string | string[] | undefined) === "1";

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

  if (productId) {
    return res.status(200).json({ reviews, summary: summarize(reviews) });
  }
  if (latest) {
    return res.status(200).json({ reviews: reviews.slice(0, MAX_LATEST) });
  }
  return res.status(200).json({ summary: summarizeByProduct(reviews) });
}
