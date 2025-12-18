// Abandoned Cart Storage Service with Supabase Backend

import { supabase, isSupabaseConfigured } from './supabase';
import type { CartItem } from '@/contexts/CartContext';

export interface AbandonedCart {
  id: string;
  sessionId: string;
  customerEmail?: string;
  customerName?: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  lastActivityAt: string;
  recoveryEmailSent: boolean;
  recoveryEmailSentAt?: string;
  recovered: boolean;
  recoveredAt?: string;
}

const CURRENT_CART_KEY = 'purefire_current_cart_session';

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get current session ID or create new one
export function getSessionId(): string {
  let sessionId = localStorage.getItem(CURRENT_CART_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(CURRENT_CART_KEY, sessionId);
  }
  return sessionId;
}

// Save or update current cart
export async function saveCart(items: CartItem[], customerEmail?: string, customerName?: string): Promise<void> {
  if (items.length === 0 || !isSupabaseConfigured()) return;

  const sessionId = getSessionId();
  const totalAmount = items.reduce((sum, item) => sum + (item.product.priceUSD * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  try {
    // Check if cart exists
    const { data: existing } = await supabase
      .from('abandoned_carts')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    const cartData = {
      session_id: sessionId,
      customer_email: customerEmail,
      customer_name: customerName,
      cart_data: items,
      total_amount: totalAmount,
      item_count: itemCount,
      last_activity_at: new Date().toISOString()
    };

    if (existing) {
      // Update existing cart
      await supabase
        .from('abandoned_carts')
        .update(cartData)
        .eq('session_id', sessionId);
    } else {
      // Insert new cart
      await supabase
        .from('abandoned_carts')
        .insert(cartData);
    }
  } catch (error) {
    console.error('Error saving cart to Supabase:', error);
  }
}

// Mark cart as recovered
export async function markCartAsRecovered(sessionId?: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const sid = sessionId || getSessionId();

  try {
    await supabase
      .from('abandoned_carts')
      .update({
        recovered: true,
        recovered_at: new Date().toISOString()
      })
      .eq('session_id', sid);
  } catch (error) {
    console.error('Error marking cart as recovered:', error);
  }
}

// Get carts that need recovery emails (abandoned > 24 hours, no email sent)
export async function getCartsNeedingRecovery(): Promise<AbandonedCart[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('recovered', false)
      .eq('recovery_email_sent', false)
      .lt('last_activity_at', twentyFourHoursAgo)
      .not('customer_email', 'is', null);

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      sessionId: row.session_id,
      customerEmail: row.customer_email,
      customerName: row.customer_name,
      items: row.cart_data,
      totalAmount: parseFloat(row.total_amount),
      itemCount: row.item_count,
      createdAt: row.created_at,
      lastActivityAt: row.last_activity_at,
      recoveryEmailSent: row.recovery_email_sent,
      recoveryEmailSentAt: row.recovery_email_sent_at,
      recovered: row.recovered,
      recoveredAt: row.recovered_at
    }));
  } catch (error) {
    console.error('Error fetching carts needing recovery:', error);
    return [];
  }
}

// Mark recovery email as sent
export async function markRecoveryEmailSent(cartId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    await supabase
      .from('abandoned_carts')
      .update({
        recovery_email_sent: true,
        recovery_email_sent_at: new Date().toISOString()
      })
      .eq('id', cartId);
  } catch (error) {
    console.error('Error marking recovery email sent:', error);
  }
}

// Get abandoned cart statistics
export async function getAbandonedCartStats(): Promise<{
  totalAbandoned: number;
  totalValue: number;
  recoveryEmailsSent: number;
  recovered: number;
  recoveryRate: number;
}> {
  if (!isSupabaseConfigured()) {
    return {
      totalAbandoned: 0,
      totalValue: 0,
      recoveryEmailsSent: 0,
      recovered: 0,
      recoveryRate: 0
    };
  }

  try {
    const { data, error } = await supabase
      .from('abandoned_carts')
      .select('*');

    if (error) throw error;

    const totalAbandoned = data.filter(cart => !cart.recovered).length;
    const totalValue = data
      .filter(cart => !cart.recovered)
      .reduce((sum, cart) => sum + parseFloat(cart.total_amount || 0), 0);
    const recoveryEmailsSent = data.filter(cart => cart.recovery_email_sent).length;
    const recovered = data.filter(cart => cart.recovered).length;
    const recoveryRate = data.length > 0 ? (recovered / data.length) * 100 : 0;

    return {
      totalAbandoned,
      totalValue,
      recoveryEmailsSent,
      recovered,
      recoveryRate
    };
  } catch (error) {
    console.error('Error getting abandoned cart stats:', error);
    return {
      totalAbandoned: 0,
      totalValue: 0,
      recoveryEmailsSent: 0,
      recovered: 0,
      recoveryRate: 0
    };
  }
}

// Restore cart from session
export async function restoreCart(sessionId: string): Promise<CartItem[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('abandoned_carts')
      .select('cart_data, recovered')
      .eq('session_id', sessionId)
      .single();

    if (error) throw error;

    if (data && !data.recovered) {
      return data.cart_data as CartItem[];
    }

    return null;
  } catch (error) {
    console.error('Error restoring cart:', error);
    return null;
  }
}
