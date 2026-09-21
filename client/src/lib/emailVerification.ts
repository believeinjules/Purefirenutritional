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


/** Toast copy when account exists but sendEmailVerification failed. Always mentions Resend. */
export function formatVerificationSendFailureMessage(
  firebaseError?: { message?: string } | null
): string {
  const detail =
    firebaseError?.message && String(firebaseError.message).trim()
      ? ` (${String(firebaseError.message).trim()})`
      : "";
  return `Account created, but we couldn’t send the verification email${detail}. Use Resend on your dashboard.`;
}

/**
 * After applyActionCode + reload (or verified=1 redirect + reload), only treat as success
 * when the refreshed user reports emailVerified === true.
 */
export function isEmailVerificationConfirmed(
  refreshed: { emailVerified?: boolean } | null | undefined
): boolean {
  return refreshed?.emailVerified === true;
}
