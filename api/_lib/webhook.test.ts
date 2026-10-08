import { describe, it, expect, vi, beforeEach } from "vitest";

// ── In-memory Firestore fake (just enough for the webhook) ──────────────────
const store = new Map<string, Record<string, any>>();
function docRef(path: string) {
  return { path };
}
function snap(path: string) {
  const data = store.get(path);
  return {
    exists: !!data,
    data: () => data,
    get: (k: string) => data?.[k],
  };
}
function applyIncrements(existing: Record<string, any>, patch: Record<string, any>) {
  const out = { ...existing };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = v && typeof v === "object" && "__inc" in v ? (out[k] || 0) + v.__inc : v;
  }
  return out;
}
const fakeDb = {
  collection: (c: string) => ({ doc: (id: string) => docRef(`${c}/${id}`) }),
  runTransaction: async (fn: (tx: any) => Promise<void>) => {
    const writes: Array<() => void> = [];
    const tx = {
      get: async (ref: { path: string }) => snap(ref.path),
      set: (ref: { path: string }, data: any) => writes.push(() => store.set(ref.path, data)),
      update: (ref: { path: string }, data: any) =>
        writes.push(() => store.set(ref.path, applyIncrements(store.get(ref.path)!, data))),
    };
    await fn(tx);
    writes.forEach((w) => w());
  },
};

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { increment: (n: number) => ({ __inc: n }) },
}));
vi.mock("./firebase.js", () => ({ getAdminDb: () => fakeDb }));

const sendOrderConfirmation = vi.fn(async () => true);
vi.mock("./email.js", () => ({ sendOrderConfirmation: (...a: any[]) => sendOrderConfirmation(...a) }));

let currentEvent: any;
const defaultLineItems = [{ description: "Bonomarlot (20 Capsules)", quantity: 2, amount_total: 15598 }];
let currentLineItems: any[] = defaultLineItems;
let lastListParams: any;
vi.mock("./stripe.js", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: () => currentEvent },
    checkout: {
      sessions: {
        listLineItems: async (_id: string, params: any) => {
          lastListParams = params;
          return { data: currentLineItems };
        },
      },
    },
  }),
}));
vi.mock("./read-raw-body.js", () => ({ readRawBody: async () => Buffer.from("{}") }));

import handler from "../stripe/webhook";

function mkRes() {
  const r: any = { statusCode: 200, body: undefined };
  r.status = (c: number) => ((r.statusCode = c), r);
  r.setHeader = () => r;
  r.json = (b: any) => ((r.body = b), r);
  r.send = (b: any) => ((r.body = b), r);
  return r;
}
const req = () =>
  ({ method: "POST", headers: { "stripe-signature": "t=1,v1=x" } }) as any;

function sessionEvent(overrides: Record<string, any> = {}) {
  return {
    id: "evt_123",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_live_abc",
        customer_email: null,
        customer_details: { email: "Buyer@Example.com", name: null, address: null },
        collected_information: {
          shipping_details: {
            name: "Jane Buyer",
            address: { line1: "1 Main St", city: "NYC", postal_code: "10001", country: "US" },
          },
        },
        metadata: {},
        amount_total: 15598,
        amount_subtotal: 15598,
        total_details: { amount_tax: 0, amount_shipping: 0 },
        currency: "usd",
        payment_status: "paid",
        payment_intent: "pi_1",
        customer: null,
        ...overrides,
      },
    },
  };
}

describe("stripe webhook checkout.session.completed", () => {
  beforeEach(() => {
    store.clear();
    currentLineItems = defaultLineItems;
    sendOrderConfirmation.mockClear();
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
  });

  it("saves order + customer, captures shipping address, emails with name fallback", async () => {
    currentEvent = sessionEvent();
    const res = mkRes();
    await handler(req(), res);
    expect(res.statusCode).toBe(200);

    const order = store.get("orders/cs_live_abc")!;
    expect(order.customer_email).toBe("buyer@example.com");
    expect(order.total).toBeCloseTo(155.98);
    expect(order.shipping_address.line1).toBe("1 Main St");
    expect(order.customer_name).toBe("Jane Buyer");

    const customer = store.get("customers/buyer@example.com")!;
    expect(customer.totalOrders).toBe(1);
    expect(customer.totalSpent).toBeCloseTo(155.98);

    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
  });

  it("is idempotent on Stripe retries (no duplicate order, totals, or email)", async () => {
    currentEvent = sessionEvent();
    await handler(req(), mkRes());
    await handler(req(), mkRes());

    const customer = store.get("customers/buyer@example.com")!;
    expect(customer.totalOrders).toBe(1);
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
    expect([...store.keys()].filter((k) => k.startsWith("orders/"))).toHaveLength(1);
  });

  it("sends the email with 'Customer' when no name is known", async () => {
    currentEvent = sessionEvent({ collected_information: null });
    await handler(req(), mkRes());
    expect(sendOrderConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ customerName: "Customer", customerEmail: "buyer@example.com" })
    );
  });

  it("increments an existing customer", async () => {
    store.set("customers/buyer@example.com", {
      email: "buyer@example.com",
      name: "Jane",
      totalOrders: 2,
      totalSpent: 100,
    });
    currentEvent = sessionEvent();
    await handler(req(), mkRes());
    const customer = store.get("customers/buyer@example.com")!;
    expect(customer.totalOrders).toBe(3);
    expect(customer.totalSpent).toBeCloseTo(255.98);
  });

  it("records bundle details on the order (from line-item product metadata)", async () => {
    currentLineItems = [
      {
        description: "Vladonix (20 Capsules) — 3-bottle bundle",
        quantity: 1,
        amount_total: 15297,
        price: {
          product: {
            object: "product",
            metadata: {
              product_id: "vladonix",
              size: "20",
              bundle_bottles: "3",
              single_bottle_cents: "5899",
              discount_per_bottle_cents: "800",
            },
          },
        },
      },
      { description: "Bonomarlot (20 Capsules)", quantity: 1, amount_total: 7799 },
    ];
    currentEvent = sessionEvent({ metadata: { bundles: "vladonix:20:3x1" } });
    await handler(req(), mkRes());
    expect(lastListParams.expand).toEqual(["data.price.product"]);
    const order = store.get("orders/cs_live_abc")!;
    expect(order.bundles).toBe("vladonix:20:3x1");
    expect(order.items[0]).toMatchObject({
      name: "Vladonix (20 Capsules) — 3-bottle bundle",
      product_id: "vladonix",
      size: "20",
      bundle_bottles: 3,
      bottles_total: 3,
      bundle_discount_per_bottle: 8,
      single_bottle_price: 58.99,
      price: 152.97,
    });
    // older / non-bundle lines keep working with null bundle fields
    expect(order.items[1]).toMatchObject({ bundle_bottles: null, bottles_total: 1, product_id: null });
  });
});
