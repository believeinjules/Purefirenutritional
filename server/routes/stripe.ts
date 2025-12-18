// Stripe payment processing routes
import { Router } from 'express';
import Stripe from 'stripe';
import { logError, logAPICall } from '../logger.js';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// POST /api/stripe/create-checkout-session
// Create a Stripe Checkout session for payment
router.post('/create-checkout-session', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { items, customerEmail, customerName, userId } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      logAPICall({
        endpoint: '/api/stripe/create-checkout-session',
        method: 'POST',
        statusCode: 400,
        responseTime: Date.now() - startTime,
        error: 'Invalid or missing items'
      });
      return res.status(400).json({ error: 'Invalid or missing items' });
    }
    
    // Convert cart items to Stripe line items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || '',
          images: item.image ? [`${req.headers.origin}${item.image}`] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));
    
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
      customer_email: customerEmail,
      client_reference_id: userId?.toString(),
      metadata: {
        user_id: userId?.toString() || '',
        customer_email: customerEmail || '',
        customer_name: customerName || '',
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
