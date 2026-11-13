import type { Firestore } from "firebase-admin/firestore";
import { normalizeEmail } from "../../shared/email-address.js";

export const EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";
export const EMAIL_NOT_VERIFIED_MESSAGE = "Verify your email to see past orders.";

export type CustomerOrder = {
  id: string;
  order_number: string;
  customer_email: string | null;
  customer_name: string | null;
  items: unknown[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: string;
  payment_status: string;
  shipping_name: string | null;
  shipping_address: unknown;
  created_at: string | null;
  firebase_uid: string | null;
};

function num(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function strOrNull(v: unknown): string | null {
  return typeof v === "string" && v ? v : null;
}

export function serializeCustomerOrder(
  id: string,
  data: Record<string, unknown>
): CustomerOrder {
  return {
    id,
    order_number: strOrNull(data.order_number) ?? id,
    customer_email: strOrNull(data.customer_email),
    customer_name: strOrNull(data.customer_name),
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: num(data.subtotal),
    tax: num(data.tax),
    shipping: num(data.shipping),
    total: num(data.total),
    currency: strOrNull(data.currency) ?? "USD",
    status: strOrNull(data.status) ?? "processing",
    payment_status: strOrNull(data.payment_status) ?? "unknown",
    shipping_name: strOrNull(data.shipping_name),
    shipping_address: data.shipping_address ?? null,
    created_at: strOrNull(data.created_at),
    firebase_uid: strOrNull(data.firebase_uid),
  };
}

/**
 * List orders for a verified account and attach firebase_uid when missing.
 * Only orders whose stored customer_email matches the verified, normalized
 * email are returned or updated. Idempotent: a matching uid is left alone.
 */
export async function listAndAttachOrdersForVerifiedUser(
  db: Firestore,
  input: { uid: string; email: string }
): Promise<CustomerOrder[]> {
  const email = normalizeEmail(input.email);
  const uid = input.uid;
  if (!email || !uid) return [];

  const snap = await db
    .collection("orders")
    .where("customer_email", "==", email)
    .orderBy("created_at", "desc")
    .get();

  const now = new Date().toISOString();
  const orders: CustomerOrder[] = [];
  const attaches: Promise<unknown>[] = [];

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    if (normalizeEmail(String(data.customer_email ?? "")) !== email) continue;

    const existingUid = strOrNull(data.firebase_uid);
    if (existingUid !== uid) {
      attaches.push(
        doc.ref.update({
          firebase_uid: uid,
          firebase_uid_attached_at: now,
        })
      );
    }
    orders.push(
      serializeCustomerOrder(doc.id, {
        ...data,
        firebase_uid: uid,
      })
    );
  }

  await Promise.all(attaches);
  return orders;
}
