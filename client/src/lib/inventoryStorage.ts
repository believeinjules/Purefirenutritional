import { supabase, isSupabaseConfigured } from './supabase';

export interface ProductInventory {
  id: string;
  productId: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isInStock: boolean;
  isAvailable: boolean;
  lastRestockedAt?: string;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface InventoryHistory {
  id: string;
  productId: string;
  changeType: 'restock' | 'sale' | 'adjustment' | 'return';
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  notes?: string;
  adminUser?: string;
  createdAt: string;
}

// Get inventory for a specific product
export async function getProductInventory(productId: string): Promise<ProductInventory | null> {
  if (!isSupabaseConfigured()) {
    return getLocalInventory(productId);
  }

  try {
    const { data, error } = await supabase
      .from('product_inventory')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error) throw error;
    
    return data ? mapInventoryFromDb(data) : null;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return getLocalInventory(productId);
  }
}

// Get all inventory records
export async function getAllInventory(): Promise<ProductInventory[]> {
  if (!isSupabaseConfigured()) {
    return getAllLocalInventory();
  }

  try {
    const { data, error } = await supabase
      .from('product_inventory')
      .select('*')
      .order('last_updated_at', { ascending: false });

    if (error) throw error;
    
    return data ? data.map(mapInventoryFromDb) : [];
  } catch (error) {
    console.error('Error fetching all inventory:', error);
    return getAllLocalInventory();
  }
}

// Get low stock products
export async function getLowStockProducts(): Promise<ProductInventory[]> {
  if (!isSupabaseConfigured()) {
    return getAllLocalInventory().filter(inv => 
      inv.stockQuantity <= inv.lowStockThreshold && inv.isAvailable
    );
  }

  try {
    const { data, error } = await supabase
      .from('product_inventory')
      .select('*')
      .filter('is_available', 'eq', true)
      .filter('stock_quantity', 'lte', 'low_stock_threshold');

    if (error) throw error;
    
    return data ? data.map(mapInventoryFromDb) : [];
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
}

// Update inventory
export async function updateInventory(
  productId: string,
  updates: Partial<ProductInventory>
): Promise<ProductInventory | null> {
  if (!isSupabaseConfigured()) {
    return updateLocalInventory(productId, updates);
  }

  try {
    const dbUpdates: any = {};
    if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = updates.stockQuantity;
    if (updates.lowStockThreshold !== undefined) dbUpdates.low_stock_threshold = updates.lowStockThreshold;
    if (updates.isInStock !== undefined) dbUpdates.is_in_stock = updates.isInStock;
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
    if (updates.lastRestockedAt !== undefined) dbUpdates.last_restocked_at = updates.lastRestockedAt;

    const { data, error } = await supabase
      .from('product_inventory')
      .update(dbUpdates)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) throw error;
    
    return data ? mapInventoryFromDb(data) : null;
  } catch (error) {
    console.error('Error updating inventory:', error);
    return updateLocalInventory(productId, updates);
  }
}

// Create inventory record
export async function createInventory(inventory: Omit<ProductInventory, 'id' | 'createdAt' | 'lastUpdatedAt'>): Promise<ProductInventory | null> {
  if (!isSupabaseConfigured()) {
    return createLocalInventory(inventory);
  }

  try {
    const { data, error } = await supabase
      .from('product_inventory')
      .insert({
        product_id: inventory.productId,
        stock_quantity: inventory.stockQuantity,
        low_stock_threshold: inventory.lowStockThreshold,
        is_in_stock: inventory.isInStock,
        is_available: inventory.isAvailable,
        last_restocked_at: inventory.lastRestockedAt
      })
      .select()
      .single();

    if (error) throw error;
    
    return data ? mapInventoryFromDb(data) : null;
  } catch (error) {
    console.error('Error creating inventory:', error);
    return createLocalInventory(inventory);
  }
}

// Get inventory history
export async function getInventoryHistory(productId: string): Promise<InventoryHistory[]> {
  if (!isSupabaseConfigured()) {
    return getLocalInventoryHistory(productId);
  }

  try {
    const { data, error } = await supabase
      .from('inventory_history')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    return data ? data.map(mapHistoryFromDb) : [];
  } catch (error) {
    console.error('Error fetching inventory history:', error);
    return getLocalInventoryHistory(productId);
  }
}

// Helper: Map database record to ProductInventory
function mapInventoryFromDb(data: any): ProductInventory {
  return {
    id: data.id,
    productId: data.product_id,
    stockQuantity: data.stock_quantity,
    lowStockThreshold: data.low_stock_threshold,
    isInStock: data.is_in_stock,
    isAvailable: data.is_available,
    lastRestockedAt: data.last_restocked_at,
    lastUpdatedAt: data.last_updated_at,
    createdAt: data.created_at
  };
}

// Helper: Map database record to InventoryHistory
function mapHistoryFromDb(data: any): InventoryHistory {
  return {
    id: data.id,
    productId: data.product_id,
    changeType: data.change_type,
    quantityChange: data.quantity_change,
    quantityBefore: data.quantity_before,
    quantityAfter: data.quantity_after,
    notes: data.notes,
    adminUser: data.admin_user,
    createdAt: data.created_at
  };
}

// ===== LOCAL STORAGE FALLBACK =====

function getLocalInventory(productId: string): ProductInventory | null {
  const stored = localStorage.getItem(`inventory_${productId}`);
  return stored ? JSON.parse(stored) : null;
}

function getAllLocalInventory(): ProductInventory[] {
  const inventory: ProductInventory[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('inventory_')) {
      const data = localStorage.getItem(key);
      if (data) inventory.push(JSON.parse(data));
    }
  }
  return inventory;
}

function updateLocalInventory(productId: string, updates: Partial<ProductInventory>): ProductInventory {
  const existing = getLocalInventory(productId) || {
    id: crypto.randomUUID(),
    productId,
    stockQuantity: 100,
    lowStockThreshold: 10,
    isInStock: true,
    isAvailable: true,
    lastUpdatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  const updated = { ...existing, ...updates, lastUpdatedAt: new Date().toISOString() };
  localStorage.setItem(`inventory_${productId}`, JSON.stringify(updated));
  return updated;
}

function createLocalInventory(inventory: Omit<ProductInventory, 'id' | 'createdAt' | 'lastUpdatedAt'>): ProductInventory {
  const newInventory: ProductInventory = {
    ...inventory,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
  };
  localStorage.setItem(`inventory_${inventory.productId}`, JSON.stringify(newInventory));
  return newInventory;
}

function getLocalInventoryHistory(productId: string): InventoryHistory[] {
  const stored = localStorage.getItem(`inventory_history_${productId}`);
  return stored ? JSON.parse(stored) : [];
}
