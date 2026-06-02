import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

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

function docToInventory(id: string, data: any): ProductInventory {
  return {
    id,
    productId: data.productId,
    stockQuantity: data.stockQuantity ?? 0,
    lowStockThreshold: data.lowStockThreshold ?? 10,
    isInStock: data.isInStock ?? true,
    isAvailable: data.isAvailable ?? true,
    lastRestockedAt: data.lastRestockedAt?.toDate?.()?.toISOString(),
    lastUpdatedAt: data.lastUpdatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

function docToHistory(id: string, data: any): InventoryHistory {
  return {
    id,
    productId: data.productId,
    changeType: data.changeType,
    quantityChange: data.quantityChange,
    quantityBefore: data.quantityBefore,
    quantityAfter: data.quantityAfter,
    notes: data.notes,
    adminUser: data.adminUser,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

export async function getProductInventory(productId: string): Promise<ProductInventory | null> {
  if (!isFirebaseConfigured()) return getLocalInventory(productId);

  try {
    const snap = await getDoc(doc(db, "product_inventory", productId));
    return snap.exists() ? docToInventory(snap.id, snap.data()) : null;
  } catch (err) {
    console.error("Error fetching inventory:", err);
    return getLocalInventory(productId);
  }
}

export async function getAllInventory(): Promise<ProductInventory[]> {
  if (!isFirebaseConfigured()) return getAllLocalInventory();

  try {
    const q = query(collection(db, "product_inventory"), orderBy("lastUpdatedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToInventory(d.id, d.data()));
  } catch (err) {
    console.error("Error fetching all inventory:", err);
    return getAllLocalInventory();
  }
}

export async function getLowStockProducts(): Promise<ProductInventory[]> {
  if (!isFirebaseConfigured()) {
    return getAllLocalInventory().filter(
      (inv) => inv.stockQuantity <= inv.lowStockThreshold && inv.isAvailable
    );
  }

  try {
    const q = query(
      collection(db, "product_inventory"),
      where("isAvailable", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => docToInventory(d.id, d.data()))
      .filter((inv) => inv.stockQuantity <= inv.lowStockThreshold);
  } catch (err) {
    console.error("Error fetching low stock products:", err);
    return [];
  }
}

export async function updateInventory(
  productId: string,
  updates: Partial<ProductInventory>
): Promise<ProductInventory | null> {
  if (!isFirebaseConfigured()) return updateLocalInventory(productId, updates);

  try {
    const payload: any = { lastUpdatedAt: serverTimestamp() };
    if (updates.stockQuantity !== undefined) payload.stockQuantity = updates.stockQuantity;
    if (updates.lowStockThreshold !== undefined) payload.lowStockThreshold = updates.lowStockThreshold;
    if (updates.isInStock !== undefined) payload.isInStock = updates.isInStock;
    if (updates.isAvailable !== undefined) payload.isAvailable = updates.isAvailable;
    if (updates.lastRestockedAt !== undefined) payload.lastRestockedAt = updates.lastRestockedAt;

    const ref = doc(db, "product_inventory", productId);
    await updateDoc(ref, payload);
    const snap = await getDoc(ref);
    return snap.exists() ? docToInventory(snap.id, snap.data()) : null;
  } catch (err) {
    console.error("Error updating inventory:", err);
    return updateLocalInventory(productId, updates);
  }
}

export async function createInventory(
  inventory: Omit<ProductInventory, "id" | "createdAt" | "lastUpdatedAt">
): Promise<ProductInventory | null> {
  if (!isFirebaseConfigured()) return createLocalInventory(inventory);

  try {
    const data = {
      productId: inventory.productId,
      stockQuantity: inventory.stockQuantity,
      lowStockThreshold: inventory.lowStockThreshold,
      isInStock: inventory.isInStock,
      isAvailable: inventory.isAvailable,
      lastRestockedAt: inventory.lastRestockedAt ?? null,
      createdAt: serverTimestamp(),
      lastUpdatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "product_inventory", inventory.productId), data);
    return docToInventory(inventory.productId, { ...data, createdAt: { toDate: () => new Date() }, lastUpdatedAt: { toDate: () => new Date() } });
  } catch (err) {
    console.error("Error creating inventory:", err);
    return createLocalInventory(inventory);
  }
}

export async function getInventoryHistory(productId: string): Promise<InventoryHistory[]> {
  if (!isFirebaseConfigured()) return getLocalInventoryHistory(productId);

  try {
    const q = query(
      collection(db, "inventory_history"),
      where("productId", "==", productId),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToHistory(d.id, d.data()));
  } catch (err) {
    console.error("Error fetching inventory history:", err);
    return getLocalInventoryHistory(productId);
  }
}

// ─── localStorage fallback ────────────────────────────────────────────────────

function getLocalInventory(productId: string): ProductInventory | null {
  const stored = localStorage.getItem(`inventory_${productId}`);
  return stored ? JSON.parse(stored) : null;
}

function getAllLocalInventory(): ProductInventory[] {
  const inventory: ProductInventory[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("inventory_")) {
      const data = localStorage.getItem(key);
      if (data) inventory.push(JSON.parse(data));
    }
  }
  return inventory;
}

function updateLocalInventory(
  productId: string,
  updates: Partial<ProductInventory>
): ProductInventory {
  const existing = getLocalInventory(productId) || {
    id: productId,
    productId,
    stockQuantity: 100,
    lowStockThreshold: 10,
    isInStock: true,
    isAvailable: true,
    lastUpdatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  const updated = { ...existing, ...updates, lastUpdatedAt: new Date().toISOString() };
  localStorage.setItem(`inventory_${productId}`, JSON.stringify(updated));
  return updated;
}

function createLocalInventory(
  inventory: Omit<ProductInventory, "id" | "createdAt" | "lastUpdatedAt">
): ProductInventory {
  const newInventory: ProductInventory = {
    ...inventory,
    id: inventory.productId,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
  localStorage.setItem(`inventory_${inventory.productId}`, JSON.stringify(newInventory));
  return newInventory;
}

function getLocalInventoryHistory(productId: string): InventoryHistory[] {
  const stored = localStorage.getItem(`inventory_history_${productId}`);
  return stored ? JSON.parse(stored) : [];
}
