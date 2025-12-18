import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Product types matching Supabase schema
export interface SupabaseProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price_usd: number;
  price_eur: number;
  rating: number;
  sizes: number;
  image_url?: string;
  benefits?: string[];
  ingredients?: string[];
  usage?: string;
  created_at?: string;
}

// Fetch all products from Supabase
export async function fetchProducts(): Promise<SupabaseProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
}

// Fetch single product by ID
export async function fetchProductById(id: string): Promise<SupabaseProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  
  return data;
}

// Fetch products by category
export async function fetchProductsByCategory(category: string): Promise<SupabaseProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('name');
  
  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
  
  return data || [];
}

// Search products
export async function searchProducts(query: string): Promise<SupabaseProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name');
  
  if (error) {
    console.error('Error searching products:', error);
    return [];
  }
  
  return data || [];
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Test Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('mailing_list').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}
