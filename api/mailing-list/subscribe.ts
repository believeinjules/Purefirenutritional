import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        confirmed: false
      });

    if (error) throw error;

    res.json({
      message: 'Successfully subscribed!',
      success: true
    });
  } catch (error) {
    console.error('Mailing list subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
}
