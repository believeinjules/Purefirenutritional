/**
 * Browser-side state for the Daily Fire popup (localStorage only).
 * Auto-popup is once per local calendar day. A claimed code hides the popup
 * and corner pill for DAILY_FIRE_CODE_WINDOW_DAYS, then both can return.
 * The discount itself is decided and enforced server-side + by Stripe.
 */
import { useEffect, useState } from "react";
import { DAILY_FIRE_CODE_WINDOW_DAYS, pickQuestion, questionById, type QuizQuestion } from "@shared/daily-fire";

export const DAILY_FIRE_STORAGE_KEY = "pf_daily_fire_v1";
export const DAILY_FIRE_SHOWN_KEY = "pf_daily_fire_shown_on";
export const DAILY_FIRE_QUESTION_KEY = "pf_daily_fire_question";
const CHANGE_EVENT = "pf-daily-fire-change";
const DAY_MS = 24 * 60 * 60 * 1000;

export type DailyFireState = {
  status: "dismissed" | "claimed";
  /** ms epoch of the dismissal / claim */
  at: number;
  code?: string;
  percentOff?: number;
  /** ms epoch when the Stripe promotion code expires */
  expiresAt?: number;
  /** Shopper removed the code from the cart, or it was used / rejected. */
  removed?: boolean;
  /** Email entered on the popup's email step (prefills the checkout email). */
  email?: string;
};

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readDailyFire(): DailyFireState | null {
  const raw = storage()?.getItem(DAILY_FIRE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as DailyFireState;
    return v && (v.status === "dismissed" || v.status === "claimed") && typeof v.at === "number" ? v : null;
  } catch {
    return null;
  }
}

function write(state: DailyFireState | null) {
  const s = storage();
  if (!s) return;
  try {
    if (state) s.setItem(DAILY_FIRE_STORAGE_KEY, JSON.stringify(state));
    else s.removeItem(DAILY_FIRE_STORAGE_KEY);
  } catch {
    /* private mode / quota: popup may show again, which is harmless */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function localCalendarDay(now: number): string {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** A claimed code hides the popup and pill until 30 days after the claim. */
export function isClaimedInWindow(state: DailyFireState | null, now: number): boolean {
  if (!state || state.status !== "claimed") return false;
  return now < state.at + DAILY_FIRE_CODE_WINDOW_DAYS * DAY_MS;
}

function dismissedToday(state: DailyFireState | null, now: number): boolean {
  return Boolean(state && state.status === "dismissed" && localCalendarDay(state.at) === localCalendarDay(now));
}

/** Auto-popup: not claimed in the last 30 days, and not already shown/dismissed today. */
export function isPopupEligible(state: DailyFireState | null, now: number, shownOn?: string | null): boolean {
  if (isClaimedInWindow(state, now)) return false;
  if (shownOn && shownOn === localCalendarDay(now)) return false;
  if (dismissedToday(state, now)) return false;
  return true;
}

/** Corner pill after the popup was shown or dismissed today, hidden while a claim is in the 30-day window. */
export function isPillVisible(state: DailyFireState | null, now: number, shownOn?: string | null): boolean {
  if (isClaimedInWindow(state, now)) return false;
  if (shownOn && shownOn === localCalendarDay(now)) return true;
  if (dismissedToday(state, now)) return true;
  return false;
}

export function readShownOn(): string | null {
  try {
    return storage()?.getItem(DAILY_FIRE_SHOWN_KEY) ?? null;
  } catch {
    return null;
  }
}

export function markShownToday(now = Date.now()) {
  try {
    storage()?.setItem(DAILY_FIRE_SHOWN_KEY, localCalendarDay(now));
  } catch {
    /* ignore */
  }
}

export function resumeOrPickQuestion(now = Date.now()): QuizQuestion {
  const today = localCalendarDay(now);
  try {
    const raw = storage()?.getItem(DAILY_FIRE_QUESTION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id?: string; day?: string };
      if (parsed?.day === today && typeof parsed.id === "string") {
        const q = questionById(parsed.id);
        if (q) return q;
      }
    }
  } catch {
    /* ignore */
  }
  const q = pickQuestion();
  try {
    storage()?.setItem(DAILY_FIRE_QUESTION_KEY, JSON.stringify({ id: q.id, day: today }));
  } catch {
    /* ignore */
  }
  return q;
}

/** The code to pre-apply at checkout, if one is claimed, unexpired and not removed. */
export function activeCode(state: DailyFireState | null, now: number): { code: string; percentOff: number; expiresAt: number } | null {
  if (!state || state.status !== "claimed" || state.removed || !state.code) return null;
  if (typeof state.expiresAt === "number" && state.expiresAt <= now) return null;
  return { code: state.code, percentOff: state.percentOff ?? 0, expiresAt: state.expiresAt ?? 0 };
}

export function markDismissed(now = Date.now()) {
  const cur = readDailyFire();
  if (cur?.status === "claimed") return; // a claim outranks a later close
  write({ status: "dismissed", at: now });
}

export function markClaimed(
  code: string,
  percentOff: number,
  expiresAtSec: number,
  now = Date.now(),
  email?: string
) {
  write({ status: "claimed", at: now, code, percentOff, expiresAt: expiresAtSec * 1000, ...(email ? { email } : {}) });
}

/** Email the shopper gave the popup, if any (used to prefill an empty checkout email). */
export function dailyFireEmail(): string | null {
  const e = readDailyFire()?.email;
  return typeof e === "string" && e ? e : null;
}

/** Remove the code from the cart (popup stays hidden for the 30-day claim window). */
export function removeAppliedCode() {
  const cur = readDailyFire();
  if (cur?.status === "claimed") write({ ...cur, removed: true });
}

/** Let the shopper put a removed (still valid) code back. */
export function restoreAppliedCode() {
  const cur = readDailyFire();
  if (cur?.status === "claimed" && cur.removed) write({ ...cur, removed: false });
}

/** React hook: current applied code (re-renders on changes in this and other tabs). */
export function useDailyFireCode() {
  const [state, setState] = useState<DailyFireState | null>(null);
  useEffect(() => {
    const sync = () => setState(readDailyFire());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const now = Date.now();
  return { state, applied: activeCode(state, now) };
}
