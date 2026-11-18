import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  findReusableCode,
  parseRevealRequest,
  subscriberFields,
  subscribersToCsv,
  SUBSCRIBER_CSV_COLUMNS,
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
