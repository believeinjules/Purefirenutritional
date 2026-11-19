import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  existingCodeHistory,
  findReusableCode,
  formatNextCodeAvailableOn,
  parseRevealRequest,
  resolveLastCodeIssuedAt,
  runDailyFireReveal,
  subscriberFields,
  subscribersToCsv,
  SUBSCRIBER_CSV_COLUMNS,
  DAILY_FIRE_CODE_WINDOW_MS,
} from "./daily-fire-subscriber";
import { DAILY_FIRE_CONSENT_TEXT } from "../../shared/daily-fire";

const NOW = Date.UTC(2026, 10, 18, 12);
const NOW_S = Math.floor(NOW / 1000);

describe("parseRevealRequest", () => {
  it("normalizes the email and keeps only known question/answer ids", () => {
    const r = parseRevealRequest({ email: " A@B.Co ", consent: true, questionId: "goal-focus", answerId: "zz" });
    expect(r).toEqual({ ok: true, value: { email: "a@b.co", questionId: "goal-focus", answerId: "" } });
    const r2 = parseRevealRequest({ email: "a@b.co", consent: true, questionId: "nope", answerId: "a" });
    expect(r2).toEqual({ ok: true, value: { email: "a@b.co", questionId: "", answerId: "" } });
    const r3 = parseRevealRequest({ email: "a@b.co", consent: true, questionId: "goal-supplement", answerId: "e" });
    expect(r3).toEqual({ ok: true, value: { email: "a@b.co", questionId: "goal-supplement", answerId: "e" } });
    const r4 = parseRevealRequest({
      email: "a@b.co",
      consent: true,
      questionId: "goal-supplement",
      answerId: "e",
      otherText: "Learning to paint landscapes",
    });
    expect(r4).toEqual({ ok: true, value: { email: "a@b.co", questionId: "goal-supplement", answerId: "e" } });
    expect("otherText" in (r4 as { value: object }).value).toBe(false);
    const r5 = parseRevealRequest({ email: "a@b.co", consent: true, questionId: "goal-supplement", answerId: "z" });
    expect(r5).toEqual({ ok: true, value: { email: "a@b.co", questionId: "goal-supplement", answerId: "" } });
  });
  it("rejects missing/invalid email and anything but consent === true", () => {
    expect(parseRevealRequest(null)).toMatchObject({ ok: false, field: "email" });
    expect(parseRevealRequest({ email: 5, consent: true })).toMatchObject({ ok: false, field: "email" });
    expect(parseRevealRequest({ email: "x".repeat(250) + "@b.co", consent: true })).toMatchObject({ ok: false, field: "email" });
    for (const consent of [false, "true", 1, undefined, null]) {
      expect(parseRevealRequest({ email: "a@b.co", consent })).toMatchObject({ ok: false, field: "consent" });
    }
  });
});

describe("subscriberFields", () => {
  const req = { email: "a@b.co", questionId: "goal-focus", answerId: "b" };
  it("new subscriber: source daily-fire, consent wording from the server constant", () => {
    const f = subscriberFields(req, undefined, NOW);
    expect(f).toMatchObject({
      email: "a@b.co",
      consent: true,
      consentText: DAILY_FIRE_CONSENT_TEXT,
      source: "daily-fire",
      sources: ["daily-fire"],
      subscribed: true,
      confirmed: false,
      unsubscribedAt: null,
      createdAt: new Date(NOW).toISOString(),
      subscribedAt: new Date(NOW).toISOString(),
      lastRevealAt: new Date(NOW).toISOString(),
      dailyFireQuestionId: "goal-focus",
    });
    expect("dailyFireAnswerId" in f).toBe(false);
  });
  it("existing subscribed doc keeps subscribedAt/source and isn't duplicated in sources", () => {
    const f = subscriberFields(req, { source: "daily-fire", sources: ["daily-fire"], subscribed: true, createdAt: "2026-11-01T00:00:00.000Z" }, NOW);
    expect(f.sources).toEqual(["daily-fire"]);
    expect(f.createdAt).toBe("2026-11-01T00:00:00.000Z");
    expect("subscribedAt" in f).toBe(false);
    expect("confirmed" in f).toBe(false);
  });
});

