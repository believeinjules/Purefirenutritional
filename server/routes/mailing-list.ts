import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { logError, logAPICall } from '../logger.js';

const router = Router();

// POST /api/mailing-list/subscribe
// Subscribe to mailing list
router.post('/subscribe', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { email, name, source = 'website' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('mailing_list')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existing) {
      if (existing.subscribed) {
        return res.json({ 
          message: 'Already subscribed',
          alreadySubscribed: true 
        });
      } else {
        // Resubscribe
        await supabase
          .from('mailing_list')
          .update({ 
            subscribed: true,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null
          })
          .eq('email', email);
        
        return res.json({ 
          message: 'Successfully resubscribed!',
          success: true 
        });
      }
    }
    
    // New subscription
    const { error } = await supabase
      .from('mailing_list')
      .insert({
        email,
        name,
        source,
        subscribed: true,
        confirmed: false,
      });
    
    if (error) throw error;
    
    logAPICall({
      endpoint: '/api/mailing-list/subscribe',
      method: 'POST',
      statusCode: 200,
      responseTime: Date.now() - startTime
    });
    
    res.json({ 
      message: 'Successfully subscribed!',
      success: true 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logError({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: '/api/mailing-list/subscribe',
      context: 'Mailing list subscription'
    });
    
    logAPICall({
      endpoint: '/api/mailing-list/subscribe',
      method: 'POST',
      statusCode: 500,
      responseTime: Date.now() - startTime,
      error: errorMessage
    });
    
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// POST /api/mailing-list/unsubscribe
// Unsubscribe from mailing list
router.post('/unsubscribe', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const { error } = await supabase
      .from('mailing_list')
      .update({ 
        subscribed: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email);
    
    if (error) throw error;
    
    logAPICall({
      endpoint: '/api/mailing-list/unsubscribe',
      method: 'POST',
      statusCode: 200,
      responseTime: Date.now() - startTime
    });
    
    res.json({ 
      message: 'Successfully unsubscribed',
      success: true 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logError({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: '/api/mailing-list/unsubscribe',
      context: 'Mailing list unsubscribe'
    });
    
    logAPICall({
      endpoint: '/api/mailing-list/unsubscribe',
      method: 'POST',
      statusCode: 500,
      responseTime: Date.now() - startTime,
      error: errorMessage
    });
    
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

export default router;
