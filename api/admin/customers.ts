import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminDb } from "../_lib/firebase.js";
import { requireAdmin } from "../_lib/admin-auth.js";
import { serializeDoc } from "../_lib/serialize.js";
import { normalizeCustomer, parsePageParams } from "../_lib/admin-list.js";

/**
 * GET /api/admin/customers?limit=100&after=<cursor>
 * Newest first (created_at desc). Read via Firebase Admin SDK — the
 * `customers` collection is not readable by browsers under Firestore rules.
 * Auth: Bearer Firebase ID token, ADMIN_EMAILS + verified (api/_lib/admin-auth.ts).
 * Response: { customers: [...], nextCursor: string | null }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const db = getAdminDb();
  if (!db) {
    return res.status(503).json({ error: "Firebase Admin is not configured" });
  }

  try {
    const { limit, after } = parsePageParams(req);
    let query = db.collection("customers").orderBy("created_at", "desc").limit(limit);
    if (after) query = query.startAfter(after);
    const snap = await query.get();
    const customers = snap.docs.map((d) =>
      normalizeCustomer(serializeDoc(d.id, d.data()) as { id: string } & Record<string, unknown>)
    );
    const last = customers[customers.length - 1];
    return res.status(200).json({
      customers,
      nextCursor: snap.size === limit && last?.created_at ? last.created_at : null,
    });
  } catch (err) {
    console.error("[admin/customers]", err);
    return res.status(500).json({ error: "Failed to load customers" });
  }
}
