import type { VercelRequest, VercelResponse } from "@vercel/node";
import type Stripe from "stripe";
import { getStripe } from "../_lib/stripe";
import { getAdminDb } from "../_lib/firebase";
import { sendOrderConfirmation } from "../_lib/email";
import { readRawBody } from "../_lib/read-raw-body";

/** Required so Stripe signature verification gets the unmodified body. */
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * POST /api/stripe/webhook
 * Configure in Stripe Dashboard → Webhooks →
 *   https://www.purefirenutritional.com/api/stripe/webhook
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    return res.status(500).json({ error: "Stripe webhook is not configured" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig || Array.isArray(sig)) {
    return res.status(400).send("Missing stripe-signature header");
  }

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[webhook] signature verification failed:", message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  if (event.id.startsWith("evt_test_")) {
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[webhook] checkout.session.completed", session.id);

        const customerEmail =
          session.customer_email || session.metadata?.customer_email || undefined;
        const customerName =
          session.metadata?.customer_name ||
          session.customer_details?.name ||
          undefined;

        const stripe = getStripe();
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const items = lineItems.data.map((item) => ({
          name: item.description || "Product",
          quantity: item.quantity || 1,
          price: (item.amount_total || 0) / 100,
        }));

        const orderNumber = `ORD-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 11)
          .toUpperCase()}`;

        const adminDb = getAdminDb();
        if (adminDb && customerEmail) {
          const customerRef = adminDb
            .collection("customers")
            .doc(customerEmail.toLowerCase());
          const existingCustomer = await customerRef.get();

          if (existingCustomer.exists) {
            const d = existingCustomer.data()!;
            await customerRef.update({
              totalOrders: (d.totalOrders || 0) + 1,
              totalSpent:
                (d.totalSpent || 0) + (session.amount_total || 0) / 100,
              stripeCustomerId: session.customer,
            });
          } else {
            await customerRef.set({
              email: customerEmail.toLowerCase(),
              name: customerName || null,
              stripeCustomerId: session.customer || null,
              totalOrders: 1,
              totalSpent: (session.amount_total || 0) / 100,
              created_at: new Date().toISOString(),
            });
          }

          await adminDb.collection("orders").add({
            order_number: orderNumber,
            customer_email: customerEmail.toLowerCase(),
            customer_name: customerName || null,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent,
            items,
            subtotal: (session.amount_subtotal || 0) / 100,
            tax: (session.total_details?.amount_tax || 0) / 100,
            shipping: (session.total_details?.amount_shipping || 0) / 100,
            total: (session.amount_total || 0) / 100,
            currency: session.currency?.toUpperCase() || "USD",
            status: "processing",
            payment_status: "paid",
            shipping_address:
              (session as Stripe.Checkout.Session & {
                shipping_details?: { address?: unknown };
              }).shipping_details?.address || null,
            billing_address: session.customer_details?.address || null,
            created_at: new Date().toISOString(),
          });

          console.log(`[webhook] Order ${orderNumber} saved`);
        }

        if (customerEmail && customerName) {
          await sendOrderConfirmation({
            orderId: orderNumber,
            customerName,
            customerEmail,
            items,
            total: (session.amount_total || 0) / 100,
            orderDate: new Date().toISOString(),
          });
        }
        break;
      }
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
        console.log(`[webhook] ${event.type}`);
        break;
      default:
        console.log(`[webhook] unhandled: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[webhook] handler error:", error);
    // Return 200 sparingly — Stripe retries on 5xx. Prefer 500 so it retries.
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
