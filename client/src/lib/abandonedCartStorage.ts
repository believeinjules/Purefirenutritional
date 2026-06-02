import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import type { CartItem } from "@/contexts/CartContext";

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

const CURRENT_CART_KEY = "purefire_current_cart_session";

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getSessionId(): string {
  let sessionId = localStorage.getItem(CURRENT_CART_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(CURRENT_CART_KEY, sessionId);
  }
  return sessionId;
}

function docToCart(id: string, data: any): AbandonedCart {
  return {
    id,
    sessionId: data.sessionId,
    customerEmail: data.customerEmail,
    customerName: data.customerName,
    items: data.items ?? [],
    totalAmount: parseFloat(data.totalAmount ?? 0),
    itemCount: data.itemCount ?? 0,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    lastActivityAt: data.lastActivityAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    recoveryEmailSent: data.recoveryEmailSent ?? false,
    recoveryEmailSentAt: data.recoveryEmailSentAt?.toDate?.()?.toISOString(),
    recovered: data.recovered ?? false,
    recoveredAt: data.recoveredAt?.toDate?.()?.toISOString(),
  };
}

export async function saveCart(
  items: CartItem[],
  customerEmail?: string,
  customerName?: string
): Promise<void> {
  if (items.length === 0 || !isFirebaseConfigured()) return;

  const sessionId = getSessionId();
  const totalAmount = items.reduce((sum, item) => {
    const multiplier = item.size === "60" ? 2.5 : 1;
    return sum + item.product.priceUSD * multiplier * item.quantity;
  }, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  try {
    const ref = doc(db, "abandoned_carts", sessionId);
    const existing = await getDoc(ref);

    const cartData = {
      sessionId,
      customerEmail: customerEmail ?? null,
      customerName: customerName ?? null,
      items,
      totalAmount,
      itemCount,
      lastActivityAt: serverTimestamp(),
    };

    if (existing.exists()) {
      await updateDoc(ref, cartData);
    } else {
      await setDoc(ref, {
        ...cartData,
        createdAt: serverTimestamp(),
        recoveryEmailSent: false,
        recovered: false,
      });
    }
  } catch (err) {
    console.error("Error saving cart to Firestore:", err);
  }
}

export async function markCartAsRecovered(sessionId?: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const sid = sessionId || getSessionId();
  try {
    await updateDoc(doc(db, "abandoned_carts", sid), {
      recovered: true,
      recoveredAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error marking cart as recovered:", err);
  }
}

export async function getCartsNeedingRecovery(): Promise<AbandonedCart[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const q = query(
      collection(db, "abandoned_carts"),
      where("recovered", "==", false),
      where("recoveryEmailSent", "==", false)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((d) => docToCart(d.id, d.data()))
      .filter(
        (cart) =>
          cart.customerEmail &&
          new Date(cart.lastActivityAt) < twentyFourHoursAgo
      );
  } catch (err) {
    console.error("Error fetching carts needing recovery:", err);
    return [];
  }
}

export async function markRecoveryEmailSent(cartId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await updateDoc(doc(db, "abandoned_carts", cartId), {
      recoveryEmailSent: true,
      recoveryEmailSentAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error marking recovery email sent:", err);
  }
}

export async function getAbandonedCartStats(): Promise<{
  totalAbandoned: number;
  totalValue: number;
  recoveryEmailsSent: number;
  recovered: number;
  recoveryRate: number;
}> {
  if (!isFirebaseConfigured()) {
    return { totalAbandoned: 0, totalValue: 0, recoveryEmailsSent: 0, recovered: 0, recoveryRate: 0 };
  }

  try {
    const snapshot = await getDocs(collection(db, "abandoned_carts"));
    const carts = snapshot.docs.map((d) => docToCart(d.id, d.data()));

    const totalAbandoned = carts.filter((c) => !c.recovered).length;
    const totalValue = carts
      .filter((c) => !c.recovered)
      .reduce((sum, c) => sum + c.totalAmount, 0);
    const recoveryEmailsSent = carts.filter((c) => c.recoveryEmailSent).length;
    const recovered = carts.filter((c) => c.recovered).length;
    const recoveryRate = carts.length > 0 ? (recovered / carts.length) * 100 : 0;

    return { totalAbandoned, totalValue, recoveryEmailsSent, recovered, recoveryRate };
  } catch (err) {
    console.error("Error getting abandoned cart stats:", err);
    return { totalAbandoned: 0, totalValue: 0, recoveryEmailsSent: 0, recovered: 0, recoveryRate: 0 };
  }
}

export async function restoreCart(sessionId: string): Promise<CartItem[] | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    const snap = await getDoc(doc(db, "abandoned_carts", sessionId));
    if (snap.exists() && !snap.data().recovered) {
      return snap.data().items as CartItem[];
    }
    return null;
  } catch (err) {
    console.error("Error restoring cart:", err);
    return null;
  }
}
