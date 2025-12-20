// Product Review Storage Service with Supabase Backend

import { supabase, isSupabaseConfigured } from './supabase';

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  reviewText: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Get reviews for a specific product
export async function getProductReviews(productId: string, includePending = false): Promise<ProductReview[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty reviews');
    return [];
  }

  try {
    let query = supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!includePending) {
      query = query.eq('status', 'approved');
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      productId: row.product_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      rating: row.rating,
      title: row.title || '',
      reviewText: row.review_text,
      verifiedPurchase: row.verified_purchase,
      helpfulCount: row.helpful_count,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error fetching reviews from Supabase:', error);
    return [];
  }
}

// Add a new review
export async function addReview(review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'status'>): Promise<ProductReview> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: review.productId,
      customer_name: review.customerName,
      customer_email: review.customerEmail,
      rating: review.rating,
      title: review.title,
      review_text: review.reviewText,
      verified_purchase: review.verifiedPurchase,
      helpful_count: 0,
      status: 'pending'  // Changed from 'approved' to 'pending' for moderation
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    productId: data.product_id,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    rating: data.rating,
    title: data.title || '',
    reviewText: data.review_text,
    verifiedPurchase: data.verified_purchase,
    helpfulCount: data.helpful_count,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

// Mark review as helpful
export async function markReviewHelpful(reviewId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { data: review, error: fetchError } = await supabase
      .from('product_reviews')
      .select('helpful_count')
      .eq('id', reviewId)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from('product_reviews')
      .update({ helpful_count: (review.helpful_count || 0) + 1 })
      .eq('id', reviewId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('Error marking review helpful:', error);
    return false;
  }
}

// Get average rating for a product
export async function getAverageRating(productId: string): Promise<{ average: number; count: number }> {
  if (!isSupabaseConfigured()) {
    return { average: 0, count: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'approved');

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, row) => acc + row.rating, 0);
    return {
      average: sum / data.length,
      count: data.length
    };
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return { average: 0, count: 0 };
  }
}

// Get rating distribution for a product
export async function getRatingDistribution(productId: string): Promise<Record<number, number>> {
  if (!isSupabaseConfigured()) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'approved');

    if (error) throw error;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    (data || []).forEach(row => {
      distribution[row.rating] = (distribution[row.rating] || 0) + 1;
    });

    return distribution;
  } catch (error) {
    console.error('Error getting rating distribution:', error);
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }
}

// Check if user has already reviewed a product
export async function hasUserReviewed(productId: string, email: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', productId)
      .ilike('customer_email', email)
      .limit(1);

    if (error) throw error;

    return (data || []).length > 0;
  } catch (error) {
    console.error('Error checking if user reviewed:', error);
    return false;
  }
}

// Update review status (for moderation)
export async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('product_reviews')
      .update({ status })
      .eq('id', reviewId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating review status:', error);
    return false;
  }
}

// Delete a review (for moderation)
export async function deleteReview(reviewId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
}

// Get all pending reviews (for moderation dashboard)
export async function getPendingReviews(): Promise<ProductReview[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      productId: row.product_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      rating: row.rating,
      title: row.title || '',
      reviewText: row.review_text,
      verifiedPurchase: row.verified_purchase,
      helpfulCount: row.helpful_count,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return [];
  }
}
