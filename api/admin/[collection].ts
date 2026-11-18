import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminDb } from "../_lib/firebase.js";
import { requireAdmin } from "../_lib/admin-auth.js";
import { serializeDoc } from "../_lib/serialize.js";
import {
  normalizeCustomer,
  normalizeOrder,
  parsePageParams,
} from "../_lib/admin-list.js";
import { handleEmailTest } from "../_lib/admin-email.js";
import { MAILING_LIST_COLLECTION, subscribersToCsv } from "../_lib/daily-fire-subscriber.js";

/** Hard cap for one export (Firestore read cost / function memory). */
export const SUBSCRIBER_EXPORT_MAX = 10000;

/**
 * GET /api/admin/subscribers-export → CSV of Firestore `mailing_list` (footer form +
 * Daily Fire popup). Same admin auth as the lists below; shares this function
 * because of the Vercel 12-function limit.
 */
async function handleSubscribersCsv(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: "Firebase Admin is not configured" });
  try {
    const snap = await db.collection(MAILING_LIST_COLLECTION).limit(SUBSCRIBER_EXPORT_MAX).get();
    const csv = subscribersToCsv(snap.docs.map((d) => ({ id: d.id, data: d.data() as Record<string, unknown> })));
    const day = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="pure-fire-mailing-list-${day}.csv"`);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(csv);
  } catch (err) {
    console.error("[admin/subscribers]", err);
    return res.status(500).json({ error: "Failed to export subscribers" });
  }
}

/**
 * GET /api/admin/orders?limit=100&after=<cursor>
 * GET /api/admin/customers?limit=100&after=<cursor>
 *
 * One function serves both read-only admin lists (they were identical apart from the
 * collection and normaliser) to stay within the Vercel Hobby 12-function limit. Static
 * routes in api/admin/ (inventory, products, reviews, seed-products) take precedence;
 * any other collection name is a 404.
 *
 * Newest first (created_at desc). Read via Firebase Admin SDK — these collections are not
 * readable by browsers under Firestore rules.
 * Auth: Bearer Firebase ID token, ADMIN_EMAILS + verified (api/_lib/admin-auth.ts).
 * Response: { orders | customers: [...], nextCursor: string | null }
 */
const COLLECTIONS = {
  orders: normalizeOrder,
  customers: normalizeCustomer,
} as const;

type CollectionName = keyof typeof COLLECTIONS;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.collection;
  const name = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  // Owner email test shares this function (Hobby 12-function limit); see api/_lib/admin-email.ts.
  if (name === "email-test") return handleEmailTest(req, res);
  if (name === "subscribers-export") return handleSubscribersCsv(req, res);
  if (!Object.prototype.hasOwnProperty.call(COLLECTIONS, name)) {
    return res.status(404).json({ error: "Not found" });
  }
  const collection = name as CollectionName;

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
    let query = db
      .collection(collection)
      .orderBy("created_at", "desc")
      .limit(limit);
    if (after) query = query.startAfter(after);
    const snap = await query.get();
    const normalize = COLLECTIONS[collection];
    const items = snap.docs.map(d =>
      normalize(
        serializeDoc(d.id, d.data()) as { id: string } & Record<string, unknown>
      )
    );
    const last = items[items.length - 1];
    return res.status(200).json({
      [collection]: items,
      nextCursor:
        snap.size === limit && last?.created_at ? last.created_at : null,
    });
  } catch (err) {
    console.error(`[admin/${collection}]`, err);
    return res.status(500).json({ error: `Failed to load ${collection}` });
  }
}
