import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe, getSiteOrigin } from "../_lib/stripe.js";
import {
  CheckoutValidationError,
  resolveCheckoutLinesWith,
  type PriceableProduct,
} from "../../shared/product-prices.js";
import { loadFirestoreProducts } from "../_lib/catalog.js";
import {
  flatStripeShippingOption,
  shippingCentsForMerchandiseCents,
} from "../../shared/shipping-rate.js";

const FIRESTORE_LOOKUP_TIMEOUT_MS = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Stripe metadata values are capped at 500 characters. */
function meta(value: string): string {
  return value.length > 500 ? value.slice(0, 500) : value;
}

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
 * Prices are resolved server-side — client price is ignored.
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

    const merchandiseCents = resolved.reduce(
      (sum, item) => sum + item.unitAmountCents * item.quantity,
      0
    );
    const shippingCents = shippingCentsForMerchandiseCents(merchandiseCents);
    const shippingOptions = flatStripeShippingOption(merchandiseCents);
    const zip = typeof postalCode === "string" ? postalCode : "";

    const lineItems = resolved.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description || undefined,
          images: item.image
            ? [
                item.image.startsWith("http")
                  ? item.image
                  : `${origin}${item.image.startsWith("/") ? "" : "/"}${item.image}`,
              ]
            : [],
        },
        unit_amount: item.unitAmountCents,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      automatic_tax: { enabled: true },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: customerEmail || undefined,
      client_reference_id: userId ? meta(userId.toString()).slice(0, 200) : undefined,
      metadata: {
        user_id: meta(userId?.toString() || ""),
        customer_email: meta(customerEmail || ""),
        customer_name: meta(customerName),
        product_ids: meta(resolved.map((r) => r.productId).join(",")),
        ship_to_zip: meta(zip),
        shipping_quote: (shippingCents / 100).toFixed(2),
      },
      allow_promotion_codes: true,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "NZ", "IE"],
      },
      shipping_options: shippingOptions,
    });

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
