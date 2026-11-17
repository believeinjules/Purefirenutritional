/**
 * Daily Fire discount codes (server side).
 *
 *   POST /api/stripe/create-checkout-session?op=discount-spin
 *     (folded into the checkout function because the Vercel plan allows at
 *     most 12 functions and api/ is already at 12; see vercel-functions.test.ts)
 *
 * The tier is picked HERE with crypto randomness; the client only sends which
 * question/answer it showed. Each reveal mints a unique Stripe promotion code
 * (e.g. FIRE10-K7Q2MX) on that tier's coupon: max_redemptions 1, expires in
 * DAILY_FIRE_CODE_TTL_DAYS. A shared "FIRE25" never exists, so a code can't be
 * guessed or passed around beyond one order.
 *
 * Stripe API 2026-02-25.clover: promotion codes take
 * `promotion: { type: "coupon", coupon }` (the old top-level `coupon` param is gone).
 */
import { createHash, randomInt } from "node:crypto";
import type Stripe from "stripe";
import type { Firestore } from "firebase-admin/firestore";
import {
  CODE_ALPHABET,
  DAILY_FIRE_CODE_TTL_DAYS,
  TOTAL_TIER_WEIGHT,
  couponIdForPercent,
  normalizePromoCode,
  questionById,
  tierForRoll,
} from "../../shared/daily-fire.js";

export const SPIN_RATE_LIMIT = { windowMs: 24 * 60 * 60 * 1000, max: 3 } as const;

type StripeLike = Pick<Stripe, "promotionCodes">;

export class DiscountUnavailableError extends Error {}

export function randomCodeSuffix(rand: (max: number) => number = randomInt, length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[rand(CODE_ALPHABET.length)];
  return out;
}

export function couponPrefix(env: NodeJS.ProcessEnv = process.env): string {
  const p = (env.DAILY_FIRE_COUPON_PREFIX || "").trim();
  return /^[A-Za-z0-9_-]{1,40}$/.test(p) ? p : "pf-daily-fire-";
}

export type SpinResult = {
  code: string;
  percentOff: number;
  expiresAt: number; // unix seconds
  promotionCodeId: string;
};

