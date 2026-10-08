import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe, getSiteOrigin } from "../_lib/stripe.js";
import {
  CheckoutValidationError,
  resolveCheckoutLinesWith,
  type PriceableProduct,
} from "../../shared/product-prices.js";
import { loadFirestoreProducts } from "../_lib/catalog.js";
import { buildCheckoutSessionParams } from "../_lib/checkout-session.js";

const FIRESTORE_LOOKUP_TIMEOUT_MS = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function lookupWithTimeout(ids: string[]): Promise<Map<string, PriceableProduct>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      loadFirestoreProducts(ids),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Firestore product lookup timed out")),
          FIRESTORE_LOOKUP_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * POST /api/stripe/create-checkout-session
 * Guest checkout supported (no auth required).
 * Prices are resolved server-side — client price is ignored. Cycle bundles
 * (items[].bundle = 2 | 3) and free shipping are also computed here.
 * Source of truth: Firestore `products/{id}` (Admin SDK), falling back to the
 * code catalog (client/src/data/products.ts) when Firestore is unavailable or
 * the doc is missing / malformed.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const { items, customerEmail: rawEmail, customerName: rawName, userId, postalCode } =
      req.body || {};

    const customerEmail =
      typeof rawEmail === "string" && rawEmail.trim() ? rawEmail.trim() : undefined;
    if (customerEmail && !EMAIL_RE.test(customerEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    const customerName = typeof rawName === "string" ? rawName.trim() : "";

    let resolved;
    try {
      resolved = await resolveCheckoutLinesWith(items, lookupWithTimeout);
    } catch (err) {
      if (err instanceof CheckoutValidationError) {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }

    const origin = getSiteOrigin(req.headers.origin);
    const stripe = getStripe();

    const zip = typeof postalCode === "string" ? postalCode : "";
    const { params, shippingCents } = buildCheckoutSessionParams({
      resolved,
      origin,
      customerEmail,
      customerName,
      userId,
      postalCode: zip,
    });

    // Bundle prices and free shipping are computed above from the live
    // catalog + shared/commerce-config.ts; nothing price-related comes from the client.
    const session = await stripe.checkout.sessions.create(params);

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      shipping: {
        available: true,
        amountUSD: shippingCents / 100,
        amountCents: shippingCents,
        currency: "usd",
        free: shippingCents === 0,
      },
    });
  } catch (error) {
    console.error("[create-checkout-session]", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
