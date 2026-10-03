import type { VercelRequest, VercelResponse } from "@vercel/node";
import { shippingCentsForMerchandiseUSD } from "../../shared/shipping-rate.js";

/**
 * POST /api/shipping/rate
 * Body: { merchandiseSubtotalUSD: number }
 * Flat customer shipping. Does not call FedEx and does not invent another rate.
 * $19.95 when the merchandise subtotal is $150.00 or below.
 * Free when the merchandise subtotal is strictly over $150.00.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (req.body || {}) as { merchandiseSubtotalUSD?: unknown };
  const subtotal = Number(body.merchandiseSubtotalUSD);
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return res.status(400).json({ error: "merchandise subtotal required" });
  }

  const amountCents = shippingCentsForMerchandiseUSD(subtotal);
  return res.status(200).json({
    available: true,
    amountUSD: amountCents / 100,
    amountCents,
    currency: "usd",
    free: amountCents === 0,
  });
}
