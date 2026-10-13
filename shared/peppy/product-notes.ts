/**
 * Universal rule (Julia, 2026-10-13): every answer that suggests a product carries the
 * doctor-consult line and the dosing note, verbatim. The prompt asks for them; the server
 * appends whatever is missing (ensureProductNotes), so they cannot be dropped.
 */
import type { PeppyResponse } from "./types.js";
import { isPreorderProduct } from "../preorder.js";

export const DOCTOR_CONSULT_LINE = "Please talk with your doctor before starting.";

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
