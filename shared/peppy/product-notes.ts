/**
 * Universal rule (Julia, 2026-10-13): every answer that suggests a product carries the
 * doctor-consult line and the dosing note, verbatim. The prompt asks for them; the server
 * appends whatever is missing (ensureProductNotes), so they cannot be dropped.
 */
import type { PeppyResponse } from "./types.js";
import { isPreorderProduct } from "../preorder.js";

/**
 * The one doctor line (Julia, 2026-10-13). The UI renders it under every answer as a
 * constant; answer text that repeats it is stripped at render time so it shows once.
 */
export const DOCTOR_CONSULT_LINE =
  "Always consult your doctor or a medical professional before starting any new supplement.";

export const DOSING_NOTE =
  "Dosage may vary depending on factors like sex, age, health status, and whether the goal is preventive (general upkeep) or regenerative (more active support); label directions are on the product page, and your doctor can help decide what's right for you, ideally informed by proper blood tests.";

/** Short pre-order mention added when a suggested product is a liquid/drop (pre-order) product. */
export const PREORDER_LINE =
  "Liquid forms are available by pre-order and usually ship within about two extra weeks.";

export const PRODUCT_NOTES_HEADING = "Before you start";

const norm = (s: string) =>
  s.replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();

function answerText(r: Pick<PeppyResponse, "summary" | "sections">): string {
  return norm([r.summary, ...r.sections.map(s => `${s.heading ?? ""} ${s.body}`)].join(" "));
}

/** Returns a copy of the response with any missing required lines appended. */
export function ensureProductNotes<T extends PeppyResponse>(response: T): T {
  if (!response.products || response.products.length === 0) return response;
  const text = answerText(response);
  const missing = [DOCTOR_CONSULT_LINE, DOSING_NOTE].filter(
    line => !text.includes(norm(line))
  );
  const hasPreorder = response.products.some(p => isPreorderProduct(p.product.id));
  if (hasPreorder && !/pre-?order/.test(text)) missing.unshift(PREORDER_LINE);
  if (missing.length === 0) return response;
  return {
    ...response,
    sections: [
      ...response.sections,
      { heading: PRODUCT_NOTES_HEADING, body: missing.join(" ") },
    ],
  };
}

/**
 * A sentence that is only a generic "see your doctor" reminder (the fixed line covers it).
 * Conditional red-flag guidance ("If you have chest pain, …", "Seek urgent care …") is kept.
 */
const GENERIC_DOCTOR_SENTENCE =
  /^(?:please\s+)?(?:always\s+)?(?:talk|speak|check|consult)(?:\s+it\s+over)?\s+(?:with\s+|to\s+)?(?:your|a)\s+(?:doctor|clinician|healthcare (?:provider|professional)|medical professional)(?:\s+or\s+(?:a\s+)?medical professional)?(?:\s+(?:before (?:starting|buying|trying|taking)(?: any(?:thing)?)?(?: new)?(?: supplements?)?|first))?[.!]$/i;

/** Removes generic doctor reminders so the fixed DOCTOR_CONSULT_LINE appears once. */
export function withoutGenericDoctorLines(text: string): string {
  return text
    .split(/\n{2,}/)
    .map(para =>
      para
        .split("\n")
        .map(line => {
          const bullet = line.match(/^(\s*[-•*]\s+)(.*)$/);
          const body = bullet ? bullet[2] : line;
          const kept = body
            .split(/(?<=[.!?])\s+/)
            .filter(s => !GENERIC_DOCTOR_SENTENCE.test(s.trim()))
            .join(" ")
            .trim();
          return kept ? (bullet ? bullet[1] : "") + kept : "";
        })
        .filter(Boolean)
        .join("\n")
    )
    .filter(Boolean)
    .join("\n\n");
}
