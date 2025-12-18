import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Test Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('mailing_list').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection test error:', err);
    return false;
  }
}
