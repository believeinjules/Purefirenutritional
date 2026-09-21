/**
 * Client-side admin allowlist for SPA UI gating.
 *
 * Set VITE_ADMIN_EMAILS to the same comma-separated list as server ADMIN_EMAILS
 * (e.g. julesxshulman@gmail.com). Vite embeds VITE_* at build time — after
 * changing it on Vercel, redeploy so the client bundle picks it up.
 *
 * This is NOT a data-security boundary: Firestore rules and server ADMIN_EMAILS
 * still gate writes. The UI gate only keeps the Admin screens from rendering
 * for logged-out / non-allowlisted users.
 *
 * Admin UI does NOT require emailVerified (Firebase Console may not let you
 * flip that flag). POST /api/admin/seed-products still requires email_verified
 * on the ID-token path — see docs/admin-ui-lock.md.
 */

import type { User } from "firebase/auth";

/** Parse VITE_ADMIN_EMAILS (comma-separated, case-insensitive). */
export function parseAdminEmails(raw: string | undefined | null): string[] {
  return (raw || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Emails from env at build time. Fail closed if unset. */
export function getAdminEmails(): string[] {
  return parseAdminEmails(import.meta.env.VITE_ADMIN_EMAILS as string | undefined);
}

export function isAdminEmail(
  email: string | null | undefined,
  allowlist: string[] = getAdminEmails()
): boolean {
  if (!email || allowlist.length === 0) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

/**
 * True when the Firebase user may see Admin UI:
 * signed in with email on VITE_ADMIN_EMAILS.
 * Does not require emailVerified (UI unlock priority).
 */
export function isAdminUser(
  user: User | null | undefined,
  allowlist: string[] = getAdminEmails()
): boolean {
  if (!user?.email) return false;
  return isAdminEmail(user.email, allowlist);
}
