// Stripe webhook handler
import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { logError, logAPICall } from '../logger.js';
import { sendOrderConfirmation } from '../email.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// POST /api/stripe/webhook
// Handle Stripe webhook events
router.post('/webhook', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const sig = req.headers['stripe-signature'] as string;
  
  let event: Stripe.Event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
    
    // Handle test events
    if (event.id.startsWith('evt_test_')) {
      console.log('[Webhook] Test event detected, returning verification response');
      logAPICall({
        endpoint: '/api/stripe/webhook',
        method: 'POST',
        statusCode: 200,
        responseTime: Date.now() - startTime
      });
      return res.json({ verified: true });
    }
    
    console.log(`[Webhook] Received event: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('[Webhook] Checkout session completed:', session.id);
        
        // Extract customer information
        const customerEmail = session.customer_email || session.metadata?.customer_email;
        const customerName = session.metadata?.customer_name || session.customer_details?.name;
        const userId = session.client_reference_id || session.metadata?.user_id;
        
        // Get line items
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        
        // Format items for email
        const items = lineItems.data.map(item => ({
          name: item.description || 'Product',
          quantity: item.quantity || 1,
          price: (item.amount_total || 0) / 100
        }));
        
        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create or update customer
        if (customerEmail) {
          const { data: existingCustomer } = await supabase
            .from('customers')
            .select('*')
            .eq('email', customerEmail)
            .single();

          let customerId;
          if (existingCustomer) {
            customerId = existingCustomer.id;
            // Update customer stats
            await supabase
              .from('customers')
              .update({
                total_orders: existingCustomer.total_orders + 1,
                total_spent: Number(existingCustomer.total_spent) + ((session.amount_total || 0) / 100),
                stripe_customer_id: session.customer,
              })
              .eq('id', customerId);
          } else {
            const { data: newCustomer } = await supabase
              .from('customers')
              .insert({
                email: customerEmail,
                name: customerName,
                stripe_customer_id: session.customer,
                total_orders: 1,
                total_spent: (session.amount_total || 0) / 100,
              })
              .select()
              .single();
            customerId = newCustomer?.id;
          }

          // Save order to database
          await supabase.from('orders').insert({
            order_number: orderNumber,
            customer_id: customerId,
            customer_email: customerEmail,
            customer_name: customerName,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent,
            items: items,
            subtotal: (session.amount_subtotal || 0) / 100,
            tax: (session.total_details?.amount_tax || 0) / 100,
            shipping: (session.total_details?.amount_shipping || 0) / 100,
            total: (session.amount_total || 0) / 100,
            currency: session.currency?.toUpperCase() || 'USD',
            status: 'processing',
            payment_status: 'paid',
            shipping_address: (session as any).shipping_details?.address || null,
            billing_address: session.customer_details?.address || null,
          });

          console.log(`[Webhook] Order ${orderNumber} saved to database`);
        }

        // Send order confirmation email
        if (customerEmail && customerName) {
          await sendOrderConfirmation({
            orderId: orderNumber,
            customerName,
            customerEmail,
            items,
            total: (session.amount_total || 0) / 100,
            orderDate: new Date().toISOString()
          });
        }
        
        console.log('[Webhook] Order processed for user:', userId);
        
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Webhook] Payment succeeded:', paymentIntent.id);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Webhook] Payment failed:', paymentIntent.id);
        break;
      }
      
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
    
    logAPICall({
      endpoint: '/api/stripe/webhook',
      method: 'POST',
      statusCode: 200,
      responseTime: Date.now() - startTime
    });
    
    res.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logError({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: '/api/stripe/webhook',
      context: 'Stripe webhook processing'
    });
    
    logAPICall({
      endpoint: '/api/stripe/webhook',
      method: 'POST',
      statusCode: 400,
      responseTime: Date.now() - startTime,
      error: errorMessage
    });
    
    res.status(400).send(`Webhook Error: ${errorMessage}`);
  }
});

export default router;
