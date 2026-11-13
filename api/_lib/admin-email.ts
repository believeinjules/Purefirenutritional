import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash, timingSafeEqual } from "node:crypto";
import { requireAdmin } from "./admin-auth.js";
import { getAdminDb } from "./firebase.js";
import { EMAIL_TEST_RECIPIENT, fromHeader, sendEmailTest, sendOrderConfirmation } from "./email.js";

/**
 * Owner-only email tools, served from api/admin/[collection].ts (no new
 * function file — Vercel Hobby allows 12):
 *
 *   POST /api/admin/email-test
 *     Sends "Pure Fire email test" to purefiren@gmail.com only.
 *     Auth: admin Firebase ID token (ADMIN_EMAILS + verified), or the
 *     temporary x-email-test-token header matching EMAIL_TEST_TOKEN.
 *
 *   POST /api/admin/resend-confirmation  { sessionId }
 *     One-off: re-sends the customer confirmation (same template) for the
 *     single hard-coded order below, read from Firestore. No writes, no owner
 *     notice. Auth: x-email-test-token only; disabled when EMAIL_TEST_TOKEN is unset.
 */
export const ONE_OFF_RESEND_SESSION_ID =
  "cs_live_bcz2sI4JF3BVUcXS1axSjqgQvAQpkrAYnOpCQu8kL5JqovGtw2mzwCU7wu";

const MIN_TOKEN_LENGTH = 32;

function sha(v: string): Buffer {
  return createHash("sha256").update(v).digest();
}

/** True only when EMAIL_TEST_TOKEN is set (>= 32 chars) and the header matches it. */
export function emailTestTokenMatches(req: Pick<VercelRequest, "headers">, env = process.env): boolean {
  const expected = env.EMAIL_TEST_TOKEN?.trim();
  if (!expected || expected.length < MIN_TOKEN_LENGTH) return false;
  const raw = req.headers["x-email-test-token"];
  const got = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  if (!got) return false;
  return timingSafeEqual(sha(got), sha(expected));
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 1)}***@${domain}`;
}

export async function handleEmailTest(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");
  if (!emailTestTokenMatches(req)) {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
  }
  const result = await sendEmailTest();
  return res.status(result.ok ? 200 : 502).json({ to: EMAIL_TEST_RECIPIENT, ...result });
}

type StoredItem = { name?: unknown; quantity?: unknown; price?: unknown };

export async function handleResendConfirmation(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");
  if (!emailTestTokenMatches(req)) {
    return res.status(404).json({ error: "Not found" });
  }
  const body = (typeof req.body === "string" ? safeJson(req.body) : req.body) as { sessionId?: unknown } | null;
  if (!body || body.sessionId !== ONE_OFF_RESEND_SESSION_ID) {
    return res.status(400).json({ error: "This one-off resend only covers its single order" });
  }
  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: "Firebase Admin is not configured" });

  const snap = await db.collection("orders").doc(ONE_OFF_RESEND_SESSION_ID).get();
  if (!snap.exists) return res.status(404).json({ error: "Order not found" });
  const d = snap.data() as Record<string, unknown>;
  const customerEmail = String(d.customer_email ?? "").trim().toLowerCase();
  if (!customerEmail) return res.status(422).json({ error: "Order has no customer email" });
  const items = (Array.isArray(d.items) ? (d.items as StoredItem[]) : []).map((i) => ({
    name: String(i.name ?? "Product"),
    quantity: Number(i.quantity) || 1,
    price: Number(i.price) || 0,
  }));
  const orderId = String(d.order_number ?? ONE_OFF_RESEND_SESSION_ID);
  const sent = await sendOrderConfirmation({
    orderId,
    customerName: String(d.customer_name ?? "").trim() || "Customer",
    customerEmail,
    items,
    total: Number(d.total) || 0,
    orderDate: String(d.created_at ?? new Date().toISOString()),
  });
  console.log(`[admin/resend-confirmation] ${orderId} → ${maskEmail(customerEmail)} sent=${sent}`);
  return res.status(sent ? 200 : 502).json({
    sent,
    orderId,
    to: maskEmail(customerEmail),
    from: fromHeader(),
    total: Number(d.total) || 0,
    items,
  });
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
