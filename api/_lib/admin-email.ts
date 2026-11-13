import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./admin-auth.js";
import { EMAIL_TEST_RECIPIENT, sendEmailTest } from "./email.js";

/**
 * Owner-only email test, served from api/admin/[collection].ts (no new
 * function file — Vercel Hobby allows 12):
 *
 *   POST /api/admin/email-test
 *     Sends "Pure Fire email test" to purefiren@gmail.com only.
 *     Auth: admin Firebase ID token (ADMIN_EMAILS + verified).
 *
 * The temporary token path and the one-off confirmation resend used on
 * 2026-11-12 were removed after use.
 */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 1)}***@${domain}`;
}

export async function handleEmailTest(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const result = await sendEmailTest();
  return res.status(result.ok ? 200 : 502).json({ to: EMAIL_TEST_RECIPIENT, ...result });
}
