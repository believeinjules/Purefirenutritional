import { describe, it, expect, vi, beforeEach } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type Doc = Record<string, unknown>;
const store = new Map<string, Doc>();

function makeDb() {
  return {
    collection: (name: string) => ({
      where: (field: string, _op: string, value: unknown) => ({
        orderBy: () => ({
          get: async () => {
            const docs = [...store.entries()]
              .filter(([path, data]) => path.startsWith(`${name}/`) && data[field] === value)
              .sort((a, b) => String(b[1].created_at).localeCompare(String(a[1].created_at)))
              .map(([path, data]) => ({
                id: path.slice(name.length + 1),
                data: () => data,
                ref: {
                  update: async (patch: Doc) => {
                    const cur = store.get(path) || {};
                    store.set(path, { ...cur, ...patch });
                  },
                },
              }));
            return { docs };
          },
        }),
      }),
    }),
  };
}

let token: {
  uid: string;
  email: string;
  email_verified: boolean;
} | null = null;

vi.mock("./firebase.js", () => ({
  getAdminDb: () => makeDb(),
  getAdminAuth: () => ({
    verifyIdToken: async (bearer: string) => {
      if (bearer !== "valid-token" || !token) throw new Error("bad token");
      return token;
    },
  }),
}));

const { handleCustomerOrders } = await import("./customer-orders.handler.js");

function req(headers: Record<string, string> = {}): VercelRequest {
  return { method: "GET", headers } as any;
}

function mkRes() {
  const r: any = { statusCode: 200, body: undefined, headers: {} };
  r.status = (c: number) => ((r.statusCode = c), r);
  r.setHeader = (k: string, v: string) => ((r.headers[k] = v), r);
  r.json = (b: any) => ((r.body = b), r);
  return r as VercelResponse & { statusCode: number; body: any };
}

describe("GET /api/orders", () => {
  beforeEach(() => {
    store.clear();
    token = {
      uid: "user-1",
      email: "Friend@Example.com",
      email_verified: true,
    };
    store.set("orders/cs_guest", {
      order_number: "ORD-1",
      customer_email: "friend@example.com",
      customer_name: "Friend",
      items: [{ name: "Glandokort (20 Capsules)", size: "20", quantity: 1, price: 58.99 }],
      subtotal: 58.99,
      tax: 0,
      shipping: 0,
      total: 58.99,
      currency: "USD",
      status: "processing",
      payment_status: "paid",
      created_at: "2026-11-12T21:21:00.000Z",
    });
    store.set("orders/cs_other", {
      order_number: "ORD-OTHER",
      customer_email: "someone-else@example.com",
      total: 10,
      created_at: "2026-11-12T21:00:00.000Z",
    });
  });

  it("returns 401 without a bearer token", async () => {
    const res = mkRes();
    await handleCustomerOrders(req(), res);
    expect(res.statusCode).toBe(401);
    expect(res.body.orders).toBeUndefined();
  });

  it("unverified email: no orders, and does not attach uid", async () => {
    token!.email_verified = false;
    const res = mkRes();
    await handleCustomerOrders(req({ authorization: "Bearer valid-token" }), res);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe("EMAIL_NOT_VERIFIED");
    expect(res.body.error).toBe("Verify your email to see past orders.");
    expect(res.body.orders).toEqual([]);
    expect(store.get("orders/cs_guest")!.firebase_uid).toBeUndefined();
  });

  it("verified email: guest orders for that address appear and uid is attached", async () => {
    const res = mkRes();
    await handleCustomerOrders(req({ authorization: "Bearer valid-token" }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].id).toBe("cs_guest");
    expect(res.body.orders[0].order_number).toBe("ORD-1");
    expect(res.body.orders[0].firebase_uid).toBe("user-1");
    expect(store.get("orders/cs_guest")!.firebase_uid).toBe("user-1");
    expect(store.get("orders/cs_guest")!.firebase_uid_attached_at).toBeTruthy();
  });

  it("attach is idempotent and never returns another user's orders", async () => {
    store.set("orders/cs_guest", {
      ...store.get("orders/cs_guest")!,
      firebase_uid: "user-1",
      firebase_uid_attached_at: "2026-11-12T21:30:00.000Z",
    });
    const res = mkRes();
    await handleCustomerOrders(req({ authorization: "Bearer valid-token" }), res);
    expect(res.body.orders.map((o: any) => o.id)).toEqual(["cs_guest"]);
    expect(res.body.orders.find((o: any) => o.id === "cs_other")).toBeUndefined();
    expect(store.get("orders/cs_guest")!.firebase_uid_attached_at).toBe("2026-11-12T21:30:00.000Z");
    expect(store.get("orders/cs_other")!.firebase_uid).toBeUndefined();
  });

  it("does not use client-supplied email_verified: only the verified ID token matters", async () => {
    token!.email_verified = false;
    const res = mkRes();
    // A forged header must not grant access; the token is what verifyIdToken returns.
    await handleCustomerOrders(
      req({ authorization: "Bearer valid-token", "x-email-verified": "true" }),
      res
    );
    expect(res.statusCode).toBe(403);
    expect(res.body.orders).toEqual([]);
  });
});
