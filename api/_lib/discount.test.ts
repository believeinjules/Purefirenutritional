import { describe, expect, it, vi } from "vitest";
import {
  DiscountUnavailableError,
  SPIN_RATE_LIMIT,
  mintDailyFireCode,
  nextSpinHits,
  randomCodeSuffix,
  spinClientKey,
  takeSpinSlot,
  validatePromotionCode,
} from "./discount";
import { DAILY_FIRE_CODE_RE } from "../../shared/daily-fire";

const NOW = Date.UTC(2026, 10, 17, 12, 0, 0);
const NOW_S = Math.floor(NOW / 1000);

function stripeWith(promotionCodes: Record<string, any>) {
  return { promotionCodes } as any;
}

describe("mintDailyFireCode (Stripe mocked)", () => {
  it("creates a unique single-use code on the tier's coupon, expiring in 7 days", async () => {
    const create = vi.fn(async (p: any) => ({ id: "promo_1", code: p.code }));
    // roll 0 → 5% tier; suffix rolls all 0 → "222222"
    const r = await mintDailyFireCode({
      stripe: stripeWith({ create }),
      questionId: "body-bones",
      answerId: "c",
      now: NOW,
      roll: () => 0,
      env: {},
    });
    expect(r).toEqual({ code: "FIRE5-222222", percentOff: 5, expiresAt: NOW_S + 7 * 86400, promotionCodeId: "promo_1" });
    expect(create).toHaveBeenCalledWith({
      promotion: { type: "coupon", coupon: "pf-daily-fire-5" },
      code: "FIRE5-222222",
      max_redemptions: 1,
      expires_at: NOW_S + 7 * 86400,
      metadata: { source: "daily-fire", percent_off: "5", question_id: "body-bones", answer_id: "c" },
    });
    expect(DAILY_FIRE_CODE_RE.test(r.code)).toBe(true);
  });

  it("the server roll decides the tier (client input cannot pick 25%)", async () => {
    const create = vi.fn(async (p: any) => ({ id: "promo_2", code: p.code }));
    let first = true;
    const roll = (max: number) => {
      if (first) {
        first = false;
        return 99; // top of the weight range → 25%
      }
      return max - 1;
    };
    const r = await mintDailyFireCode({ stripe: stripeWith({ create }), questionId: "x", answerId: "FIRE25", now: NOW, roll, env: {} });
    expect(r.percentOff).toBe(25);
    expect((create.mock.calls[0] as any)[0].promotion.coupon).toBe("pf-daily-fire-25");
    expect((create.mock.calls[0] as any)[0].metadata.question_id).toBe("");
    expect((create.mock.calls[0] as any)[0].metadata.answer_id).toBe("");
  });

  it("honors DAILY_FIRE_COUPON_PREFIX", async () => {
    const create = vi.fn(async (p: any) => ({ id: "promo_3", code: p.code }));
    await mintDailyFireCode({ stripe: stripeWith({ create }), now: NOW, roll: () => 50, env: { DAILY_FIRE_COUPON_PREFIX: "test-fire-" } as any });
    expect((create.mock.calls[0] as any)[0].promotion.coupon).toBe("test-fire-10");
  });

  it("throws DiscountUnavailableError when the coupon is missing in this Stripe mode", async () => {
    const create = vi.fn(async () => {
      throw Object.assign(new Error("No such coupon: 'pf-daily-fire-5'"), { code: "resource_missing", statusCode: 400 });
    });
    await expect(mintDailyFireCode({ stripe: stripeWith({ create }), now: NOW, roll: () => 0, env: {} })).rejects.toBeInstanceOf(
      DiscountUnavailableError
    );
  });

  it("retries once on a duplicate code", async () => {
    const create = vi
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error("An active promotion code with `code: FIRE5-222222` already exists."), { statusCode: 400 }))
      .mockImplementationOnce(async (p: any) => ({ id: "promo_4", code: p.code }));
    const r = await mintDailyFireCode({ stripe: stripeWith({ create }), now: NOW, roll: () => 0, env: {} });
    expect(r.promotionCodeId).toBe("promo_4");
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("randomCodeSuffix only uses unambiguous characters", () => {
    for (let i = 0; i < 200; i++) expect(randomCodeSuffix()).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
  });
});

