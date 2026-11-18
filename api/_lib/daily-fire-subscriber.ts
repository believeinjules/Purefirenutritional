/**
 * Daily Fire mailing-list gate (server side).
 *
 * The popup only reveals a code after the shopper (1) answers the question and
 * (2) enters a valid email AND ticks the consent box. This module validates the
 * request, records the subscriber in Firestore `mailing_list` (Admin SDK only;
 * firestore.rules deny all browser access) and enforces ONE live code per email:
 * if the address already holds an unexpired, unredeemed Daily Fire promotion
 * code, the same code is returned instead of minting another.
 *
 * Doc id = normalized email (trimmed, lower-cased), the same key the existing
 * footer form (api/mailing-list/subscribe.ts) already uses, so one person is one
 * doc whichever form they used. Email validation rejects "/" so the id is safe.
 */
import type Stripe from "stripe";
import type { Firestore } from "firebase-admin/firestore";
import { isValidEmail, normalizeEmail } from "../../shared/email-address.js";
import {
  DAILY_FIRE_CONSENT_TEXT,
  DAILY_FIRE_CONSENT_VERSION,
  questionById,
} from "../../shared/daily-fire.js";
import type { SpinResult } from "./discount.js";

export const MAILING_LIST_COLLECTION = "mailing_list";
export const DAILY_FIRE_SOURCE = "daily-fire";

export type RevealRequest = {
  email: string;
  questionId: string;
  answerId: string;
};

export type RevealParse =
  | { ok: true; value: RevealRequest }
  | { ok: false; field: "email" | "consent"; error: string };

export const REVEAL_ERRORS = {
  emailMissing: "Enter your email address to reveal your code.",
  emailInvalid: "Enter a valid email address, like name@example.com.",
  consent: "Check the box to join our email list and reveal your code.",
} as const;

/** Body: { questionId, answerId, email, consent: true }. Anything else → 400. */
export function parseRevealRequest(body: unknown): RevealParse {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const rawEmail = typeof b.email === "string" ? b.email.trim() : "";
  if (!rawEmail) return { ok: false, field: "email", error: REVEAL_ERRORS.emailMissing };
  if (!isValidEmail(rawEmail)) return { ok: false, field: "email", error: REVEAL_ERRORS.emailInvalid };
  if (b.consent !== true) return { ok: false, field: "consent", error: REVEAL_ERRORS.consent };
  const question = questionById(b.questionId);
  const answerId =
    question && typeof b.answerId === "string"
      ? question.options.find((o) => o.id === b.answerId)?.id ?? ""
      : "";
  return {
    ok: true,
    value: { email: normalizeEmail(rawEmail), questionId: question?.id ?? "", answerId },
  };
}

type PromoReader = Pick<Stripe, "promotionCodes">;
type SubscriberDoc = Record<string, unknown> | undefined;

/**
 * The email's current Daily Fire code if Stripe says it can still be redeemed
 * (active, not expired, under max_redemptions); otherwise null. Errors → null
 * (a new code is minted instead).
 */
export async function findReusableCode(
  stripe: PromoReader,
  doc: SubscriberDoc,
  now = Date.now()
): Promise<SpinResult | null> {
  const id = doc?.dailyFirePromoCodeId;
  const expiresAt = Number(doc?.dailyFireExpiresAt);
  const percentOff = Number(doc?.dailyFirePercentOff);
  if (typeof id !== "string" || !id) return null;
  const nowSec = Math.floor(now / 1000);
  if (!Number.isFinite(expiresAt) || expiresAt <= nowSec) return null;
  try {
    const promo = await stripe.promotionCodes.retrieve(id);
    if (!promo || promo.active === false) return null;
    if (promo.expires_at !== null && promo.expires_at <= nowSec) return null;
    if (promo.max_redemptions !== null && promo.times_redeemed >= promo.max_redemptions) return null;
    return {
      code: promo.code,
      percentOff: Number.isFinite(percentOff) ? percentOff : Number(promo.metadata?.percent_off) || 0,
      expiresAt: promo.expires_at ?? expiresAt,
      promotionCodeId: promo.id,
    };
  } catch (err) {
    console.error("[daily-fire] could not re-check existing code:", err);
    return null;
  }
}

