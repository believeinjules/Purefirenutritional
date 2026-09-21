/**
 * Firebase Auth email verification helpers.
 *
 * Notes for operators:
 * - Default Firebase mailer works on Spark (no Blaze required) for email/password verification.
 * - Ask users to check spam/junk if the message is missing.
 * - Customize copy later in Firebase Console → Authentication → Templates → Email address verification.
 * - Continue URL host must be listed under Authentication → Settings → Authorized domains.
 */

const DEFAULT_SITE_ORIGIN = "https://www.purefirenutritional.com";

/** Canonical site origin for verification continue URLs (authorized domain). */
export function getSiteOrigin(): string {
  const fromEnv =
    (typeof import.meta !== "undefined" &&
      (import.meta.env?.VITE_PUBLIC_SITE_URL ||
        import.meta.env?.VITE_SITE_URL)) ||
    "";
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return DEFAULT_SITE_ORIGIN;
}

/** Continue URL embedded in the verification email (lands on /auth/action). */
export function getEmailVerificationContinueUrl(): string {
  return `${getSiteOrigin()}/auth/action`;
}

export function getEmailVerificationActionCodeSettings() {
  return {
    url: getEmailVerificationContinueUrl(),
    handleCodeInApp: true,
  };
}
