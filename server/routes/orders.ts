// Order management API routes
import { Router } from 'express';
import { sendOrderConfirmation, sendShippingNotification } from '../email.js';
import { logError, logAPICall } from '../logger.js';

const router = Router();

// POST /api/orders/confirm
// Send order confirmation email
router.post('/confirm', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { orderId, customerName, customerEmail, items, total, orderDate } = req.body;
    
    // Validate required fields
    if (!orderId || !customerName || !customerEmail || !items || !total) {
      logAPICall({
        endpoint: '/api/orders/confirm',
        method: 'POST',
        statusCode: 400,
        responseTime: Date.now() - startTime,
        error: 'Missing required fields'
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Send confirmation email
    const emailSent = await sendOrderConfirmation({
      orderId,
      customerName,
      customerEmail,
      items,
      total,
      orderDate: orderDate || new Date().toISOString()
    });
    
    logAPICall({
      endpoint: '/api/orders/confirm',
      method: 'POST',
      statusCode: emailSent ? 200 : 500,
      responseTime: Date.now() - startTime
    });
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Order confirmation email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send confirmation email',
        note: 'Email service may not be configured'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logError({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: '/api/orders/confirm',
      context: 'Order confirmation'
    });
    
    logAPICall({
      endpoint: '/api/orders/confirm',
      method: 'POST',
      statusCode: 500,
      responseTime: Date.now() - startTime,
      error: errorMessage
    });
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/orders/shipping
// Send shipping notification email
router.post('/shipping', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { orderId, customerName, customerEmail, trackingNumber, carrier } = req.body;
    
    if (!orderId || !customerName || !customerEmail || !trackingNumber || !carrier) {
      logAPICall({
        endpoint: '/api/orders/shipping',
        method: 'POST',
        statusCode: 400,
        responseTime: Date.now() - startTime,
        error: 'Missing required fields'
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const emailSent = await sendShippingNotification({
      orderId,
      customerName,
      customerEmail,
      trackingNumber,
      carrier
    });
    
    logAPICall({
      endpoint: '/api/orders/shipping',
      method: 'POST',
      statusCode: emailSent ? 200 : 500,
      responseTime: Date.now() - startTime
    });
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Shipping notification sent successfully' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send shipping notification',
        note: 'Email service may not be configured'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logError({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: '/api/orders/shipping',
      context: 'Shipping notification'
    });
    
    logAPICall({
      endpoint: '/api/orders/shipping',
      method: 'POST',
      statusCode: 500,
      responseTime: Date.now() - startTime,
      error: errorMessage
    });
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
