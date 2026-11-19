/**
 * Daily Fire mailing-list gate (server side).
 *
 * The popup only reveals a code after the shopper (1) answers the question and
 * (2) enters a valid email AND ticks the consent box. This module validates the
 * request, records the subscriber in Firestore `mailing_list` (Admin SDK only;
 * firestore.rules deny all browser access) and enforces ONE code per email per
 * rolling 30 days. If they still have a valid unused code, that code is returned;
 * otherwise they wait until the window ends. Minting is reserved inside a
 * Firestore transaction so two requests cannot issue two codes.
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
  DAILY_FIRE_CODE_TTL_DAYS,
  DAILY_FIRE_CODE_WINDOW_DAYS,
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


export const DAILY_FIRE_CODE_WINDOW_MS = DAILY_FIRE_CODE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export type DailyFireCodeRecord = {
  code: string;
  percentOff: number;
  promoCodeId: string;
  expiresAt: number;
  issuedAt: string;
};

export function parseIssuedAt(value: unknown): number | null {
  if (typeof value === "string") {
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return value > 1e12 ? value : value * 1000;
  return null;
}

/** Last code's issued time: lastCodeIssuedAt, else lastRevealAt / history / expiry minus TTL. */
export function resolveLastCodeIssuedAt(doc: SubscriberDoc): number | null {
  if (!doc) return null;
  const explicit = parseIssuedAt(doc.lastCodeIssuedAt);
  if (explicit != null) return explicit;
  const codes = Array.isArray(doc.dailyFireCodes) ? (doc.dailyFireCodes as unknown[]) : [];
  for (let i = codes.length - 1; i >= 0; i--) {
    const t = parseIssuedAt((codes[i] as { issuedAt?: unknown } | null)?.issuedAt);
    if (t != null) return t;
  }
  const hasCode =
    (typeof doc.dailyFirePromoCodeId === "string" && doc.dailyFirePromoCodeId) ||
    (typeof doc.dailyFireCode === "string" && doc.dailyFireCode);
  if (!hasCode) return null;
  const fromReveal = parseIssuedAt(doc.lastRevealAt);
  if (fromReveal != null) return fromReveal;
  const exp = Number(doc.dailyFireExpiresAt);
  if (Number.isFinite(exp) && exp > 0) {
    const expMs = exp > 1e12 ? exp : exp * 1000;
    return expMs - DAILY_FIRE_CODE_TTL_DAYS * 24 * 60 * 60 * 1000;
  }
  return null;
}

export function formatNextCodeAvailableOn(issuedAt: number): { iso: string; message: string } {
  const at = new Date(issuedAt + DAILY_FIRE_CODE_WINDOW_MS);
  const iso = at.toISOString();
  const label = at.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  return { iso, message: `Your next Daily Fire code is available on ${label}.` };
}

export function existingCodeHistory(doc: SubscriberDoc): DailyFireCodeRecord[] {
  const out: DailyFireCodeRecord[] = [];
  const seen = new Set<string>();
  const push = (r: DailyFireCodeRecord) => {
    const k = r.promoCodeId || r.code;
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push(r);
  };
  if (Array.isArray(doc?.dailyFireCodes)) {
    for (const c of doc!.dailyFireCodes as unknown[]) {
      if (!c || typeof c !== "object") continue;
      const rec = c as Record<string, unknown>;
      if (typeof rec.code !== "string" || !rec.code) continue;
      push({
        code: rec.code,
        percentOff: Number(rec.percentOff) || 0,
        promoCodeId: typeof rec.promoCodeId === "string" ? rec.promoCodeId : "",
        expiresAt: Number(rec.expiresAt) || 0,
        issuedAt: typeof rec.issuedAt === "string" ? rec.issuedAt : "",
      });
    }
  }
  if (doc && typeof doc.dailyFireCode === "string" && doc.dailyFireCode) {
    const issued = resolveLastCodeIssuedAt({ ...doc, dailyFireCodes: undefined }) ?? 0;
    push({
      code: doc.dailyFireCode as string,
      percentOff: Number(doc.dailyFirePercentOff) || 0,
      promoCodeId: typeof doc.dailyFirePromoCodeId === "string" ? doc.dailyFirePromoCodeId : "",
      expiresAt: Number(doc.dailyFireExpiresAt) || 0,
      issuedAt: issued ? new Date(issued).toISOString() : "",
    });
  }
  return out;
}

