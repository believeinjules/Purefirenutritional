// Lives in api/_lib/ (not api/stripe/): every non-underscore file under api/ becomes a Vercel function.
import { beforeEach, describe, expect, it, vi } from "vitest";

const NOW_S = Math.floor(Date.now() / 1000);
const create = vi.fn(async () => ({ id: "cs_test_1", url: "https://checkout.example/cs_test_1" }));
const promoList = vi.fn();
const promoCreate = vi.fn();
const promoRetrieve = vi.fn();
let fakeDb: any = null;

vi.mock("./stripe.js", () => ({
  getStripe: () => ({
    checkout: { sessions: { create } },
    promotionCodes: {
      list: (p: any) => promoList(p),
      create: (p: any) => promoCreate(p),
      retrieve: (id: string) => promoRetrieve(id),
    },
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
  promoRetrieve.mockReset();
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

/** In-memory Firestore: collection(name).doc(id).get/set(merge) + versioned runTransaction. */
function memoryDb(opts: { failWrite?: boolean } = {}) {
  const data = new Map<string, Record<string, any>>();
  const versions = new Map<string, number>();
  let gate = Promise.resolve();
  const withLock = async <T>(fn: () => T | Promise<T>) => {
    const prev = gate;
    let release!: () => void;
    gate = new Promise<void>((r) => {
      release = r;
    });
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  };
  const ref = (col: string, id: string) => {
    const key = `${col}/${id}`;
    return {
      key,
      get: async () => ({ exists: data.has(key), data: () => data.get(key), get: (f: string) => data.get(key)?.[f] }),
      set: async (v: Record<string, any>, o?: { merge?: boolean }) => {
        if (opts.failWrite && col === "mailing_list") throw new Error("write failed");
        data.set(key, o?.merge ? { ...(data.get(key) || {}), ...v } : v);
        versions.set(key, (versions.get(key) ?? 0) + 1);
      },
    };
  };
  return {
    data,
    collection: (col: string) => ({ doc: (id: string) => ref(col, id) }),
    runTransaction: async (fn: any) => {
      for (let attempt = 0; attempt < 8; attempt++) {
        const reads = new Map<string, number>();
        const writes: Array<{ key: string; v: Record<string, any>; merge?: boolean }> = [];
        const result = await fn({
          get: async (r: any) => {
            reads.set(r.key, versions.get(r.key) ?? 0);
            return r.get();
          },
          set: (r: any, v: Record<string, any>, o?: { merge?: boolean }) => {
            writes.push({ key: r.key, v, merge: o?.merge });
          },
        });
        const committed = await withLock(() => {
          for (const [key, ver] of reads) {
            if ((versions.get(key) ?? 0) !== ver) return false;
          }
          for (const w of writes) {
            if (opts.failWrite && w.key.startsWith("mailing_list/")) throw new Error("write failed");
            data.set(w.key, w.merge ? { ...(data.get(w.key) || {}), ...w.v } : w.v);
            versions.set(w.key, (versions.get(w.key) ?? 0) + 1);
          }
          return true;
        });
        if (committed) return result;
      }
      throw new Error("transaction contention");
    },
  };
}

const okBody = { questionId: "body-largest-organ", answerId: "c", email: " Shopper@Example.com ", consent: true };

describe("POST ?op=discount-spin", () => {
  beforeEach(() => {
    fakeDb = memoryDb();
    promoCreate.mockImplementation(async (p: any) => ({ id: "promo_new", code: p.code }));
  });

  it("requires a valid email and consent=true (400, nothing saved or minted)", async () => {
    const cases: Array<[any, string]> = [
      [{ questionId: "body-largest-organ", answerId: "c", consent: true }, "email"],
      [{ ...okBody, email: "not-an-email" }, "email"],
      [{ ...okBody, email: "a/b@example.com" }, "email"],
      [{ ...okBody, consent: false }, "consent"],
      [{ ...okBody, consent: "true" }, "consent"],
      [{ ...okBody, consent: undefined }, "consent"],
      [{}, "email"],
    ];
    for (const [body, field] of cases) {
      const res = await call(body, { op: "discount-spin" });
      expect(res.statusCode, JSON.stringify(body)).toBe(400);
      expect(res.body.field).toBe(field);
      expect(typeof res.body.error).toBe("string");
    }
    expect(promoCreate).not.toHaveBeenCalled();
    expect(fakeDb.data.size).toBe(0); // invalid requests don't even use a rate-limit slot
  });

  it("saves the subscriber, returns a server-picked code and never creates a checkout session", async () => {
    const res = await call({ ...okBody, percentOff: 25 }, { op: "discount-spin" });
    expect(res.statusCode).toBe(200);
    expect(res.body.code).toMatch(/^FIRE(5|10|15|20|25)-[23456789A-HJKMNP-Z]{6}$/);
    expect([5, 10, 15, 20, 25]).toContain(res.body.percentOff);
    expect(res.body.code.startsWith(`FIRE${res.body.percentOff}-`)).toBe(true);
    expect(res.body.expiresAt).toBeGreaterThan(NOW_S);
    expect(res.body.promotionCodeId).toBeUndefined();
    expect(res.body.existing).toBeUndefined();
    expect(res.headers["Cache-Control"]).toBe("no-store");
    expect(create).not.toHaveBeenCalled();
    const p = promoCreate.mock.calls[0][0];
    expect(p.max_redemptions).toBe(1);
    expect(p.promotion.coupon).toBe(`pf-daily-fire-${res.body.percentOff}`);
    expect(p.restrictions).toBeUndefined(); // guest checkout may use any email

    const doc = fakeDb.data.get("mailing_list/shopper@example.com");
    expect(doc).toMatchObject({
      email: "shopper@example.com",
      consent: true,
      consentText: "Email me Pure Fire news and offers. Unsubscribe anytime.",
      source: "daily-fire",
      sources: ["daily-fire"],
      subscribed: true,
      dailyFireQuestionId: "body-largest-organ",
      dailyFirePercentOff: res.body.percentOff,
      dailyFirePromoCodeId: "promo_new",
      dailyFireCode: res.body.code,
      dailyFireExpiresAt: res.body.expiresAt,
    });
    expect(typeof doc.createdAt).toBe("string");
    expect(typeof doc.lastRevealAt).toBe("string");
    expect(doc.lastCodeIssuedAt).toBe(doc.lastRevealAt);
    expect(doc.dailyFireCodes).toEqual([
      {
        code: res.body.code,
        percentOff: res.body.percentOff,
        promoCodeId: "promo_new",
        expiresAt: res.body.expiresAt,
        issuedAt: doc.lastCodeIssuedAt,
      },
    ]);
  });

  it("stores the server's consent wording, not text sent by the browser", async () => {
    await call({ ...okBody, consentText: "I agree to nothing" }, { op: "discount-spin" });
    expect(fakeDb.data.get("mailing_list/shopper@example.com").consentText).toBe(
      "Email me Pure Fire news and offers. Unsubscribe anytime."
    );
  });

  it("one code per email: returns the same unexpired, unredeemed code instead of minting", async () => {
    const first = await call(okBody, { op: "discount-spin" });
    expect(promoCreate).toHaveBeenCalledTimes(1);
    promoRetrieve.mockResolvedValue({
      id: "promo_new",
      code: first.body.code,
      active: true,
      expires_at: first.body.expiresAt,
      max_redemptions: 1,
      times_redeemed: 0,
      metadata: {},
    });
    const again = await call({ ...okBody, email: "SHOPPER@example.com" }, { op: "discount-spin" });
    expect(again.statusCode).toBe(200);
    expect(again.body).toMatchObject({ code: first.body.code, percentOff: first.body.percentOff, existing: true });
    expect(promoRetrieve).toHaveBeenCalledWith("promo_new");
    expect(promoCreate).toHaveBeenCalledTimes(1);
  });

  it("does not mint a second code within 30 days, even if the first was redeemed or expired", async () => {
    const first = await call(okBody, { op: "discount-spin" });
    const issuedAt = fakeDb.data.get("mailing_list/shopper@example.com").lastCodeIssuedAt;
    const base = { id: "promo_new", code: first.body.code, active: true, expires_at: first.body.expiresAt, max_redemptions: 1, times_redeemed: 0, metadata: {} };
    for (const over of [{ times_redeemed: 1 }, { active: false }, { expires_at: NOW_S - 10 }]) {
      promoRetrieve.mockResolvedValueOnce({ ...base, ...over });
      fakeDb.data.delete([...fakeDb.data.keys()].find((k: string) => k.startsWith("discount_spin_limits/")));
      const res = await call(okBody, { op: "discount-spin" });
      expect(res.statusCode).toBe(409);
      expect(res.body.error).toMatch(/^Your next Daily Fire code is available on /);
      expect(typeof res.body.nextAvailableAt).toBe("string");
      expect(new Date(res.body.nextAvailableAt).getTime()).toBe(new Date(issuedAt).getTime() + 30 * 86_400_000);
    }
    expect(promoCreate).toHaveBeenCalledTimes(1);
    expect(fakeDb.data.get("mailing_list/shopper@example.com").dailyFireCodes).toHaveLength(1);
  });

  it("mints a new code after the 30-day window and appends it to the history", async () => {
    const first = await call(okBody, { op: "discount-spin" });
    const doc = fakeDb.data.get("mailing_list/shopper@example.com");
    const issued = new Date(Date.now() - 31 * 86_400_000).toISOString();
    doc.lastCodeIssuedAt = issued;
    doc.lastRevealAt = issued;
    doc.dailyFireExpiresAt = Math.floor(Date.now() / 1000) - 10;
    promoCreate.mockImplementation(async (p: any) => ({ id: "promo_later", code: p.code }));
    fakeDb.data.delete([...fakeDb.data.keys()].find((k: string) => k.startsWith("discount_spin_limits/")));
    const res = await call(okBody, { op: "discount-spin" });
    expect(res.statusCode).toBe(200);
    expect(res.body.code).not.toBe(first.body.code);
    expect(res.body.existing).toBeUndefined();
    const next = fakeDb.data.get("mailing_list/shopper@example.com");
    expect(next.dailyFirePromoCodeId).toBe("promo_later");
    expect(next.dailyFireCodes).toHaveLength(2);
    expect(next.dailyFireCodes[0].code).toBe(first.body.code);
    expect(next.dailyFireCodes[1].code).toBe(res.body.code);
    expect(next.dailyFireCodes[1].promoCodeId).toBe("promo_later");
    expect(new Date(next.lastCodeIssuedAt).getTime()).toBeGreaterThan(new Date(issued).getTime());
  });

  it("backfills lastCodeIssuedAt from lastRevealAt when the field is missing", async () => {
    const issued = new Date(Date.now() - 3 * 86_400_000).toISOString();
    fakeDb.data.set("mailing_list/shopper@example.com", {
      email: "shopper@example.com",
      dailyFireCode: "FIRE10-OLDOLD",
      dailyFirePromoCodeId: "promo_old",
      dailyFirePercentOff: 10,
      dailyFireExpiresAt: NOW_S - 10,
      lastRevealAt: issued,
    });
    const res = await call(okBody, { op: "discount-spin" });
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/^Your next Daily Fire code is available on /);
    expect(promoCreate).not.toHaveBeenCalled();
    expect(fakeDb.data.get("mailing_list/shopper@example.com").lastCodeIssuedAt).toBe(issued);
  });

  it("concurrent reveals for the same email mint only one code", async () => {
    let release!: () => void;
    const hold = new Promise<void>((r) => {
      release = r;
    });
    let started = 0;
    promoCreate.mockImplementation(async (p: any) => {
      started += 1;
      await hold;
      return { id: `promo_race_${started}`, code: p.code };
    });
    const a = call(okBody, { op: "discount-spin" });
    const b = call({ ...okBody, email: "SHOPPER@example.com" }, { op: "discount-spin" });
    await vi.waitFor(() => expect(fakeDb.data.get("mailing_list/shopper@example.com")?.lastCodeIssuedAt).toBeTruthy());
    release();
    const [r1, r2] = await Promise.all([a, b]);
    const statuses = [r1.statusCode, r2.statusCode].sort();
    expect(statuses).toEqual([200, 409]);
    const ok = r1.statusCode === 200 ? r1 : r2;
    const wait = r1.statusCode === 409 ? r1 : r2;
    expect(ok.body.code).toMatch(/^FIRE/);
    expect(wait.body.error).toMatch(/^Your next Daily Fire code is available on /);
    expect(promoCreate).toHaveBeenCalledTimes(1);
    expect(fakeDb.data.get("mailing_list/shopper@example.com").dailyFireCodes).toHaveLength(1);
  });

  it("keeps a footer subscriber's original source/createdAt and adds daily-fire; re-subscribes an unsubscribed email", async () => {
    fakeDb.data.set("mailing_list/shopper@example.com", {
      email: "shopper@example.com",
      source: "website",
      subscribed: false,
      subscribedAt: "2026-01-01T00:00:00.000Z",
      unsubscribedAt: "2026-02-01T00:00:00.000Z",
    });
    const res = await call(okBody, { op: "discount-spin" });
    expect(res.statusCode).toBe(200);
    const doc = fakeDb.data.get("mailing_list/shopper@example.com");
    expect(doc).toMatchObject({ source: "website", sources: ["website", "daily-fire"], subscribed: true, unsubscribedAt: null, createdAt: "2026-01-01T00:00:00.000Z", consent: true });
    expect(doc.subscribedAt).not.toBe("2026-01-01T00:00:00.000Z");
  });

  it("no code if the email can't be saved (500) or Firestore isn't configured (503)", async () => {
    fakeDb = memoryDb({ failWrite: true });
    let res = await call(okBody, { op: "discount-spin" });
    expect(res.statusCode).toBe(500);
    expect(promoCreate).not.toHaveBeenCalled();
    fakeDb = null;
    res = await call(okBody, { op: "discount-spin" });
    expect(res.statusCode).toBe(503);
    expect(promoCreate).not.toHaveBeenCalled();
  });

  it("503 when the tier coupons are not set up", async () => {
    promoCreate.mockRejectedValue(Object.assign(new Error("No such coupon"), { code: "resource_missing" }));
    const res = await call(okBody, { op: "discount-spin" });
    expect(res.statusCode).toBe(503);
  });

  it("503 when Stripe is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const res = await call(okBody, { op: "discount-spin" });
    expect(res.statusCode).toBe(503);
  });

  it("429 once an IP is over the daily limit (also for repeat emails)", async () => {
    for (let i = 0; i < 3; i++) expect((await call({ ...okBody, email: `s${i}@example.com` }, { op: "discount-spin" })).statusCode).toBe(200);
    const res = await call({ ...okBody, email: "s9@example.com" }, { op: "discount-spin" });
    expect(res.statusCode).toBe(429);
    expect(promoCreate).toHaveBeenCalledTimes(3);
    expect(fakeDb.data.has("mailing_list/s9@example.com")).toBe(false);
  });
});
