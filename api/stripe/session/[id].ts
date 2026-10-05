import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe } from "../../_lib/stripe.js";

/** Stripe Checkout Session ids look like cs_live_… / cs_test_… */
const SESSION_ID_RE = /^cs_(live|test)_[A-Za-z0-9]{10,255}$/;

function isStripeNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { statusCode?: number; code?: string; type?: string };
  return (
    e.statusCode === 404 ||
    e.code === "resource_missing" ||
    (e.type === "StripeInvalidRequestError" && e.statusCode === 400)
  );
}

/**
 * GET /api/stripe/session/:id
 * Retrieve a Checkout Session for the success page.
 * Returns only what the success page needs (no addresses / payment details).
 * Unknown or malformed ids → 404 JSON (not 500).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.query.id;
  const sessionId = Array.isArray(id) ? id[0] : id;
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Missing session id" });
  }
  if (!SESSION_ID_RE.test(sessionId)) {
    return res.status(404).json({ error: "Checkout session not found" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe is not configured" });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      amount_subtotal: session.amount_subtotal,
      currency: session.currency,
      customer_email: session.customer_email || session.customer_details?.email || null,
      customer_details: session.customer_details
        ? { name: session.customer_details.name ?? null }
        : null,
    });
  } catch (error) {
    if (isStripeNotFound(error)) {
      return res.status(404).json({ error: "Checkout session not found" });
    }
    console.error("[stripe/session]", error);
    return res.status(500).json({ error: "Failed to retrieve session" });
  }
}