export async function readSubscriber(db: Firestore, email: string): Promise<SubscriberDoc> {
  const snap = await db.collection(MAILING_LIST_COLLECTION).doc(email).get();
  return snap.exists ? (snap.data() as Record<string, unknown>) : undefined;
}

/**
 * Fields written when the shopper consents on the email step. Keeps an existing
 * doc's original `source` / `createdAt` (e.g. the footer form) and adds
 * "daily-fire" to `sources`. A previously unsubscribed address is re-subscribed
 * because the shopper just gave fresh, explicit consent.
 */
export function subscriberFields(
  req: RevealRequest,
  existing: SubscriberDoc,
  now = Date.now()
): Record<string, unknown> {
  const iso = new Date(now).toISOString();
  const prevSources = Array.isArray(existing?.sources)
    ? (existing!.sources as unknown[]).filter((s): s is string => typeof s === "string")
    : typeof existing?.source === "string"
      ? [existing.source as string]
      : [];
  const sources = prevSources.includes(DAILY_FIRE_SOURCE) ? prevSources : [...prevSources, DAILY_FIRE_SOURCE];
  const wasSubscribed = existing?.subscribed === true;
  return {
    email: req.email,
    consent: true,
    consentText: DAILY_FIRE_CONSENT_TEXT,
    consentVersion: DAILY_FIRE_CONSENT_VERSION,
    consentAt: iso,
    source: typeof existing?.source === "string" ? existing.source : DAILY_FIRE_SOURCE,
    sources,
    subscribed: true,
    ...(wasSubscribed ? {} : { subscribedAt: iso, unsubscribedAt: null }),
    ...(existing ? {} : { confirmed: false, name: null }),
    createdAt:
      typeof existing?.createdAt === "string"
        ? existing.createdAt
        : typeof existing?.subscribedAt === "string"
          ? existing.subscribedAt
          : iso,
    lastRevealAt: iso,
    // The answer itself is NOT stored with the email (health-goal answers are
    // personal); it only rides on the Stripe promotion code's metadata.
    dailyFireQuestionId: req.questionId,
  };
}

export function codeFields(r: SpinResult): Record<string, unknown> {
  return {
    dailyFireCode: r.code,
    dailyFirePercentOff: r.percentOff,
    dailyFirePromoCodeId: r.promotionCodeId,
    dailyFireExpiresAt: r.expiresAt,
  };
}

export async function writeSubscriber(db: Firestore, email: string, fields: Record<string, unknown>): Promise<void> {
  await db.collection(MAILING_LIST_COLLECTION).doc(email).set(fields, { merge: true });
}

// --- Admin CSV export ------------------------------------------------------

export const SUBSCRIBER_CSV_COLUMNS = [
  "email",
  "subscribed",
  "source",
  "sources",
  "consent",
  "consentText",
  "consentAt",
  "createdAt",
  "subscribedAt",
  "unsubscribedAt",
  "lastRevealAt",
  "dailyFirePercentOff",
  "dailyFireCode",
] as const;

function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join("|") : String(v);
  // Neutralise spreadsheet formulas (CSV injection).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function subscribersToCsv(docs: Array<{ id: string; data: Record<string, unknown> }>): string {
  const rows = docs
    .map(({ id, data }) => ({ ...data, email: typeof data.email === "string" ? data.email : id }))
    .sort((a, b) => {
      const ka = String((a as any).createdAt ?? (a as any).subscribedAt ?? "");
      const kb = String((b as any).createdAt ?? (b as any).subscribedAt ?? "");
      return kb.localeCompare(ka);
    });
  const lines = [SUBSCRIBER_CSV_COLUMNS.join(",")];
  for (const r of rows) lines.push(SUBSCRIBER_CSV_COLUMNS.map((c) => csvCell((r as any)[c])).join(","));
  return lines.join("\r\n") + "\r\n";
}
