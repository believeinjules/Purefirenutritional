import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe, getSiteOrigin } from "../_lib/stripe";
import { resolveCheckoutLines } from "../../shared/product-prices";

/**
 * POST /api/stripe/create-checkout-session
 * Guest checkout supported (no auth required).
 * Prices are resolved server-side from the product catalog — client price is ignored.
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

    const { items, customerEmail, customerName, userId } = req.body || {};

    let resolved;
    try {
      resolved = resolveCheckoutLines(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid items";
      return res.status(400).json({ error: message });
    }

    const origin = getSiteOrigin(req.headers.origin);
    const stripe = getStripe();

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
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: customerEmail || undefined,
      client_reference_id: userId?.toString() || undefined,
      metadata: {
        user_id: userId?.toString() || "",
        customer_email: customerEmail || "",
        customer_name: customerName || "",
        product_ids: resolved.map((r) => r.productId).join(","),
      },
      allow_promotion_codes: true,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "NZ", "IE"],
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("[create-checkout-session]", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
