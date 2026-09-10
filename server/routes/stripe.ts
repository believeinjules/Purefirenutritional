// Stripe payment processing routes
import { Router } from 'express';
import Stripe from 'stripe';
import { logError, logAPICall } from '../logger.js';
import { resolveCheckoutLines } from '../../shared/product-prices.js';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

function siteOrigin(req: { headers: { origin?: string } }): string {
  if (req.headers.origin) return req.headers.origin.replace(/\/$/, '');
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, '');
  return 'https://www.purefirenutritional.com';
}

// POST /api/stripe/create-checkout-session
// Create a Stripe Checkout session for payment
// Optional auth - allow guest checkout
// Prices resolved server-side from catalog — do not trust client price.
router.post('/create-checkout-session', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { items, customerEmail, customerName, userId } = req.body;

    let resolved;
    try {
      resolved = resolveCheckoutLines(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid or missing items';
      logAPICall({
        endpoint: '/api/stripe/create-checkout-session',
        method: 'POST',
        statusCode: 400,
        responseTime: Date.now() - startTime,
        error: message,
      });
      return res.status(400).json({ error: message });
    }

    const origin = siteOrigin(req);

    const lineItems = resolved.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || '',
          images: item.image
            ? [
                item.image.startsWith('http')
                  ? item.image
                  : `${origin}${item.image.startsWith('/') ? '' : '/'}${item.image}`,
              ]
            : [],
        },
        unit_amount: item.unitAmountCents,
      },
      quantity: item.quantity,
    }));
    
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: customerEmail,
      client_reference_id: userId?.toString(),
      metadata: {
        user_id: userId?.toString() || '',
        customer_email: customerEmail || '',
        customer_name: customerName || '',
        product_ids: resolved.map((r) => r.productId).join(','),
      },
      allow_promotion_codes: true,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'IE'],
      },
    });
    
    logAPICall({
      endpoint: '/api/stripe/create-checkout-session',
      method: 'POST',
      statusCode: 200,
      responseTime: Date.now() - startTime
    });
    
    res.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logError({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: '/api/stripe/create-checkout-session',
      context: 'Stripe checkout session creation'
    });
    
    logAPICall({
      endpoint: '/api/stripe/create-checkout-session',
      method: 'POST',
      statusCode: 500,
      responseTime: Date.now() - startTime,
      error: errorMessage
    });
    
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// GET /api/stripe/session/:sessionId
// Retrieve checkout session details
router.get('/session/:sessionId', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    logAPICall({
      endpoint: '/api/stripe/session/:sessionId',
      method: 'GET',
      statusCode: 200,
      responseTime: Date.now() - startTime
    });
    
    res.json(session);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logError({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: '/api/stripe/session/:sessionId',
      context: 'Stripe session retrieval'
    });
    
    logAPICall({
      endpoint: '/api/stripe/session/:sessionId',
      method: 'GET',
      statusCode: 500,
      responseTime: Date.now() - startTime,
      error: errorMessage
    });
    
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

export default router;
