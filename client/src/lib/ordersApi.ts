export const EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";
export const EMAIL_NOT_VERIFIED_MESSAGE = "Verify your email to see past orders.";

export type CustomerOrder = {
  id: string;
  order_number: string;
  customer_email: string | null;
  customer_name: string | null;
  items: Array<{ name?: string; size?: string | null; quantity?: number; price?: number }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string | null;
};

export type OrdersResponse =
  | { ok: true; orders: CustomerOrder[] }
  | { ok: false; needsVerification: boolean; error: string };

/** Load the signed-in user's orders from the server (verified ID token). */
export async function fetchMyOrders(idToken: string): Promise<OrdersResponse> {
  if (!idToken) {
    return { ok: false, needsVerification: false, error: "You must be signed in to view orders" };
  }

  const res = await fetch("/api/orders", {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const body = (await res.json().catch(() => ({}))) as {
    orders?: CustomerOrder[];
    error?: string;
    code?: string;
  };

  if (res.status === 403 && body.code === EMAIL_NOT_VERIFIED) {
    return {
      ok: false,
      needsVerification: true,
      error: body.error || EMAIL_NOT_VERIFIED_MESSAGE,
    };
  }
  if (!res.ok) {
    return {
      ok: false,
      needsVerification: false,
      error: body.error || "Failed to load orders",
    };
  }
  return { ok: true, orders: body.orders || [] };
}
