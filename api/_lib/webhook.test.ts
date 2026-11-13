import { describe, it, expect, vi, beforeEach } from "vitest";

// ── In-memory Firestore fake (just enough for the webhook) ──────────────────
const store = new Map<string, Record<string, any>>();
function docRef(path: string) {
  return {
    path,
    update: async (data: Record<string, any>) => {
      const existing = store.get(path) || {};
      store.set(path, applyIncrements(existing, data));
    },
  };
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
const sendOwnerOrderNotification = vi.fn(async (_o: any) => true);
vi.mock("./email.js", () => ({
  sendOrderConfirmation: (...a: any[]) => sendOrderConfirmation(...a),
  sendOwnerOrderNotification: (o: any) => sendOwnerOrderNotification(o),
}));

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
    sendOwnerOrderNotification.mockReset();
    sendOwnerOrderNotification.mockImplementation(async () => true);
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

  it("notifies the owner once with the same amounts/fields saved on the order", async () => {
    currentEvent = sessionEvent({
      amount_total: 17000,
      amount_subtotal: 15598,
      total_details: { amount_tax: 902, amount_shipping: 500 },
    });
    await handler(req(), mkRes());
    await handler(req(), mkRes()); // Stripe retry
    expect(sendOwnerOrderNotification).toHaveBeenCalledTimes(1);
    const order = store.get("orders/cs_live_abc")!;
    const arg = sendOwnerOrderNotification.mock.calls[0][0];
    expect(arg).toMatchObject({
      orderNumber: order.order_number,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      shippingName: order.shipping_name,
      shippingAddress: order.shipping_address,
    });
    expect(arg.shipping).toBe(5);
    expect(arg.tax).toBeCloseTo(9.02);
  });

  it("owner notification failure doesn't affect order save, customer email, or 200", async () => {
    sendOwnerOrderNotification.mockImplementation(async () => {
      throw new Error("SMTP down");
    });
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    currentEvent = sessionEvent();
    const res = mkRes();
    await handler(req(), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(store.get("orders/cs_live_abc")).toBeTruthy();
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
    expect(err.mock.calls.some((c) => String(c[0]).includes("owner notification failed"))).toBe(true);
    err.mockRestore();
  });

  it("owner notification failure (returns false) still returns 200", async () => {
    sendOwnerOrderNotification.mockImplementation(async () => false);
    currentEvent = sessionEvent();
    const res = mkRes();
    await handler(req(), res);
    expect(res.statusCode).toBe(200);
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
  });

  it("saves firebase_uid from metadata.user_id", async () => {
    currentEvent = sessionEvent({ metadata: { user_id: "firebase-uid-1" }, client_reference_id: "firebase-uid-1" });
    await handler(req(), mkRes());
    expect(store.get("orders/cs_live_abc")!.firebase_uid).toBe("firebase-uid-1");
  });

  it("marks emails sent and does not resend on retry after success", async () => {
    currentEvent = sessionEvent();
    await handler(req(), mkRes());
    const first = store.get("orders/cs_live_abc")!;
    expect(first.confirmation_email_sent_at).toBeTruthy();
    expect(first.owner_email_sent_at).toBeTruthy();
    await handler(req(), mkRes());
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
    expect(sendOwnerOrderNotification).toHaveBeenCalledTimes(1);
    expect(store.get("orders/cs_live_abc")!.confirmation_email_sent_at).toBe(first.confirmation_email_sent_at);
  });

  it("retries a failed confirmation email on the next webhook delivery, then stops", async () => {
    sendOrderConfirmation.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    currentEvent = sessionEvent();
    await handler(req(), mkRes());
    expect(store.get("orders/cs_live_abc")!.confirmation_email_sent_at).toBeFalsy();
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
    await handler(req(), mkRes());
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(2);
    expect(store.get("orders/cs_live_abc")!.confirmation_email_sent_at).toBeTruthy();
    await handler(req(), mkRes());
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(2);
  });

  it("passes sizes, totals, and shipping address to the customer email", async () => {
    currentEvent = sessionEvent({
      amount_total: 17000,
      amount_subtotal: 15598,
      total_details: { amount_tax: 902, amount_shipping: 500 },
    });
    await handler(req(), mkRes());
    expect(sendOrderConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: "buyer@example.com",
        subtotal: 155.98,
        shipping: 5,
        tax: 9.02,
        total: 170,
        shippingName: "Jane Buyer",
        shippingAddress: expect.objectContaining({ line1: "1 Main St" }),
      })
    );
  });
});

describe("stripe webhook: discounts (Daily Fire / typed codes)", () => {
  beforeEach(() => {
    store.clear();
    currentLineItems = defaultLineItems;
    sendOrderConfirmation.mockClear();
    sendOwnerOrderNotification.mockReset();
    sendOwnerOrderNotification.mockImplementation(async () => true);
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
  });

  it("records the pre-applied code, percent and amount, and emails the discounted total", async () => {
    currentEvent = sessionEvent({
      metadata: { promo_code: "FIRE10-K7Q2MX", promo_percent_off: "10" },
      amount_subtotal: 15598,
      amount_total: 14038,
      total_details: { amount_tax: 0, amount_shipping: 0, amount_discount: 1560 },
      discounts: [{ coupon: "pf-daily-fire-10", promotion_code: "promo_1" }],
    });
    await handler(req(), mkRes());
    const order = store.get("orders/cs_live_abc")!;
    expect(order.subtotal).toBeCloseTo(155.98);
    expect(order.discount).toBeCloseTo(15.6);
    expect(order.discount_code).toBe("FIRE10-K7Q2MX");
    expect(order.discount_percent).toBe(10);
    expect(order.total).toBeCloseTo(140.38);
    expect(sendOrderConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ total: 140.38, discount: 15.6, discountCode: "FIRE10-K7Q2MX" })
    );
    expect(sendOwnerOrderNotification).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 155.98, discount: 15.6, discountCode: "FIRE10-K7Q2MX", total: 140.38 })
    );
  });

  it("no discount: fields are zero/null and emails get no discount line", async () => {
    currentEvent = sessionEvent();
    await handler(req(), mkRes());
    const order = store.get("orders/cs_live_abc")!;
    expect(order.discount).toBe(0);
    expect(order.discount_code).toBeNull();
    expect(order.discount_percent).toBeNull();
    expect((sendOrderConfirmation.mock.calls[0] as any)[0].discount).toBeUndefined();
  });
});

describe("sessionDiscount", () => {
  it("resolves a code typed on Stripe's page from session.discounts", async () => {
    const { sessionDiscount } = await import("../stripe/webhook");
    const r = await sessionDiscount(
      {
        metadata: {},
        total_details: { amount_discount: 500 },
        discounts: [{ coupon: { percent_off: 5 }, promotion_code: "promo_x" }],
      } as any,
      async (id) => ({ code: id === "promo_x" ? "FIRE5-ABCDEF" : null })
    );
    expect(r).toEqual({ amount: 5, code: "FIRE5-ABCDEF", percentOff: 5 });
  });

  it("survives a failed promotion-code lookup", async () => {
    const { sessionDiscount } = await import("../stripe/webhook");
    const r = await sessionDiscount(
      { metadata: {}, total_details: { amount_discount: 500 }, discounts: [{ coupon: "c", promotion_code: "promo_x" }] } as any,
      async () => {
        throw new Error("boom");
      }
    );
    expect(r).toEqual({ amount: 5, code: null, percentOff: null });
  });
});
