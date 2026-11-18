/**
 * "Forgot password?" helpers (Firebase Auth sendPasswordResetEmail).
 *
 * The reset link opens Firebase's hosted reset page (handleCodeInApp: false),
 * which shows a "Continue" button back to the sign-in page below. The
 * continue URL host must be under Firebase Console → Authentication →
 * Settings → Authorized domains (same requirement as email verification).
 */
import { getSiteOrigin } from "./emailVerification";

/** Shown after every request that isn't a typo or rate limit, so we never reveal which emails have accounts. */
export const PASSWORD_RESET_NEUTRAL_MESSAGE =
  "If an account exists for that email, we've sent a reset link.";

/** Continue URL after resetting: the site's sign-in page. */
export function getPasswordResetContinueUrl(): string {
  return `${getSiteOrigin()}/login`;
}

export function getPasswordResetActionCodeSettings() {
  return {
    url: getPasswordResetContinueUrl(),
    handleCodeInApp: false,
  };
}

/** Errors meaning the continue URL was rejected (e.g. a preview host); retry without it. */
export function isContinueUrlError(code: string | undefined | null): boolean {
  return (
    code === "auth/unauthorized-continue-uri" ||
    code === "auth/invalid-continue-uri" ||
    code === "auth/missing-continue-uri"
  );
}

export type PasswordResetOutcome =
  | { kind: "sent"; message: string }
  | { kind: "error"; message: string };

/**
 * Map the result of sendPasswordResetEmail to what the shopper sees.
 * Unknown-account errors (auth/user-not-found, when email enumeration
 * protection is off) are reported as the neutral "sent" message.
 */
export function passwordResetOutcome(error?: { code?: string } | null): PasswordResetOutcome {
  const code = error?.code;
  if (!error) return { kind: "sent", message: PASSWORD_RESET_NEUTRAL_MESSAGE };
  switch (code) {
    case "auth/invalid-email":
    case "auth/missing-email":
      return { kind: "error", message: "Please enter a valid email address." };
    case "auth/too-many-requests":
      return {
        kind: "error",
        message: "Too many attempts. Please wait a few minutes, then try again.",
      };
    case "auth/network-request-failed":
      return {
        kind: "error",
        message: "We couldn't reach the server. Check your connection and try again.",
      };
    case "auth/user-not-found":
    case "auth/user-disabled":
      return { kind: "sent", message: PASSWORD_RESET_NEUTRAL_MESSAGE };
    default:
      return {
        kind: "error",
        message: "Something went wrong sending the reset link. Please try again.",
      };
  }
}

/**
 * Firebase's hosted action page for a link that landed on /auth/action
 * (only happens if the email template's action URL was customized to this
 * site). Returns null when the auth domain is missing or not a plain host.
 */
export function hostedAuthActionUrl(
  authDomain: string | undefined | null,
  search: string
): string | null {
  const host = (authDomain || "").trim();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) return null;
  const query = search.startsWith("?") ? search : search ? `?${search}` : "";
  return `https://${host}/__/auth/action${query}`;
}
