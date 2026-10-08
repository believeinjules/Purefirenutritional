/**
 * Customer reviews: shape, public-visibility rules and the health-claim guard.
 *
 * Storage: Firestore `reviews/{id}`, written ONLY through the Admin SDK
 * (/api/admin/reviews). Browsers read approved reviews through the public
 * GET /api/reviews endpoint, which returns only the fields below — never an
 * email address.
 *
 * A review is shown publicly only when ALL of these are true:
 *   - approved === true      (Julia approved it)
 *   - permission === true    (the customer gave permission to publish)
 *   - rating is 1–5 and text is not empty
 *   - the text does not make a health claim (cured / treated / fixed …)
 *     — reviews that do are never shown, even if approved.
 *
 * No sample or placeholder reviews are ever committed.
 */

export type ReviewDoc = {
  productId: string;
  firstName: string;
  /** One letter, shown as "First L." */
  lastInitial: string;
  /** YYYY-MM-DD */
  date: string;
  text: string;
  rating: number;
  /** Bought from Pure Fire (shows a "Verified buyer" tag). */
  verified: boolean;
  /** Julia approved it for the site. */
  approved: boolean;
  /** Customer gave permission to publish. */
  permission: boolean;
};

export type PublicReview = {
  id: string;
  productId: string;
  /** "Jane D." */
  displayName: string;
  date: string;
  text: string;
  rating: number;
  verified: boolean;
};

export type ReviewSummary = { count: number; average: number };

/**
 * Words that turn a review into a health claim. Structure/function language
 * only on this site, so a review containing any of these is never shown.
 */
const HEALTH_CLAIM_RE = new RegExp(
  "\\b(" +
    [
      "cur(e|es|ed|ing)",
      "treat(s|ed|ing|ment|ments)?",
      "fix(es|ed|ing)?",
      "heal(s|ed|ing)?",
      "revers(e|es|ed|ing|al)",
      "remission",
      "disease\\w*",
      "diagnos\\w*",
      "illness\\w*",
      "disorder\\w*",
      "got rid of",
      "no longer (need|take|taking)",
      "off (my )?(meds|medications?|prescriptions?)",
      "instead of (my )?(meds|medications?|prescriptions?)",
      "miracle",
    ].join("|") +
    ")\\b",
  "i"
);

/** True when review text makes a health / disease claim (must not be shown). */
export function hasHealthClaim(text: string): boolean {
  return HEALTH_CLAIM_RE.test(text || "");
}

function isValidRating(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5;
}

/** Visibility rule for the public site. */
export function isPublicReview(r: Partial<ReviewDoc> | null | undefined): boolean {
  if (!r) return false;
  return (
    r.approved === true &&
    r.permission === true &&
    typeof r.productId === "string" &&
    r.productId.length > 0 &&
    typeof r.firstName === "string" &&
    r.firstName.trim().length > 0 &&
    typeof r.text === "string" &&
    r.text.trim().length > 0 &&
    isValidRating(r.rating) &&
    !hasHealthClaim(r.text)
  );
}

/** "Jane" + "doe" → "Jane D." */
export function reviewDisplayName(firstName: string, lastInitial?: string): string {
  const first = (firstName || "").trim();
  const initial = (lastInitial || "").trim().charAt(0).toUpperCase();
  return initial ? `${first} ${initial}.` : first;
}

export function toPublicReview(id: string, r: ReviewDoc): PublicReview {
  return {
    id,
    productId: r.productId,
    displayName: reviewDisplayName(r.firstName, r.lastInitial),
    date: typeof r.date === "string" ? r.date : "",
    text: r.text.trim(),
    rating: r.rating,
    verified: r.verified === true,
  };
}

export function summarize(reviews: Array<{ rating: number }>): ReviewSummary {
  if (reviews.length === 0) return { count: 0, average: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { count: reviews.length, average: Math.round((sum / reviews.length) * 10) / 10 };
}

/** Per-product summaries for public reviews. */
export function summarizeByProduct(reviews: PublicReview[]): Record<string, ReviewSummary> {
  const groups = new Map<string, PublicReview[]>();
  for (const r of reviews) {
    const list = groups.get(r.productId) ?? [];
    list.push(r);
    groups.set(r.productId, list);
  }
  const out: Record<string, ReviewSummary> = {};
  groups.forEach((list, id) => {
    out[id] = summarize(list);
  });
  return out;
}
