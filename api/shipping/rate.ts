import type { VercelRequest, VercelResponse } from "@vercel/node";
import { quoteUsZipShipping } from "../../shared/shipping-rate.js";

/**
 * POST /api/shipping/rate
 * Body: { postalCode: string, units?: number }
 * Calls FedEx only when FEDEX_* env vars are set.
 * Otherwise returns shipping rate unavailable and no dollar amount.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (req.body || {}) as { postalCode?: unknown; units?: unknown };
  const postalCode = typeof body.postalCode === "string" ? body.postalCode : "";
  const units = Number(body.units);
  const quote = await quoteUsZipShipping({
    postalCode,
    units: Number.isFinite(units) ? units : 1,
  });

  return res.status(200).json(quote);
}
