import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe } from "../../_lib/stripe.js";

/**
 * GET /api/stripe/session/:id
 * Retrieve a Checkout Session for the success page.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const id = req.query.id;
    const sessionId = Array.isArray(id) ? id[0] : id;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ error: "Missing session id" });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return res.status(200).json(session);
  } catch (error) {
    console.error("[stripe/session]", error);
    return res.status(500).json({ error: "Failed to retrieve session" });
  }
}
