import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export interface WishlistItem {
  id: string;
  customerEmail: string;
  productId: string;
  addedAt: string;
  notifyOnSale: boolean;
  notifyOnRestock: boolean;
}

function docToWishlist(id: string, data: any): WishlistItem {
  return {
    id,
    customerEmail: data.customerEmail,
    productId: data.productId,
    addedAt: data.addedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    notifyOnSale: data.notifyOnSale ?? true,
    notifyOnRestock: data.notifyOnRestock ?? true,
  };
}

export async function getWishlist(customerEmail: string): Promise<WishlistItem[]> {
  if (!isFirebaseConfigured()) return getLocalWishlist(customerEmail);

  try {
    const q = query(
      collection(db, "customer_wishlist"),
      where("customerEmail", "==", customerEmail),
      orderBy("addedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToWishlist(d.id, d.data()));
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    return getLocalWishlist(customerEmail);
  }
}

export async function addToWishlist(
  customerEmail: string,
  productId: string,
  notifyOnSale = true,
  notifyOnRestock = true
): Promise<WishlistItem | null> {
  if (!isFirebaseConfigured()) {
    return addToLocalWishlist(customerEmail, productId, notifyOnSale, notifyOnRestock);
  }

  try {
    const data = {
      customerEmail,
      productId,
      notifyOnSale,
      notifyOnRestock,
      addedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, "customer_wishlist"), data);
    return docToWishlist(ref.id, { ...data, addedAt: { toDate: () => new Date() } });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    return addToLocalWishlist(customerEmail, productId, notifyOnSale, notifyOnRestock);
  }
}

export async function removeFromWishlist(
  customerEmail: string,
  productId: string
): Promise<boolean> {
  if (!isFirebaseConfigured()) return removeFromLocalWishlist(customerEmail, productId);

  try {
    const q = query(
      collection(db, "customer_wishlist"),
      where("customerEmail", "==", customerEmail),
      where("productId", "==", productId)
    );
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
    return true;
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    return removeFromLocalWishlist(customerEmail, productId);
  }
}

export async function isInWishlist(
  customerEmail: string,
  productId: string
): Promise<boolean> {
  if (!isFirebaseConfigured()) return isInLocalWishlist(customerEmail, productId);

  try {
    const q = query(
      collection(db, "customer_wishlist"),
      where("customerEmail", "==", customerEmail),
      where("productId", "==", productId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (err) {
    console.error("Error checking wishlist:", err);
    return isInLocalWishlist(customerEmail, productId);
  }
}

export async function updateWishlistNotifications(
  customerEmail: string,
  productId: string,
  notifyOnSale: boolean,
  notifyOnRestock: boolean
): Promise<boolean> {
  if (!isFirebaseConfigured()) {
    return updateLocalWishlistNotifications(customerEmail, productId, notifyOnSale, notifyOnRestock);
  }

  try {
    const q = query(
      collection(db, "customer_wishlist"),
      where("customerEmail", "==", customerEmail),
      where("productId", "==", productId)
    );
    const snapshot = await getDocs(q);
    await Promise.all(
      snapshot.docs.map((d) => updateDoc(d.ref, { notifyOnSale, notifyOnRestock }))
    );
    return true;
  } catch (err) {
    console.error("Error updating wishlist notifications:", err);
    return updateLocalWishlistNotifications(customerEmail, productId, notifyOnSale, notifyOnRestock);
  }
}

// ─── localStorage fallback ────────────────────────────────────────────────────

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
  const existing = wishlist.find((i) => i.productId === productId);
  if (existing) return existing;

  const newItem: WishlistItem = {
    id: crypto.randomUUID(),
    customerEmail,
    productId,
    addedAt: new Date().toISOString(),
    notifyOnSale,
    notifyOnRestock,
  };
  wishlist.push(newItem);
  localStorage.setItem(`wishlist_${customerEmail}`, JSON.stringify(wishlist));
  return newItem;
}

function removeFromLocalWishlist(customerEmail: string, productId: string): boolean {
  const wishlist = getLocalWishlist(customerEmail).filter((i) => i.productId !== productId);
  localStorage.setItem(`wishlist_${customerEmail}`, JSON.stringify(wishlist));
  return true;
}

function isInLocalWishlist(customerEmail: string, productId: string): boolean {
  return getLocalWishlist(customerEmail).some((i) => i.productId === productId);
}

function updateLocalWishlistNotifications(
  customerEmail: string,
  productId: string,
  notifyOnSale: boolean,
  notifyOnRestock: boolean
): boolean {
  const wishlist = getLocalWishlist(customerEmail);
  const item = wishlist.find((i) => i.productId === productId);
  if (item) {
    item.notifyOnSale = notifyOnSale;
    item.notifyOnRestock = notifyOnRestock;
    localStorage.setItem(`wishlist_${customerEmail}`, JSON.stringify(wishlist));
    return true;
  }
  return false;
}