/** Picks the tier server-side and creates a single-use promotion code for it. */
export async function mintDailyFireCode(args: {
  stripe: StripeLike;
  questionId?: unknown;
  answerId?: unknown;
  now?: number;
  roll?: (max: number) => number;
  env?: NodeJS.ProcessEnv;
}): Promise<SpinResult> {
  const now = args.now ?? Date.now();
  const roll = args.roll ?? randomInt;
  const tier = tierForRoll(roll(TOTAL_TIER_WEIGHT));
  const expiresAt = Math.floor(now / 1000) + DAILY_FIRE_CODE_TTL_DAYS * 24 * 60 * 60;
  const question = questionById(args.questionId);
  const answer =
    question && typeof args.answerId === "string"
      ? question.options.find((o) => o.id === args.answerId)?.id ?? ""
      : "";

  let lastError: unknown;
  // A suffix collision is ~1 in 887M; retry once anyway.
  for (let attempt = 0; attempt < 2; attempt++) {
    const code = `FIRE${tier.percentOff}-${randomCodeSuffix(roll)}`;
    try {
      const promo = await args.stripe.promotionCodes.create({
        promotion: { type: "coupon", coupon: couponIdForPercent(tier.percentOff, couponPrefix(args.env)) },
        code,
        max_redemptions: 1,
        expires_at: expiresAt,
        metadata: {
          source: "daily-fire",
          percent_off: String(tier.percentOff),
          question_id: question?.id ?? "",
          answer_id: answer,
        },
      });
      return { code: promo.code, percentOff: tier.percentOff, expiresAt, promotionCodeId: promo.id };
    } catch (err) {
      lastError = err;
      const e = err as { code?: string; param?: string; statusCode?: number };
      // Missing coupon (not set up in this Stripe mode) → feature unavailable.
      if (e?.code === "resource_missing" || e?.param === "promotion[coupon]") {
        throw new DiscountUnavailableError("Daily Fire coupon is not configured");
      }
      // Duplicate code → try a new suffix; anything else → give up.
      if (!(e?.statusCode === 400 && /already exists|duplicate/i.test(String((err as Error)?.message)))) break;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not create promotion code");
}

export type PromoValidation =
  | { ok: true; promotionCodeId: string; code: string; percentOff: number | null; amountOffCents: number | null }
  | { ok: false; reason: "invalid" | "expired" | "used" };

/** Looks up a customer-facing code in Stripe and checks it can still be redeemed. */
export async function validatePromotionCode(
  stripe: StripeLike,
  rawCode: unknown,
  now = Date.now()
): Promise<PromoValidation> {
  const code = normalizePromoCode(rawCode);
  if (!code) return { ok: false, reason: "invalid" };
  // Only one ACTIVE promotion code can carry a given code; inactive ones may share it.
  const active = await stripe.promotionCodes.list({
    code,
    active: true,
    limit: 1,
    expand: ["data.promotion.coupon"],
  });
  const promo = active.data[0];
  const nowSec = Math.floor(now / 1000);
  if (!promo) {
    const any = await stripe.promotionCodes.list({ code, limit: 1 });
    const old = any.data[0];
    if (!old) return { ok: false, reason: "invalid" };
    if (old.max_redemptions !== null && old.times_redeemed >= old.max_redemptions) {
      return { ok: false, reason: "used" };
    }
    return { ok: false, reason: "expired" };
  }
  if (promo.expires_at !== null && promo.expires_at <= nowSec) return { ok: false, reason: "expired" };
  if (promo.max_redemptions !== null && promo.times_redeemed >= promo.max_redemptions) {
    return { ok: false, reason: "used" };
  }
  const coupon = promo.promotion?.coupon;
  if (coupon && typeof coupon === "object" && coupon.valid === false) return { ok: false, reason: "expired" };
  return {
    ok: true,
    promotionCodeId: promo.id,
    code: promo.code,
    percentOff: coupon && typeof coupon === "object" ? coupon.percent_off ?? null : null,
    amountOffCents: coupon && typeof coupon === "object" ? coupon.amount_off ?? null : null,
  };
}

export const PROMO_REASON_MESSAGE: Record<"invalid" | "expired" | "used", string> = {
  invalid: "That discount code wasn't found, so it was removed. You can check out without it.",
  expired: "That discount code has expired, so it was removed. You can check out without it.",
  used: "That discount code was already used, so it was removed. You can check out without it.",
};

// --- per-IP rate limit (Firestore, same pattern as review-rate-limit.ts) ---

export function spinClientKey(headers: Record<string, string | string[] | undefined>): string {
  const fwd = headers["x-forwarded-for"];
  const raw =
    (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim() ||
    (headers["x-real-ip"] as string | undefined) ||
    "unknown";
  return createHash("sha256").update(`pf-daily-fire:${raw}`).digest("hex").slice(0, 32);
}

export function nextSpinHits(hits: unknown, now: number): { ok: boolean; hits: number[] } {
  const since = now - SPIN_RATE_LIMIT.windowMs;
  const recent = (Array.isArray(hits) ? hits : []).filter(
    (t): t is number => typeof t === "number" && t > since
  );
  if (recent.length >= SPIN_RATE_LIMIT.max) return { ok: false, hits: recent };
  return { ok: true, hits: [...recent, now] };
}

/** Records a spin; false when this IP is over the limit. Fails open if Firestore errors. */
export async function takeSpinSlot(db: Firestore, key: string, now = Date.now()): Promise<boolean> {
  const ref = db.collection("discount_spin_limits").doc(key);
  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const r = nextSpinHits(snap.exists ? snap.get("hits") : [], now);
      if (r.ok) tx.set(ref, { hits: r.hits, updatedAt: new Date(now) });
      return r.ok;
    });
  } catch (err) {
    console.error("[daily-fire] rate-limit check failed:", err);
    return true;
  }
}
