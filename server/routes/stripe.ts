// Stripe payment processing routes
import { Router } from 'express';
import Stripe from 'stripe';
import { logError, logAPICall } from '../logger.js';
import { CheckoutValidationError, resolveCheckoutLinesWith } from '../../shared/product-prices.js';
import { loadFirestoreProducts } from '../../api/_lib/catalog.js';
import { buildCheckoutSessionParams } from '../../api/_lib/checkout-session.js';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
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
    const { items, customerEmail, customerName, userId, postalCode } = req.body;

    let resolved;
    try {
      // Same source of truth as api/stripe/create-checkout-session (Firestore → code catalog)
      resolved = await resolveCheckoutLinesWith(items, loadFirestoreProducts);
    } catch (err) {
      if (!(err instanceof CheckoutValidationError)) throw err;
      const message = err.message;
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

    const zip = typeof postalCode === 'string' ? postalCode : '';
    // Same builder as the Vercel route: bundle prices + free shipping computed server-side.
    const { params, shippingCents } = buildCheckoutSessionParams({
      resolved,
      origin,
      customerEmail: typeof customerEmail === 'string' && customerEmail.trim() ? customerEmail.trim() : undefined,
      customerName: typeof customerName === 'string' ? customerName.trim() : '',
      userId,
      postalCode: zip,
    });
    const session = await stripe.checkout.sessions.create(params);

    logAPICall({
      endpoint: '/api/stripe/create-checkout-session',
      method: 'POST',
      statusCode: 200,
      responseTime: Date.now() - startTime
    });
    
    res.json({ 
      sessionId: session.id,
      url: session.url,
      shipping: {
        available: true,
        amountUSD: shippingCents / 100,
        amountCents: shippingCents,
        currency: 'usd',
        free: shippingCents === 0,
      },
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
    
    const e = error as { statusCode?: number; code?: string };
    if (e?.statusCode === 404 || e?.code === 'resource_missing') {
      return res.status(404).json({ error: 'Checkout session not found' });
    }
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

export default router;
