import type { VercelRequest } from "@vercel/node";
import { normalizeEmail } from "../../shared/email-address.js";
import { getBearerToken } from "./admin-auth.js";
import { getAdminAuth } from "./firebase.js";

export type SignedInUser =
  | { ok: true; uid: string; email: string; emailVerified: boolean }
  | { ok: false; status: number; error: string; code?: string };

/**
 * Verify a Firebase ID token from Authorization: Bearer.
 * email_verified is taken from the token Firebase Auth issued (Admin
 * verifyIdToken), not from client-supplied claims.
 */
export async function assertSignedIn(req: VercelRequest): Promise<SignedInUser> {
  const bearer = getBearerToken(req);
  if (!bearer) {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized — sign in and send Authorization: Bearer <Firebase ID token>",
    };
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return { ok: false, status: 503, error: "Firebase Admin is not configured" };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(bearer);
    const email = decoded.email ? normalizeEmail(decoded.email) : "";
    if (!email) {
      return { ok: false, status: 403, error: "Forbidden — account has no email" };
    }
    return {
      ok: true,
      uid: decoded.uid,
      email,
      emailVerified: decoded.email_verified === true,
    };
  } catch {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized — invalid or expired Firebase ID token",
    };
  }
}
