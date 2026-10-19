/**
 * Email address validation for sign-up endpoints (mailing list).
 *
 * Accepts ordinary addresses: an unquoted dot-atom local part (letters, digits
 * and the usual specials, no leading/trailing/consecutive dots) and a domain of
 * dot-separated labels ending in an alphabetic TLD of 2+ letters. "/" is not
 * accepted because the normalized address is used as a Firestore document id.
 * Quoted local parts and IP-literal domains are deliberately rejected.
 */
const LOCAL_ATOM = "[A-Za-z0-9!#$%&'*+=?^_`{|}~-]+";
const DOMAIN_LABEL = "[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?";
const EMAIL_RE = new RegExp(
  `^${LOCAL_ATOM}(?:\\.${LOCAL_ATOM})*@(?:${DOMAIN_LABEL}\\.)+[A-Za-z]{2,63}$`,
);

/** Trimmed, lower-cased form used for storage and duplicate checks. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** True when `value` (after trimming) is a well-formed email address. */
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const email = value.trim();
  if (email.length === 0 || email.length > 254) return false;
  const at = email.lastIndexOf("@");
  if (at > 64) return false; // local part max 64 chars
  return EMAIL_RE.test(email);
}