describe("findReusableCode", () => {
  const retrieve = vi.fn();
  const stripe = { promotionCodes: { retrieve } } as any;
  const doc = { dailyFirePromoCodeId: "promo_1", dailyFireExpiresAt: NOW_S + 3600, dailyFirePercentOff: 20 };
  const promo = { id: "promo_1", code: "FIRE20-ABCDEF", active: true, expires_at: NOW_S + 3600, max_redemptions: 1, times_redeemed: 0, metadata: {} };
  beforeEach(() => retrieve.mockReset());

  it("returns the stored code when Stripe says it is still redeemable", async () => {
    retrieve.mockResolvedValue(promo);
    expect(await findReusableCode(stripe, doc, NOW)).toEqual({
      code: "FIRE20-ABCDEF",
      percentOff: 20,
      expiresAt: NOW_S + 3600,
      promotionCodeId: "promo_1",
    });
  });
  it("null without a stored code, after local expiry (no Stripe call), or when used/inactive/errored", async () => {
    expect(await findReusableCode(stripe, undefined, NOW)).toBeNull();
    expect(await findReusableCode(stripe, { ...doc, dailyFireExpiresAt: NOW_S - 1 }, NOW)).toBeNull();
    expect(retrieve).not.toHaveBeenCalled();
    retrieve.mockResolvedValueOnce({ ...promo, times_redeemed: 1 });
    expect(await findReusableCode(stripe, doc, NOW)).toBeNull();
    retrieve.mockResolvedValueOnce({ ...promo, active: false });
    expect(await findReusableCode(stripe, doc, NOW)).toBeNull();
    vi.spyOn(console, "error").mockImplementation(() => {});
    retrieve.mockRejectedValueOnce(new Error("boom"));
    expect(await findReusableCode(stripe, doc, NOW)).toBeNull();
  });
});

describe("subscribersToCsv", () => {
  it("header + newest first, quotes commas, neutralises formulas, falls back to doc id", () => {
    const csv = subscribersToCsv([
      { id: "old@b.co", data: { subscribed: true, source: "website", subscribedAt: "2026-01-01T00:00:00.000Z" } },
      { id: "new@b.co", data: { email: "new@b.co", subscribed: true, consentText: "Hi, there", createdAt: "2026-11-18T00:00:00.000Z", sources: ["website", "daily-fire"] } },
      { id: "x@b.co", data: { email: "=HYPERLINK(1)", createdAt: "2026-06-01T00:00:00.000Z" } },
    ]);
    const lines = csv.trimEnd().split("\r\n");
    expect(lines[0]).toBe(SUBSCRIBER_CSV_COLUMNS.join(","));
    expect(lines[1].startsWith("new@b.co,true,,website|daily-fire,,\"Hi, there\"")).toBe(true);
    expect(lines[2].startsWith("'=HYPERLINK(1),")).toBe(true);
    expect(lines[3].startsWith("old@b.co,true,website")).toBe(true);
  });
});

describe("30-day code window helpers", () => {
  it("prefers lastCodeIssuedAt, then history, then lastRevealAt, then expiresAt minus 7 days", () => {
    expect(resolveLastCodeIssuedAt(undefined)).toBeNull();
    expect(resolveLastCodeIssuedAt({ lastCodeIssuedAt: "2026-10-01T12:00:00.000Z" })).toBe(Date.parse("2026-10-01T12:00:00.000Z"));
    expect(
      resolveLastCodeIssuedAt({
        dailyFireCodes: [{ issuedAt: "2026-09-01T00:00:00.000Z" }, { issuedAt: "2026-10-15T00:00:00.000Z" }],
      })
    ).toBe(Date.parse("2026-10-15T00:00:00.000Z"));
    expect(
      resolveLastCodeIssuedAt({
        dailyFireCode: "FIRE10-ABCDEF",
        lastRevealAt: "2026-11-01T00:00:00.000Z",
      })
    ).toBe(Date.parse("2026-11-01T00:00:00.000Z"));
    const exp = NOW_S + 7 * 86400;
    expect(resolveLastCodeIssuedAt({ dailyFirePromoCodeId: "promo_1", dailyFireExpiresAt: exp })).toBe(exp * 1000 - 7 * 86_400_000);
  });

  it("formats a friendly next-available date 30 days after issue", () => {
    const issued = Date.UTC(2026, 10, 18, 12);
    const { iso, message } = formatNextCodeAvailableOn(issued);
    expect(iso).toBe(new Date(issued + DAILY_FIRE_CODE_WINDOW_MS).toISOString());
    expect(message).toBe("Your next Daily Fire code is available on December 18, 2026.");
  });

  it("keeps existing history and backfills the current singular code without duplicating it", () => {
    const hist = existingCodeHistory({
      dailyFireCode: "FIRE10-ABCDEF",
      dailyFirePercentOff: 10,
      dailyFirePromoCodeId: "promo_1",
      dailyFireExpiresAt: NOW_S + 3600,
      lastCodeIssuedAt: "2026-11-01T00:00:00.000Z",
      dailyFireCodes: [
        { code: "FIRE10-ABCDEF", percentOff: 10, promoCodeId: "promo_1", expiresAt: NOW_S + 3600, issuedAt: "2026-11-01T00:00:00.000Z" },
      ],
    });
    expect(hist).toHaveLength(1);
    expect(hist[0].promoCodeId).toBe("promo_1");
  });
});

