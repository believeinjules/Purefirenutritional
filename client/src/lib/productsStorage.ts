import { supabase } from './supabase';

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
  variants?: ProductVariant[];
}

/**
 * Fetch all products from Supabase
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    // Transform database rows to Product interface
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      priceUSD: parseFloat(row.price_usd),
      priceEUR: parseFloat(row.price_eur || 0),
      rating: parseFloat(row.rating),
      sizes: row.sizes,
      image: row.image,
      imageAlt: row.image_alt,
      benefits: row.benefits || [],
      ingredients: row.ingredients || [],
      usage: row.usage,
      variants: row.variants || [],
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      priceUSD: parseFloat(data.price_usd),
      priceEUR: parseFloat(data.price_eur || 0),
      rating: parseFloat(data.rating),
      sizes: data.sizes,
      image: data.image,
      imageAlt: data.image_alt,
      benefits: data.benefits || [],
      ingredients: data.ingredients || [],
      usage: data.usage,
      variants: data.variants || [],
    };
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

/**
 * Fetch products by category
 */
export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('in_stock', true)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      priceUSD: parseFloat(row.price_usd),
      priceEUR: parseFloat(row.price_eur || 0),
      rating: parseFloat(row.rating),
      sizes: row.sizes,
      image: row.image,
      imageAlt: row.image_alt,
      benefits: row.benefits || [],
      ingredients: row.ingredients || [],
      usage: row.usage,
      variants: row.variants || [],
    }));
  } catch (error) {
    console.error('Failed to fetch products by category:', error);
    return [];
  }
}

/**
 * Create a new product (admin only)
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
          variants: product.variants || [],
          in_stock: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      priceUSD: parseFloat(data.price_usd),
      priceEUR: parseFloat(data.price_eur || 0),
      rating: parseFloat(data.rating),
      sizes: data.sizes,
      image: data.image,
      imageAlt: data.image_alt,
      benefits: data.benefits || [],
      ingredients: data.ingredients || [],
      usage: data.usage,
      variants: data.variants || [],
    };
  } catch (error) {
    console.error('Failed to create product:', error);
    return null;
  }
}

/**
 * Update a product (admin only)
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const payload: any = {};
    
    if (updates.name) payload.name = updates.name;
    if (updates.description) payload.description = updates.description;
    if (updates.category) payload.category = updates.category;
    if (updates.priceUSD) payload.price_usd = updates.priceUSD;
    if (updates.priceEUR) payload.price_eur = updates.priceEUR;
    if (updates.rating !== undefined) payload.rating = updates.rating;
    if (updates.image) payload.image = updates.image;
    if (updates.imageAlt) payload.image_alt = updates.imageAlt;
    if (updates.sizes) payload.sizes = updates.sizes;
    if (updates.benefits) payload.benefits = updates.benefits;
    if (updates.ingredients) payload.ingredients = updates.ingredients;
    if (updates.usage) payload.usage = updates.usage;
    if (updates.variants) payload.variants = updates.variants;

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

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      priceUSD: parseFloat(data.price_usd),
      priceEUR: parseFloat(data.price_eur || 0),
      rating: parseFloat(data.rating),
      sizes: data.sizes,
      image: data.image,
      imageAlt: data.image_alt,
      benefits: data.benefits || [],
      ingredients: data.ingredients || [],
      usage: data.usage,
      variants: data.variants || [],
    };
  } catch (error) {
    console.error('Failed to update product:', error);
    return null;
  }
}

/**
 * Delete a product (admin only)
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
