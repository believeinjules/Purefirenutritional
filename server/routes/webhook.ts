import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { logError, logAPICall } from "../logger.js";
import { sendOrderConfirmation } from "../email.js";
import { adminDb } from "../lib/firebase.js";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// POST /api/stripe/webhook
router.post("/webhook", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected");
      return res.json({ verified: true });
    }

    console.log(`[Webhook] Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[Webhook] Checkout session completed:", session.id);

        const customerEmail =
          session.customer_email || session.metadata?.customer_email;
        const customerName =
          session.metadata?.customer_name || session.customer_details?.name;

        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const items = lineItems.data.map((item) => ({
          name: item.description || "Product",
          quantity: item.quantity || 1,
          price: (item.amount_total || 0) / 100,
        }));

        const orderNumber = `ORD-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;

        if (customerEmail) {
          // Upsert customer document (keyed by email)
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

          // Save order
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
              (session as any).shipping_details?.address || null,
            billing_address: session.customer_details?.address || null,
            created_at: new Date().toISOString(),
          });

          console.log(`[Webhook] Order ${orderNumber} saved to Firestore`);
        }

        // Send confirmation email
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

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log("[Webhook] Payment succeeded:", pi.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log("[Webhook] Payment failed:", pi.id);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    logAPICall({
      endpoint: "/api/stripe/webhook",
      method: "POST",
      statusCode: 200,
      responseTime: Date.now() - startTime,
    });

    res.json({ received: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    logError({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: "/api/stripe/webhook",
      context: "Stripe webhook processing",
    });

    logAPICall({
      endpoint: "/api/stripe/webhook",
      method: "POST",
      statusCode: 400,
      responseTime: Date.now() - startTime,
      error: errorMessage,
    });

    res.status(400).send(`Webhook Error: ${errorMessage}`);
  }
});

export default router;
