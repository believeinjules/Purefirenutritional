import type { VercelRequest } from "@vercel/node";
import { firstQueryValue } from "./admin-auth.js";

export const DEFAULT_PAGE_SIZE = 100;
export const MAX_PAGE_SIZE = 500;

/** ?limit=<1..500>&after=<created_at cursor from the previous page> */
export function parsePageParams(req: VercelRequest): { limit: number; after: string | null } {
  const rawLimit = Number(firstQueryValue(req.query.limit));
  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  const after = firstQueryValue(req.query.after);
  return { limit, after: after && after.length <= 100 ? after : null };
}

function num(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function strOrNull(v: unknown): string | null {
  return typeof v === "string" && v ? v : null;
}

/**
 * Customers docs are written by the Stripe webhook with camelCase totals
 * (totalOrders / totalSpent); older code used snake_case. Normalize to what the
 * Admin UI renders.
 */
export function normalizeCustomer(doc: { id: string } & Record<string, unknown>) {
  return {
    id: doc.id,
    email: strOrNull(doc.email) ?? doc.id,
    name: strOrNull(doc.name),
    total_orders: num(doc.totalOrders ?? doc.total_orders),
    total_spent: Math.round(num(doc.totalSpent ?? doc.total_spent) * 100) / 100,
    created_at: strOrNull(doc.created_at),
    last_order_at: strOrNull(doc.last_order_at),
  };
}

export function normalizeOrder(doc: { id: string } & Record<string, unknown>) {
  return {
    id: doc.id,
    order_number: strOrNull(doc.order_number) ?? doc.id,
    customer_email: strOrNull(doc.customer_email),
    customer_name: strOrNull(doc.customer_name),
    items: Array.isArray(doc.items) ? doc.items : [],
    subtotal: num(doc.subtotal),
    tax: num(doc.tax),
    shipping: num(doc.shipping),
    total: num(doc.total),
    currency: strOrNull(doc.currency) ?? "USD",
    status: strOrNull(doc.status) ?? "processing",
    payment_status: strOrNull(doc.payment_status) ?? "unknown",
    shipping_name: strOrNull(doc.shipping_name),
    shipping_address: doc.shipping_address ?? null,
    stripe_session_id: strOrNull(doc.stripe_session_id),
    created_at: strOrNull(doc.created_at),
  };
}
