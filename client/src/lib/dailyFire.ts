/**
 * Browser-side state for the Daily Fire popup (localStorage only).
 * One reveal per browser: once a code is claimed the popup never shows again
 * while that code is valid, and a dismissal snoozes it for DAILY_FIRE_SNOOZE_DAYS.
 * The discount itself is decided and enforced server-side + by Stripe.
 */
import { useEffect, useState } from "react";
import { DAILY_FIRE_SNOOZE_DAYS } from "@shared/daily-fire";

export const DAILY_FIRE_STORAGE_KEY = "pf_daily_fire_v1";
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

/** Pure rule: should the popup be eligible for this visitor at `now`? */
export function isPopupEligible(state: DailyFireState | null, now: number): boolean {
  if (!state) return true;
  const snoozeUntil = state.at + DAILY_FIRE_SNOOZE_DAYS * DAY_MS;
  if (state.status === "claimed") {
    return now >= Math.max(snoozeUntil, state.expiresAt ?? 0);
  }
  return now >= snoozeUntil;
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

export function markClaimed(code: string, percentOff: number, expiresAtSec: number, now = Date.now()) {
  write({ status: "claimed", at: now, code, percentOff, expiresAt: expiresAtSec * 1000 });
}

/** Remove the code from the cart (popup still won't come back). */
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
