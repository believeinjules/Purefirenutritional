/**
 * Public /review submission: one runtime schema (zod) shared by the browser
 * form and the server (POST /api/reviews), plus the pure builders for the
 * Firestore docs. No Firebase imports, so it is unit-testable.
 *
 * One submission → up to two `reviews` docs, both `status: "pending"`:
 *   - the review itself: kind "product" (productId set) or kind "general"
 *     (productId "", not tied to a product; never counted in product stars);
 *   - optionally kind "service": the answer to "How was your experience
 *     buying from Pure Fire Nutritional?" (no stars; site-wide only).
 */
import { z } from "zod";
import {
  PUBLIC_EMAIL_MAX,
  PUBLIC_NAME_MAX,
  PUBLIC_REVIEW_TEXT_MAX,
  PUBLIC_REVIEW_TEXT_MIN,
  type ReviewDoc,
} from "./reviews.js";

/** Dropdown value for "General / not product-specific". */
export const GENERAL_REVIEW_VALUE = "general";
export const CONSENT_LABEL = "I agree Pure Fire may post my review with my first name and last initial.";
export const SERVICE_QUESTION = "How was your experience buying from Pure Fire Nutritional?";
export const SERVICE_TEXT_MAX = 1000;
/** Real people take longer than this to fill the form. */
export const MIN_FILL_MS = 3000;

const trimmed = (max: number) => z.string().trim().max(max);

export const reviewSubmissionSchema = z.object({
  /** A visible product id, or GENERAL_REVIEW_VALUE. Checked against the catalog by the caller. */
  productId: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{0,99}$/, "Choose a product or General."),
  rating: z.number().int().min(1, "Choose a star rating.").max(5, "Choose a star rating."),
  text: trimmed(PUBLIC_REVIEW_TEXT_MAX + 50)
    .min(PUBLIC_REVIEW_TEXT_MIN, `Please write at least ${PUBLIC_REVIEW_TEXT_MIN} characters.`)
    .max(PUBLIC_REVIEW_TEXT_MAX, `Please keep it under ${PUBLIC_REVIEW_TEXT_MAX} characters.`),
  firstName: trimmed(PUBLIC_NAME_MAX)
    .min(1, "Add your first name.")
    .regex(/^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'’ .-]*$/, "Use letters only for your first name."),
  lastInitial: z
    .string()
    .trim()
    .transform((s) => s.replace(/\.$/, ""))
    .pipe(z.string().regex(/^[A-Za-z\u00C0-\u024F]$/, "Add one letter for your last initial.")),
  email: z.union([z.literal(""), z.string().trim().max(PUBLIC_EMAIL_MAX).email("Check your email address.")]).default(""),
  consent: z.literal(true, { error: "Please tick the box so we can post your review." }),
  serviceText: trimmed(SERVICE_TEXT_MAX).default(""),
  /** Honeypot: must stay empty. */
  website: z.string().max(200).default(""),
  /** ms since the form was shown. */
  elapsedMs: z.number().nonnegative().default(0),
});

export type ReviewSubmission = z.input<typeof reviewSubmissionSchema>;
export type ParsedSubmission = z.output<typeof reviewSubmissionSchema>;

export type ParseResult =
  | { ok: true; value: ParsedSubmission }
  | { ok: false; errors: Record<string, string> };

/** Validate a submission. `isProduct(id)` says whether an id is a visible, sold product. */
export function parseReviewSubmission(input: unknown, isProduct: (id: string) => boolean): ParseResult {
  const r = reviewSubmissionSchema.safeParse(input);
  const errors: Record<string, string> = {};
  if (!r.success) {
    for (const issue of r.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
  }
  const pid = (input as { productId?: unknown } | null)?.productId;
  if (!errors.productId && typeof pid === "string" && pid.trim() !== GENERAL_REVIEW_VALUE && !isProduct(pid.trim())) {
    errors.productId = "Choose a product or General.";
  }
  if (Object.keys(errors).length || !r.success) return { ok: false, errors };
  return { ok: true, value: r.data };
}

/** Honeypot filled or submitted implausibly fast. */
export function looksLikeBot(s: Pick<ParsedSubmission, "website" | "elapsedMs">): boolean {
  return s.website.trim() !== "" || s.elapsedMs < MIN_FILL_MS;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The pending Firestore docs for one submission (server adds timestamps). Never public until approved. */
export function buildPendingDocs(s: ParsedSubmission, today = new Date().toISOString().slice(0, 10)): ReviewDoc[] {
  const general = s.productId === GENERAL_REVIEW_VALUE;
  const common = {
    firstName: capitalize(s.firstName.replace(/\s+/g, " ")),
    lastInitial: s.lastInitial.toUpperCase(),
    email: s.email.toLowerCase(),
    date: today,
    verified: false,
    approved: false,
    permission: true,
    status: "pending" as const,
    source: "customer-form",
    tag: null,
  };
  const docs: ReviewDoc[] = [
    {
      ...common,
      kind: general ? "general" : "product",
      productId: general ? "" : s.productId,
      rating: s.rating,
      text: s.text,
      usedProduct: !general,
    },
  ];
  if (s.serviceText.length > 0) {
    docs.push({ ...common, kind: "service", productId: "", rating: 0, text: s.serviceText });
  }
  return docs;
}