export type RevealOutcome =
  | { ok: true; reuse?: true; result: SpinResult }
  | { ok: false; status: 409; error: string; nextAvailableAt: string }
  | { ok: false; status: 500; error: string };

const SAVE_ERROR = "Could not save your email. Please try again.";
const MINT_ERROR = "Could not create a code. Please try again.";

/**
 * Consent + one-code-per-email-per-30-days, under a Firestore transaction so
 * concurrent reveals cannot mint two codes. Stripe mint happens only after the
 * slot is reserved; a failed mint rolls the reservation back.
 */
export async function runDailyFireReveal(opts: {
  db: Firestore;
  stripe: PromoReader;
  req: RevealRequest;
  mint: () => Promise<SpinResult>;
  now?: number;
}): Promise<RevealOutcome> {
  const { db, stripe, req, mint } = opts;
  const now = opts.now ?? Date.now();
  const ref = db.collection(MAILING_LIST_COLLECTION).doc(req.email);

  type Phase1 =
    | { action: "reuse"; reuse: SpinResult; issuedAt: number }
    | { action: "wait"; issuedAt: number }
    | { action: "mint"; reservationAt: number };

  let phase1: Phase1;
  try {
    phase1 = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const existing = snap.exists ? (snap.data() as Record<string, unknown>) : undefined;
      const issuedAt = resolveLastCodeIssuedAt(existing);
      const base = subscriberFields(req, existing, now);
      if (issuedAt != null && now < issuedAt + DAILY_FIRE_CODE_WINDOW_MS) {
        const backfill = { lastCodeIssuedAt: new Date(issuedAt).toISOString() };
        const reuse = await findReusableCode(stripe, existing, now);
        tx.set(ref, { ...base, ...backfill, ...(reuse ? codeFields(reuse) : {}) }, { merge: true });
        return reuse ? ({ action: "reuse", reuse, issuedAt } as const) : ({ action: "wait", issuedAt } as const);
      }
      const reservationAt = now;
      tx.set(ref, { ...base, lastCodeIssuedAt: new Date(reservationAt).toISOString() }, { merge: true });
      return { action: "mint", reservationAt } as const;
    });
  } catch (err) {
    console.error("[daily-fire] mailing_list transaction failed:", err);
    return { ok: false, status: 500, error: SAVE_ERROR };
  }

  if (phase1.action === "reuse") return { ok: true, reuse: true, result: phase1.reuse };
  if (phase1.action === "wait") {
    const { iso, message } = formatNextCodeAvailableOn(phase1.issuedAt);
    return { ok: false, status: 409, error: message, nextAvailableAt: iso };
  }

  let minted: SpinResult;
  try {
    minted = await mint();
  } catch (err) {
    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const existing = snap.exists ? (snap.data() as Record<string, unknown>) : undefined;
        if (parseIssuedAt(existing?.lastCodeIssuedAt) === phase1.reservationAt) {
          tx.set(ref, { lastCodeIssuedAt: null }, { merge: true });
        }
      });
    } catch (rollbackErr) {
      console.error("[daily-fire] could not roll back mint reservation:", rollbackErr);
    }
    throw err;
  }

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const existing = snap.exists ? (snap.data() as Record<string, unknown>) : undefined;
      const issuedIso = new Date(phase1.reservationAt).toISOString();
      const history = existingCodeHistory(existing);
      const entry: DailyFireCodeRecord = {
        code: minted.code,
        percentOff: minted.percentOff,
        promoCodeId: minted.promotionCodeId,
        expiresAt: minted.expiresAt,
        issuedAt: issuedIso,
      };
      const already = history.some((c) => (c.promoCodeId && c.promoCodeId === entry.promoCodeId) || c.code === entry.code);
      tx.set(
        ref,
        {
          ...codeFields(minted),
          lastCodeIssuedAt: issuedIso,
          lastRevealAt: issuedIso,
          dailyFireCodes: already ? history : [...history, entry],
        },
        { merge: true }
      );
    });
  } catch (err) {
    console.error("[daily-fire] could not record code on subscriber:", err);
  }
  return { ok: true, result: minted };
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
