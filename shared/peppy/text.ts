/** Small text helpers shared by the Peppy engine, validator and UI. */

const KEEP_CASE_WORDS = new Set([
  "Khavinson",
  "Epitalon",
  "Epithalamin",
  "Thymalin",
  "Pure",
  "Fire",
  "Revilab",
  "Prime",
  "Omega-3",
]);

/**
 * Prepare a catalog phrase (e.g. a benefit line) for use mid-sentence.
 * Lower-cases the first letter ONLY when the first word is an ordinary word —
 * acronyms ("CNS function"), single-letter prefixes ("T-cell"), words with
 * digits ("B12") and proper nouns keep their case. Fixes "listed for cNS function".
 */
export function toInlinePhrase(text: string): string {
  const trimmed = text.trim().replace(/[.;:,]+$/, "");
  if (!trimmed) return trimmed;
  const firstWord = trimmed.split(/[\s,(/]/)[0] ?? "";
  const upperCount = (firstWord.match(/[A-Z]/g) ?? []).length;
  const keep =
    upperCount >= 2 || // CNS, DNA, AMD, CoQ10
    /^[A-Z]-/.test(firstWord) || // T-cell, B-cell
    /\d/.test(firstWord) || // B12, 5-HTP
    KEEP_CASE_WORDS.has(firstWord.replace(/[^A-Za-z0-9-]/g, ""));
  if (keep) return trimmed;
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

/** Upper-case the first letter (for sentence starts). */
export function capitalizeFirst(text: string): string {
  const t = text.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

/** Collapse whitespace and cap length on a word boundary. */
export function clampText(text: string, max: number): string {
  const t = String(text ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

/** Split prose into sentences (keeps the terminal punctuation). */
export function splitSentences(text: string): string[] {
  return (
    text
      .match(/[^.!?\n]+(?:[.!?]+|$)/g)
      ?.map(s => s.trim())
      .filter(Boolean) ?? []
  );
}

export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