function promo(over: Record<string, any> = {}) {
  return {
    id: "promo_ok",
    code: "FIRE10-K7Q2MX",
    active: true,
    expires_at: NOW_S + 3600,
    max_redemptions: 1,
    times_redeemed: 0,
    promotion: { type: "coupon", coupon: { id: "pf-daily-fire-10", percent_off: 10, amount_off: null, valid: true } },
    ...over,
  };
}

describe("validatePromotionCode (Stripe mocked)", () => {
  const listing = (activeList: any[], anyList: any[] = activeList) =>
    vi.fn(async (p: any) => ({ data: p.active ? activeList : anyList }));

  it("accepts an active, unexpired, unused code (case-insensitive input)", async () => {
    const list = listing([promo()]);
    const r = await validatePromotionCode(stripeWith({ list }), " fire10-k7q2mx ", NOW);
    expect(r).toEqual({ ok: true, promotionCodeId: "promo_ok", code: "FIRE10-K7Q2MX", percentOff: 10, amountOffCents: null });
    expect(list).toHaveBeenCalledWith({ code: "FIRE10-K7Q2MX", active: true, limit: 1, expand: ["data.promotion.coupon"] });
  });

  it("rejects malformed input without calling Stripe", async () => {
    const list = vi.fn();
    expect(await validatePromotionCode(stripeWith({ list }), "<script>", NOW)).toEqual({ ok: false, reason: "invalid" });
    expect(list).not.toHaveBeenCalled();
  });

  it("unknown → invalid", async () => {
    expect(await validatePromotionCode(stripeWith({ list: listing([], []) }), "NOPE-123", NOW)).toEqual({ ok: false, reason: "invalid" });
  });

  it("expired (inactive in Stripe) → expired", async () => {
    const list = listing([], [promo({ active: false, expires_at: NOW_S - 10 })]);
    expect(await validatePromotionCode(stripeWith({ list }), "FIRE10-K7Q2MX", NOW)).toEqual({ ok: false, reason: "expired" });
  });

  it("past expires_at even if still flagged active → expired", async () => {
    const list = listing([promo({ expires_at: NOW_S - 1 })]);
    expect(await validatePromotionCode(stripeWith({ list }), "FIRE10-K7Q2MX", NOW)).toEqual({ ok: false, reason: "expired" });
  });

  it("already redeemed → used", async () => {
    const list = listing([], [promo({ active: false, times_redeemed: 1 })]);
    expect(await validatePromotionCode(stripeWith({ list }), "FIRE10-K7Q2MX", NOW)).toEqual({ ok: false, reason: "used" });
  });

  it("coupon no longer valid → expired", async () => {
    const list = listing([promo({ promotion: { type: "coupon", coupon: { id: "c", percent_off: 10, valid: false } } })]);
    expect(await validatePromotionCode(stripeWith({ list }), "FIRE10-K7Q2MX", NOW)).toEqual({ ok: false, reason: "expired" });
  });
});

describe("spin rate limit", () => {
  it(`allows ${SPIN_RATE_LIMIT.max} reveals per IP per 24h`, () => {
    let hits: number[] = [];
    for (let i = 0; i < SPIN_RATE_LIMIT.max; i++) {
      const r = nextSpinHits(hits, NOW + i);
      expect(r.ok).toBe(true);
      hits = r.hits;
    }
    expect(nextSpinHits(hits, NOW + 10).ok).toBe(false);
    expect(nextSpinHits(hits, NOW + SPIN_RATE_LIMIT.windowMs + 10).ok).toBe(true);
  });

  it("hashes the IP (never stored raw)", () => {
    const k = spinClientKey({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
    expect(k).toMatch(/^[0-9a-f]{32}$/);
    expect(k).not.toContain("203");
    expect(spinClientKey({ "x-forwarded-for": "203.0.113.7" })).toBe(k);
  });

  it("takeSpinSlot fails open when Firestore errors", async () => {
    const db = { collection: () => ({ doc: () => ({}) }), runTransaction: async () => { throw new Error("down"); } } as any;
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await takeSpinSlot(db, "k", NOW)).toBe(true);
    spy.mockRestore();
  });
});
