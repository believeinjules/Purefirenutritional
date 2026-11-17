// Lives in api/_lib/ (not api/stripe/): every non-underscore file under api/ becomes a Vercel function.
import { beforeEach, describe, expect, it, vi } from "vitest";

const NOW_S = Math.floor(Date.now() / 1000);
const create = vi.fn(async () => ({ id: "cs_test_1", url: "https://checkout.example/cs_test_1" }));
const promoList = vi.fn();
const promoCreate = vi.fn();
let fakeDb: any = null;

vi.mock("./stripe.js", () => ({
  getStripe: () => ({
    checkout: { sessions: { create } },
    promotionCodes: { list: (p: any) => promoList(p), create: (p: any) => promoCreate(p) },
  }),
  getSiteOrigin: () => "https://example.test",
}));
vi.mock("./catalog.js", () => ({ loadFirestoreProducts: async () => new Map() }));
vi.mock("./firebase.js", () => ({ getAdminDb: () => fakeDb }));

import handler from "../stripe/create-checkout-session";

function call(body: unknown, query: Record<string, string> = {}) {
  const res: any = {
    headers: {} as Record<string, string>,
    status(c: number) {
      this.statusCode = c;
      return this;
    },
    json(b: unknown) {
      this.body = b;
      return this;
    },
    setHeader(k: string, v: string) {
      this.headers[k] = v;
    },
  };
  return handler({ method: "POST", body, query, headers: { "x-forwarded-for": "198.51.100.1" } } as any, res).then(() => res);
}

const activePromo = (over: Record<string, any> = {}) => ({
  id: "promo_live_1",
  code: "FIRE10-K7Q2MX",
  active: true,
  expires_at: NOW_S + 86400,
  max_redemptions: 1,
  times_redeemed: 0,
  promotion: { type: "coupon", coupon: { id: "pf-daily-fire-10", percent_off: 10, amount_off: null, valid: true } },
  ...over,
});

const cart = [{ productId: "cerluten", size: "60", quantity: 1 }];

beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  create.mockClear();
  promoList.mockReset();
  promoCreate.mockReset();
  fakeDb = null;
});