function memoryDb() {
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
  const ref = (id: string) => {
    const key = `mailing_list/${id}`;
    return {
      key,
      get: async () => ({ exists: data.has(key), data: () => data.get(key) }),
      set: async (v: Record<string, any>, o?: { merge?: boolean }) => {
        data.set(key, o?.merge ? { ...(data.get(key) || {}), ...v } : v);
        versions.set(key, (versions.get(key) ?? 0) + 1);
      },
    };
  };
  return {
    data,
    collection: () => ({ doc: (id: string) => ref(id) }),
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

describe("runDailyFireReveal", () => {
  const req = { email: "a@b.co", questionId: "goal-focus", answerId: "b" };
  const minted = { code: "FIRE10-ABCDEF", percentOff: 10, promotionCodeId: "promo_1", expiresAt: NOW_S + 7 * 86400 };

  it("mints once, then reuses a still-valid code within 30 days", async () => {
    const db = memoryDb();
    const mint = vi.fn(async () => minted);
    const stripe = { promotionCodes: { retrieve: vi.fn(async () => ({ id: "promo_1", code: minted.code, active: true, expires_at: minted.expiresAt, max_redemptions: 1, times_redeemed: 0 })) } } as any;
    const first = await runDailyFireReveal({ db: db as any, stripe, req, mint, now: NOW });
    expect(first).toMatchObject({ ok: true, result: minted });
    expect(mint).toHaveBeenCalledTimes(1);
    const again = await runDailyFireReveal({ db: db as any, stripe, req, mint, now: NOW + 3 * 86_400_000 });
    expect(again).toMatchObject({ ok: true, reuse: true, result: { code: minted.code, percentOff: 10 } });
    expect(mint).toHaveBeenCalledTimes(1);
  });

  it("returns a wait message when the 30-day window still applies and no code is reusable", async () => {
    const db = memoryDb();
    const mint = vi.fn(async () => minted);
    const stripe = { promotionCodes: { retrieve: vi.fn(async () => ({ id: "promo_1", code: minted.code, active: false, expires_at: NOW_S - 10, max_redemptions: 1, times_redeemed: 1 })) } } as any;
    await runDailyFireReveal({ db: db as any, stripe, req, mint, now: NOW });
    const wait = await runDailyFireReveal({ db: db as any, stripe, req, mint, now: NOW + 10 * 86_400_000 });
    expect(wait.ok).toBe(false);
    if (!wait.ok) {
      expect(wait.status).toBe(409);
      expect(wait.error).toBe("Your next Daily Fire code is available on December 18, 2026.");
      expect(wait.nextAvailableAt).toBe(new Date(NOW + DAILY_FIRE_CODE_WINDOW_MS).toISOString());
    }
    expect(mint).toHaveBeenCalledTimes(1);
  });

  it("mints again once the rolling 30-day window has elapsed", async () => {
    const db = memoryDb();
    const mint = vi.fn(async () => minted);
    const stripe = { promotionCodes: { retrieve: vi.fn(async () => ({ active: false, times_redeemed: 1, expires_at: NOW_S })) } } as any;
    await runDailyFireReveal({ db: db as any, stripe, req, mint, now: NOW });
    mint.mockImplementation(async () => ({ ...minted, code: "FIRE15-NEWNEW", percentOff: 15, promotionCodeId: "promo_2" }));
    const later = await runDailyFireReveal({ db: db as any, stripe, req, mint, now: NOW + DAILY_FIRE_CODE_WINDOW_MS });
    expect(later).toMatchObject({ ok: true, result: { code: "FIRE15-NEWNEW" } });
    expect(mint).toHaveBeenCalledTimes(2);
    expect(db.data.get("mailing_list/a@b.co").dailyFireCodes).toHaveLength(2);
  });

  it("lets only one of two concurrent requests mint a code", async () => {
    const db = memoryDb();
    let release!: () => void;
    const hold = new Promise<void>((r) => {
      release = r;
    });
    let mints = 0;
    const mint = vi.fn(async () => {
      mints += 1;
      await hold;
      return { ...minted, code: `FIRE10-MINT${mints}`, promotionCodeId: `promo_${mints}` };
    });
    const stripe = { promotionCodes: { retrieve: vi.fn(async () => null) } } as any;
    const a = runDailyFireReveal({ db: db as any, stripe, req, mint, now: NOW });
    const b = runDailyFireReveal({ db: db as any, stripe, req, mint, now: NOW });
    await vi.waitFor(() => expect(db.data.get("mailing_list/a@b.co")?.lastCodeIssuedAt).toBeTruthy());
    release();
    const [r1, r2] = await Promise.all([a, b]);
    const ok = [r1, r2].filter((r) => r.ok);
    const wait = [r1, r2].filter((r) => !r.ok);
    expect(ok).toHaveLength(1);
    expect(wait).toHaveLength(1);
    expect(wait[0]).toMatchObject({ status: 409 });
    expect(mints).toBe(1);
    expect(db.data.get("mailing_list/a@b.co").dailyFireCodes).toHaveLength(1);
  });
});
