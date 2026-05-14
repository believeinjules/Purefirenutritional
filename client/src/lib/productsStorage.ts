import { supabase, isSupabaseConfigured } from './supabase';
import { products as localProducts } from '@/data/products';

export interface ProductVariant {
  id: string;
  name: string;
  priceUSD: number;
  priceEUR: number;
  image?: string;
  imageAlt?: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: "PEPTIDE BIOREGULATORS" | "ANTI AGING-LONGEVITY" | "NUTRITIONAL SUPPLEMENTS";
  priceUSD: number;
  priceEUR: number;
  rating: number;
  sizes: number;
  image?: string;
  imageAlt?: string;
  benefits?: string[];
  ingredients?: string[];
  usage?: string;
  seriesInfo?: string;
  in_stock?: boolean;
  variants?: ProductVariant[];
}

// ─── Row → Product transform ──────────────────────────────────────────────────

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    priceUSD: parseFloat(row.price_usd) || 0,
    priceEUR: parseFloat(row.price_eur || 0) || 0,
    rating: parseFloat(row.rating) || 0,
    sizes: row.sizes ?? 1,
    image: row.image ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    benefits: row.benefits || [],
    ingredients: row.ingredients || [],
    usage: row.usage || undefined,
    seriesInfo: row.series_info || undefined,
    in_stock: row.in_stock !== false,
    variants: row.variants || [],
  };
}

// ─── fetchProducts ────────────────────────────────────────────────────────────

/**
 * Fetch all products from Supabase, with fallback to local data.
 */
export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, using local product data');
    return localProducts;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching products from Supabase, falling back to local data:', error);
      return localProducts;
    }

    if (!data || data.length === 0) {
      console.log('No products in Supabase, using local product data');
      return localProducts;
    }

    return data.map(rowToProduct);
  } catch (error) {
    console.error('Failed to fetch products from Supabase, falling back to local data:', error);
    return localProducts;
  }
}

// ─── fetchProductById ─────────────────────────────────────────────────────────

/**
 * Fetch a single product by ID from Supabase, with fallback to local data.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return localProducts.find(p => p.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product by ID from Supabase, falling back to local data:', error);
      return localProducts.find(p => p.id === id) || null;
    }

    if (!data) {
      return localProducts.find(p => p.id === id) || null;
    }

    return rowToProduct(data);
  } catch (error) {
    console.error('Failed to fetch product by ID from Supabase, falling back to local data:', error);
    return localProducts.find(p => p.id === id) || null;
  }
}

// ─── fetchProductsByCategory ──────────────────────────────────────────────────

/**
 * Fetch products by category from Supabase, with fallback to local data.
 */
export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, filtering local product data');
    return localProducts.filter(p => p.category === category);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) {
      console.error('Error fetching products by category from Supabase, falling back to local data:', error);
      return localProducts.filter(p => p.category === category);
    }

    if (!data || data.length === 0) {
      console.log('No products in Supabase for category, using local product data');
      return localProducts.filter(p => p.category === category);
    }

    return data.map(rowToProduct);
  } catch (error) {
    console.error('Failed to fetch products by category from Supabase, falling back to local data:', error);
    return localProducts.filter(p => p.category === category);
  }
}

// ─── createProduct ────────────────────────────────────────────────────────────

/**
 * Create a new product (admin only).
 */
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          id: product.name.toLowerCase().replace(/\s+/g, '-'),
          name: product.name,
          description: product.description,
          category: product.category,
          price_usd: product.priceUSD,
          price_eur: product.priceEUR,
          rating: product.rating,
          image: product.image,
          image_alt: product.imageAlt,
          sizes: product.sizes,
          benefits: product.benefits || [],
          ingredients: product.ingredients || [],
          usage: product.usage,
          series_info: product.seriesInfo,
          variants: product.variants || [],
          in_stock: product.in_stock !== false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return null;
    }

    return data ? rowToProduct(data) : null;
  } catch (error) {
    console.error('Failed to create product:', error);
    return null;
  }
}

// ─── updateProduct ────────────────────────────────────────────────────────────

/**
 * Update a product (admin only).
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const payload: any = {};

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.priceUSD !== undefined) payload.price_usd = updates.priceUSD;
    if (updates.priceEUR !== undefined) payload.price_eur = updates.priceEUR;
    if (updates.rating !== undefined) payload.rating = updates.rating;
    if (updates.image !== undefined) payload.image = updates.image;
    if (updates.imageAlt !== undefined) payload.image_alt = updates.imageAlt;
    if (updates.sizes !== undefined) payload.sizes = updates.sizes;
    if (updates.benefits !== undefined) payload.benefits = updates.benefits;
    if (updates.ingredients !== undefined) payload.ingredients = updates.ingredients;
    if (updates.usage !== undefined) payload.usage = updates.usage;
    if (updates.seriesInfo !== undefined) payload.series_info = updates.seriesInfo;
    if (updates.variants !== undefined) payload.variants = updates.variants;
    if (updates.in_stock !== undefined) payload.in_stock = updates.in_stock;

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    return data ? rowToProduct(data) : null;
  } catch (error) {
    console.error('Failed to update product:', error);
    return null;
  }
}

// ─── deleteProduct ────────────────────────────────────────────────────────────

/**
 * Delete a product (admin only).
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete product:', error);
    return false;
  }
}