describe("POST /api/stripe/create-checkout-session with a promo code", () => {
  it("no code: Stripe's own code box stays on and no discount is pre-applied", async () => {
    const res = await call({ items: cart });
    expect(res.statusCode).toBe(200);
    const params = (create.mock.calls[0] as any)[0];
    expect(params.allow_promotion_codes).toBe(true);
    expect(params.discounts).toBeUndefined();
    expect(params.metadata.promo_code).toBe("");
    expect(promoList).not.toHaveBeenCalled();
  });

  it("valid code: pre-applies discounts[promotion_code] and turns allow_promotion_codes off", async () => {
    promoList.mockResolvedValue({ data: [activePromo()] });
    const res = await call({ items: cart, promoCode: "fire10-k7q2mx" });
    expect(res.statusCode).toBe(200);
    const params = (create.mock.calls[0] as any)[0];
    expect(params.discounts).toEqual([{ promotion_code: "promo_live_1" }]);
    expect("allow_promotion_codes" in params).toBe(false);
    expect(params.metadata.promo_code).toBe("FIRE10-K7Q2MX");
    expect(params.metadata.promo_percent_off).toBe("10");
    expect(res.body.promo).toEqual({ code: "FIRE10-K7Q2MX", percentOff: 10 });
  });

  it("free shipping uses the subtotal BEFORE the code (Cerluten 60 $178.99 − 25% still ships free)", async () => {
    promoList.mockResolvedValue({
      data: [activePromo({ code: "FIRE25-ABCDEF", promotion: { type: "coupon", coupon: { id: "pf-daily-fire-25", percent_off: 25, valid: true } } })],
    });
    const res = await call({ items: cart, promoCode: "FIRE25-ABCDEF" });
    const params = (create.mock.calls[0] as any)[0];
    expect(params.metadata.merchandise_subtotal).toBe("178.99");
    expect(params.shipping_options[0].shipping_rate_data.fixed_amount.amount).toBe(0);
    expect(res.body.shipping.free).toBe(true);
  });

  it("unknown code: 400 with promoError, no session created", async () => {
    promoList.mockResolvedValue({ data: [] });
    const res = await call({ items: cart, promoCode: "FIRE10-ZZZZZZ" });
    expect(res.statusCode).toBe(400);
    expect(res.body.promoError).toBe("invalid");
    expect(res.body.error).toMatch(/removed/);
    expect(create).not.toHaveBeenCalled();
  });

  it("expired code: 400 expired", async () => {
    promoList.mockImplementation(async (p: any) => ({
      data: p.active ? [] : [activePromo({ active: false, expires_at: NOW_S - 60 })],
    }));
    const res = await call({ items: cart, promoCode: "FIRE10-K7Q2MX" });
    expect(res.statusCode).toBe(400);
    expect(res.body.promoError).toBe("expired");
    expect(create).not.toHaveBeenCalled();
  });

  it("already-used code: 400 used", async () => {
    promoList.mockImplementation(async (p: any) => ({
      data: p.active ? [] : [activePromo({ active: false, times_redeemed: 1 })],
    }));
    const res = await call({ items: cart, promoCode: "FIRE10-K7Q2MX" });
    expect(res.statusCode).toBe(400);
    expect(res.body.promoError).toBe("used");
  });

  it("garbage code: 400 invalid without a Stripe lookup", async () => {
    const res = await call({ items: cart, promoCode: "drop table;" });
    expect(res.statusCode).toBe(400);
    expect(res.body.promoError).toBe("invalid");
    expect(promoList).not.toHaveBeenCalled();
  });

  it("ignores a client-sent discount percent (server only trusts Stripe)", async () => {
    const res = await call({ items: cart, percentOff: 90, discount: 9999 });
    const params = (create.mock.calls[0] as any)[0];
    expect(res.statusCode).toBe(200);
    expect(params.discounts).toBeUndefined();
    expect(params.line_items[0].price_data.unit_amount).toBe(17899);
  });
});

describe("POST ?op=discount-spin", () => {
  it("returns a server-picked code and never creates a checkout session", async () => {
    promoCreate.mockImplementation(async (p: any) => ({ id: "promo_new", code: p.code }));
    const res = await call({ questionId: "body-skin", answerId: "c", percentOff: 25 }, { op: "discount-spin" });
    expect(res.statusCode).toBe(200);
    expect(res.body.code).toMatch(/^FIRE(5|10|15|20|25)-[23456789A-HJKMNP-Z]{6}$/);
    expect([5, 10, 15, 20, 25]).toContain(res.body.percentOff);
    expect(res.body.code.startsWith(`FIRE${res.body.percentOff}-`)).toBe(true);
    expect(res.body.expiresAt).toBeGreaterThan(NOW_S);
    expect(res.body.promotionCodeId).toBeUndefined();
    expect(res.headers["Cache-Control"]).toBe("no-store");
    expect(create).not.toHaveBeenCalled();
    const p = promoCreate.mock.calls[0][0];
    expect(p.max_redemptions).toBe(1);
    expect(p.promotion.coupon).toBe(`pf-daily-fire-${res.body.percentOff}`);
  });

  it("503 when the tier coupons are not set up", async () => {
    promoCreate.mockRejectedValue(Object.assign(new Error("No such coupon"), { code: "resource_missing" }));
    const res = await call({}, { op: "discount-spin" });
    expect(res.statusCode).toBe(503);
  });

  it("503 when Stripe is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const res = await call({}, { op: "discount-spin" });
    expect(res.statusCode).toBe(503);
  });

  it("429 once an IP is over the daily limit", async () => {
    const hits = [Date.now() - 1000, Date.now() - 2000, Date.now() - 3000];
    fakeDb = {
      collection: () => ({ doc: () => ({}) }),
      runTransaction: async (fn: any) => fn({ get: async () => ({ exists: true, get: () => hits }), set: () => {} }),
    };
    const res = await call({}, { op: "discount-spin" });
    expect(res.statusCode).toBe(429);
    expect(promoCreate).not.toHaveBeenCalled();
  });
});
