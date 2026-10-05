import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminAuth } from "./firebase.js";

export type AdminAuthResult =
  | { ok: true; email: string | null; via: "id-token" | "seed-secret" }
  | { ok: false; status: number; error: string };

export function parseAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header || Array.isArray(header)) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

function getSeedSecretHeader(req: VercelRequest): string | null {
  const raw = req.headers["x-admin-seed-secret"];
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

/**
 * Admin gate shared by every /api/admin/* route.
 *
 * 1) Firebase Auth ID token (Authorization: Bearer <token>) whose email is in
 *    ADMIN_EMAILS and email_verified === true (or custom claim admin === true).
 * 2) Only when `allowSeedSecret` is set (seed-products): ADMIN_SEED_SECRET via
 *    Bearer or x-admin-seed-secret, for emergency curl. Never use in the browser.
 */
export async function assertAdmin(
  req: VercelRequest,
  options: { allowSeedSecret?: boolean } = {}
): Promise<AdminAuthResult> {
  const adminEmails = parseAdminEmails();
  const bearer = getBearerToken(req);

  if (options.allowSeedSecret) {
    const seedSecret = process.env.ADMIN_SEED_SECRET?.trim();
    const headerSecret = getSeedSecretHeader(req);
    if (seedSecret && (bearer === seedSecret || headerSecret === seedSecret)) {
      return { ok: true, email: null, via: "seed-secret" };
    }
  }

  if (!bearer) {
    return {
      ok: false,
      status: 401,
      error: options.allowSeedSecret
        ? "Unauthorized — sign in as an admin and send Authorization: Bearer <Firebase ID token>, or use ADMIN_SEED_SECRET"
        : "Unauthorized — sign in as an admin and send Authorization: Bearer <Firebase ID token>",
    };
  }

  if (adminEmails.length === 0) {
    return {
      ok: false,
      status: 503,
      error: options.allowSeedSecret
        ? "ADMIN_EMAILS is not configured on the server (and ADMIN_SEED_SECRET did not match)"
        : "ADMIN_EMAILS is not configured on the server",
    };
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return { ok: false, status: 503, error: "Firebase Admin is not configured" };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(bearer);
    const email = (decoded.email || "").toLowerCase();
    if (!email || !adminEmails.includes(email)) {
      return { ok: false, status: 403, error: "Forbidden — email is not in ADMIN_EMAILS" };
    }
    // Custom claim `admin: true` is treated as an equivalent verified-admin gate.
    if (!decoded.email_verified && decoded.admin !== true) {
      return {
        ok: false,
        status: 403,
        error: "Forbidden — admin email must be verified (Firebase email_verified)",
      };
    }
    return { ok: true, email, via: "id-token" };
  } catch {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized — invalid or expired Firebase ID token",
    };
  }
}

/** Convenience: runs assertAdmin and writes the error response when it fails. */
export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
  options: { allowSeedSecret?: boolean } = {}
): Promise<Extract<AdminAuthResult, { ok: true }> | null> {
  const result = await assertAdmin(req, options);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return null;
  }
  res.setHeader("Cache-Control", "no-store");
  return result;
}

export function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
