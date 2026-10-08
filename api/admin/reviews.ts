import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../_lib/firebase.js";
import { firstQueryValue, requireAdmin } from "../_lib/admin-auth.js";
import { serializeDoc } from "../_lib/serialize.js";
import {
  ReviewValidationError,
  assertApprovable,
  validateReviewId,
  validateReviewInput,
  validateReviewPatch,
} from "../_lib/admin-reviews.js";
import { hasHealthClaim, type ReviewDoc } from "../../shared/reviews.js";

/**
 * Admin review CRUD via Firebase Admin SDK (Firestore `reviews`; browsers
 * cannot write it). Same auth as /api/admin/products.
 *
 *   GET    /api/admin/reviews            → { reviews: [{ id, ...doc, healthClaim }] } (all, newest first)
 *   POST   /api/admin/reviews            → create (approved/permission/verified default false)
 *   PATCH  /api/admin/reviews?id=<id>    → partial update (approval re-checked on the merged doc)
 *   DELETE /api/admin/reviews?id=<id>    → delete
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method || "GET";
  if (!["GET", "POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: "Firebase Admin is not configured" });
  const reviews = db.collection("reviews");

  try {
    if (method === "GET") {
      const snap = await reviews.get();
      const list = snap.docs
        .map((d) => {
          const data = d.data() as Partial<ReviewDoc>;
          return { ...serializeDoc(d.id, d.data()), healthClaim: hasHealthClaim(String(data.text ?? "")) };
        })
        .sort((a, b) =>
          String((b as { date?: string }).date ?? "").localeCompare(String((a as { date?: string }).date ?? ""))
        );
      return res.status(200).json({ reviews: list });
    }

    if (method === "POST") {
      const doc = validateReviewInput(req.body);
      const ref = await reviews.add({
        ...doc,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
        updated_by: admin.email,
      });
      return res.status(201).json({ review: { id: ref.id, ...doc } });
    }

    const id = validateReviewId(firstQueryValue(req.query.id));
    const ref = reviews.doc(id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: `Review "${id}" not found` });

    if (method === "PATCH" || method === "PUT") {
      const patch = validateReviewPatch(req.body);
      const merged = { ...(existing.data() as ReviewDoc), ...patch };
      assertApprovable(merged);
      await ref.update({ ...patch, updated_at: FieldValue.serverTimestamp(), updated_by: admin.email });
      const fresh = await ref.get();
      return res.status(200).json({ review: serializeDoc(id, fresh.data()) });
    }

    await ref.delete();
    return res.status(200).json({ deleted: id });
  } catch (err) {
    if (err instanceof ReviewValidationError) return res.status(400).json({ error: err.message });
    console.error("[admin/reviews]", err);
    return res.status(500).json({ error: "Review request failed" });
  }
}
