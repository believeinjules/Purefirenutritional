/** Default "Questions for your doctor" (exact wording, Brand-approved). */
export const DOCTOR_QUESTIONS: readonly string[] = [
  "Is this appropriate with my current medications or conditions?",
  "Should I take this preventively or restoratively?",
  "How long should one cycle be for me?",
  "What labs, if any, should we check?",
];

/** Default questions minus any a page leaves out (exact text match). */
export function doctorQuestionsWithout(omit: readonly string[] = []): string[] {
  return DOCTOR_QUESTIONS.filter((q) => !omit.includes(q));
}
