import type { VercelRequest, VercelResponse } from "@vercel/node";
import type Stripe from "stripe";
import { getStripe } from "../_lib/stripe.js";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../_lib/firebase.js";
import { sendOrderConfirmation } from "../_lib/email.js";
import { readRawBody } from "../_lib/read-raw-body.js";

/** Required so Stripe signature verification gets the unmodified body. */
export const config = {
  api: {
    bodyParser: false,
  },
};

/** Order line as stored on orders/{sessionId}.items (bundle fields null for older sessions). */
export function orderItemFromLineItem(item: Stripe.LineItem) {
  const product = item.price?.product;
  const md =
    product && typeof product === "object" && !("deleted" in product && product.deleted)
      ? ((product as Stripe.Product).metadata ?? {})
      : {};
  const int = (v: string | undefined) => {
    const n = v === undefined || v === "" ? NaN : Number(v);
    return Number.isInteger(n) ? n : null;
  };
  const quantity = item.quantity || 1;
  const bundleBottles = int(md.bundle_bottles);
  const discountCents = int(md.discount_per_bottle_cents);
  const singleCents = int(md.single_bottle_cents);
  return {
    name: item.description || "Product",
    quantity,
    price: (item.amount_total || 0) / 100,
    product_id: md.product_id || null,
    size: md.size || null,
    bundle_bottles: bundleBottles && bundleBottles > 1 ? bundleBottles : null,
    bottles_total: (bundleBottles ?? 1) * quantity,
    bundle_discount_per_bottle: discountCents && bundleBottles && bundleBottles > 1 ? discountCents / 100 : null,
    single_bottle_price: singleCents !== null ? singleCents / 100 : null,
  };
}

function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
}

/**
 * Persist the order + customer via Admin SDK and send the confirmation email.
 *
 * Idempotent: the order doc id is the Stripe session id, created inside a
 * transaction, so Stripe retries never create duplicate orders or double-count
 * customer totals, and the email is only sent the first time.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const customerEmail = (
    session.customer_details?.email ||
    session.customer_email ||
    session.metadata?.customer_email ||
    ""
  )
    .trim()
    .toLowerCase();

  const shippingDetails = session.collected_information?.shipping_details ?? null;
  const customerName =
    session.metadata?.customer_name?.trim() ||
    session.customer_details?.name?.trim() ||
    shippingDetails?.name?.trim() ||
    "";

  const stripe = getStripe();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    // product.metadata carries product id / size / bundle info set at checkout
    expand: ["data.price.product"],
  });
  const items = lineItems.data.map(orderItemFromLineItem);

  const total = (session.amount_total || 0) / 100;
  let orderNumber = generateOrderNumber();
  let isNewOrder = true;

  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error(
      `[webhook] Firebase Admin not configured — order for ${session.id} NOT saved`
    );
  } else {
    const orderRef = adminDb.collection("orders").doc(session.id);
    const customerRef = customerEmail
      ? adminDb.collection("customers").doc(customerEmail)
      : null;
    const nowIso = new Date().toISOString();

    await adminDb.runTransaction(async (tx) => {
      const existingOrder = await tx.get(orderRef);
      const existingCustomer = customerRef ? await tx.get(customerRef) : null;

      if (existingOrder.exists) {
        isNewOrder = false;
        orderNumber = (existingOrder.get("order_number") as string) || orderNumber;
        return;
      }

      tx.set(orderRef, {
        order_number: orderNumber,
        customer_email: customerEmail || null,
        customer_name: customerName || null,
        stripe_session_id: session.id,
        stripe_payment_intent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        stripe_customer_id:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null,
        items,
        bundles: session.metadata?.bundles || null,
        subtotal: (session.amount_subtotal || 0) / 100,
        tax: (session.total_details?.amount_tax || 0) / 100,
        shipping: (session.total_details?.amount_shipping || 0) / 100,
        total,
        currency: session.currency?.toUpperCase() || "USD",
        status: "processing",
        payment_status: session.payment_status || "paid",
        shipping_name: shippingDetails?.name || null,
        shipping_address: shippingDetails?.address || null,
        billing_address: session.customer_details?.address || null,
        created_at: nowIso,
      });

      if (customerRef && existingCustomer) {
        const stripeCustomerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;
        if (existingCustomer.exists) {
          tx.update(customerRef, {
            totalOrders: FieldValue.increment(1),
            totalSpent: FieldValue.increment(total),
            last_order_at: nowIso,
            ...(stripeCustomerId ? { stripeCustomerId } : {}),
            ...(customerName && !existingCustomer.get("name")
              ? { name: customerName }
              : {}),
          });
        } else {
          tx.set(customerRef, {
            email: customerEmail,
            name: customerName || null,
            stripeCustomerId,
            totalOrders: 1,
            totalSpent: total,
            created_at: nowIso,
            last_order_at: nowIso,
          });
        }
      }
    });

    console.log(
      isNewOrder
        ? `[webhook] Order ${orderNumber} saved (orders/${session.id})`
        : `[webhook] Duplicate delivery for ${session.id} — already saved as ${orderNumber}`
    );
  }

  if (isNewOrder && customerEmail) {
    const sent = await sendOrderConfirmation({
      orderId: orderNumber,
      customerName: customerName || "Customer",
      customerEmail,
      items,
      total,
      orderDate: new Date().toISOString(),
    });
    if (!sent) {
      console.warn(`[webhook] confirmation email not sent for ${orderNumber}`);
    }
  }
}

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
        await handleCheckoutCompleted(session);
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
