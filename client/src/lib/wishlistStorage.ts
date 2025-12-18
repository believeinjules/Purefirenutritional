import { supabase, isSupabaseConfigured } from './supabase';

export interface WishlistItem {
  id: string;
  customerEmail: string;
  productId: string;
  addedAt: string;
  notifyOnSale: boolean;
  notifyOnRestock: boolean;
}

// Get wishlist for a customer
export async function getWishlist(customerEmail: string): Promise<WishlistItem[]> {
  if (!isSupabaseConfigured()) {
    return getLocalWishlist(customerEmail);
  }

  try {
    const { data, error } = await supabase
      .from('customer_wishlist')
      .select('*')
      .eq('customer_email', customerEmail)
      .order('added_at', { ascending: false });

    if (error) throw error;
    
    return data ? data.map(mapWishlistFromDb) : [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return getLocalWishlist(customerEmail);
  }
}

// Add item to wishlist
export async function addToWishlist(
  customerEmail: string,
  productId: string,
  notifyOnSale: boolean = true,
  notifyOnRestock: boolean = true
): Promise<WishlistItem | null> {
  if (!isSupabaseConfigured()) {
    return addToLocalWishlist(customerEmail, productId, notifyOnSale, notifyOnRestock);
  }

  try {
    const { data, error } = await supabase
      .from('customer_wishlist')
      .insert({
        customer_email: customerEmail,
        product_id: productId,
        notify_on_sale: notifyOnSale,
        notify_on_restock: notifyOnRestock
      })
      .select()
      .single();

    if (error) throw error;
    
    return data ? mapWishlistFromDb(data) : null;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return addToLocalWishlist(customerEmail, productId, notifyOnSale, notifyOnRestock);
  }
}

// Remove item from wishlist
export async function removeFromWishlist(customerEmail: string, productId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return removeFromLocalWishlist(customerEmail, productId);
  }

  try {
    const { error } = await supabase
      .from('customer_wishlist')
      .delete()
      .eq('customer_email', customerEmail)
      .eq('product_id', productId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return removeFromLocalWishlist(customerEmail, productId);
  }
}

// Check if item is in wishlist
export async function isInWishlist(customerEmail: string, productId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return isInLocalWishlist(customerEmail, productId);
  }

  try {
    const { data, error } = await supabase
      .from('customer_wishlist')
      .select('id')
      .eq('customer_email', customerEmail)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    
    return !!data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return isInLocalWishlist(customerEmail, productId);
  }
}

// Update notification preferences
export async function updateWishlistNotifications(
  customerEmail: string,
  productId: string,
  notifyOnSale: boolean,
  notifyOnRestock: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return updateLocalWishlistNotifications(customerEmail, productId, notifyOnSale, notifyOnRestock);
  }

  try {
    const { error } = await supabase
      .from('customer_wishlist')
      .update({
        notify_on_sale: notifyOnSale,
        notify_on_restock: notifyOnRestock
      })
      .eq('customer_email', customerEmail)
      .eq('product_id', productId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating wishlist notifications:', error);
    return updateLocalWishlistNotifications(customerEmail, productId, notifyOnSale, notifyOnRestock);
  }
}

// Helper: Map database record to WishlistItem
function mapWishlistFromDb(data: any): WishlistItem {
  return {
    id: data.id,
    customerEmail: data.customer_email,
    productId: data.product_id,
    addedAt: data.added_at,
    notifyOnSale: data.notify_on_sale,
    notifyOnRestock: data.notify_on_restock
  };
}

// ===== LOCAL STORAGE FALLBACK =====

function getLocalWishlist(customerEmail: string): WishlistItem[] {
  const stored = localStorage.getItem(`wishlist_${customerEmail}`);
  return stored ? JSON.parse(stored) : [];
}

function addToLocalWishlist(
  customerEmail: string,
  productId: string,
  notifyOnSale: boolean,
  notifyOnRestock: boolean
): WishlistItem {
  const wishlist = getLocalWishlist(customerEmail);
  
  // Check if already exists
  const existing = wishlist.find(item => item.productId === productId);
  if (existing) return existing;
  
  const newItem: WishlistItem = {
    id: crypto.randomUUID(),
    customerEmail,
    productId,
    addedAt: new Date().toISOString(),
    notifyOnSale,
    notifyOnRestock
  };
  
  wishlist.push(newItem);
  localStorage.setItem(`wishlist_${customerEmail}`, JSON.stringify(wishlist));
  
  return newItem;
}

function removeFromLocalWishlist(customerEmail: string, productId: string): boolean {
  const wishlist = getLocalWishlist(customerEmail);
  const filtered = wishlist.filter(item => item.productId !== productId);
  
  localStorage.setItem(`wishlist_${customerEmail}`, JSON.stringify(filtered));
  
  return true;
}

function isInLocalWishlist(customerEmail: string, productId: string): boolean {
  const wishlist = getLocalWishlist(customerEmail);
  return wishlist.some(item => item.productId === productId);
}

function updateLocalWishlistNotifications(
  customerEmail: string,
  productId: string,
  notifyOnSale: boolean,
  notifyOnRestock: boolean
): boolean {
  const wishlist = getLocalWishlist(customerEmail);
  const item = wishlist.find(i => i.productId === productId);
  
  if (item) {
    item.notifyOnSale = notifyOnSale;
    item.notifyOnRestock = notifyOnRestock;
    localStorage.setItem(`wishlist_${customerEmail}`, JSON.stringify(wishlist));
    return true;
  }
  
  return false;
}
