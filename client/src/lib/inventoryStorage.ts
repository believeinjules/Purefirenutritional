/**
 * Admin inventory (product_inventory + inventory_history).
 * All reads/writes go through /api/admin/inventory (Firebase Admin SDK) with the
 * signed-in admin's ID token, so Firestore rules never need to allow browser
 * writes. Errors are thrown (no silent localStorage fallback) so the Admin UI
 * can show them.
 */
import { adminFetch } from "./adminApi";

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
  changeType: "restock" | "sale" | "adjustment" | "return";
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  notes?: string;
  adminUser?: string;
  createdAt: string;
}

type RawDoc = { id: string } & Record<string, any>;

function toInventory(d: RawDoc): ProductInventory {
  return {
    id: d.id,
    productId: d.productId ?? d.id,
    stockQuantity: typeof d.stockQuantity === "number" ? d.stockQuantity : 0,
    lowStockThreshold: typeof d.lowStockThreshold === "number" ? d.lowStockThreshold : 10,
    isInStock: d.isInStock !== false,
    isAvailable: d.isAvailable !== false,
    lastRestockedAt: d.lastRestockedAt ?? undefined,
    lastUpdatedAt: d.lastUpdatedAt ?? new Date().toISOString(),
    createdAt: d.createdAt ?? new Date().toISOString(),
  };
}

function toHistory(d: RawDoc): InventoryHistory {
  return {
    id: d.id,
    productId: d.productId,
    changeType: d.changeType,
    quantityChange: d.quantityChange,
    quantityBefore: d.quantityBefore,
    quantityAfter: d.quantityAfter,
    notes: d.notes ?? undefined,
    adminUser: d.adminUser ?? undefined,
    createdAt: d.createdAt ?? new Date().toISOString(),
  };
}

export async function getAllInventory(): Promise<ProductInventory[]> {
  const body = await adminFetch<{ inventory: RawDoc[] }>("/api/admin/inventory");
  return (body.inventory || []).map(toInventory);
}

/** Create default records (100 in stock, alert at 10) for products that have none. */
export async function ensureInventory(productIds: string[]): Promise<ProductInventory[]> {
  if (productIds.length === 0) return getAllInventory();
  const body = await adminFetch<{ inventory: RawDoc[] }>("/api/admin/inventory", {
    method: "POST",
    body: JSON.stringify({ productIds }),
  });
  return (body.inventory || []).map(toInventory);
}

export async function updateInventory(
  productId: string,
  updates: Partial<
    Pick<ProductInventory, "stockQuantity" | "lowStockThreshold" | "isInStock" | "isAvailable">
  > & { notes?: string }
): Promise<ProductInventory> {
  const body = await adminFetch<{ inventory: RawDoc }>(
    `/api/admin/inventory?productId=${encodeURIComponent(productId)}`,
    { method: "PATCH", body: JSON.stringify(updates) }
  );
  return toInventory(body.inventory);
}

export async function getInventoryHistory(productId: string): Promise<InventoryHistory[]> {
  const body = await adminFetch<{ history: RawDoc[] }>(
    `/api/admin/inventory?productId=${encodeURIComponent(productId)}&history=1`
  );
  return (body.history || []).map(toHistory);
}

export function isLowStock(inv: ProductInventory): boolean {
  return inv.isAvailable && inv.stockQuantity <= inv.lowStockThreshold;
}
