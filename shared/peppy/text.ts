/** Small text helpers shared by the Pepita engine, validator and UI. */

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

/** Stand-in for a period inside an abbreviation while sentences are split. */
const ABBR_DOT = "\u0001";
/**
 * Periods that don't end a sentence: citations ("p. 103", "pp. 12-14", "No. 5"),
 * "e.g.", "i.e.", "vs.", "approx.", "et al.", titles and the like. "p.", "pp." and
 * "No." only count before a number, so "The answer is no." still ends a sentence.
 */
const ABBREVIATIONS: RegExp[] = [
  /\b(?:pp?|No|nos?|Nos|vol|Vol|fig|Fig|figs|Figs|ch|Ch)\.(?=\s*\d)/g,
  /\b(?:e\.g|i\.e)\./gi,
  /\bet al\./gi,
  /\b(?:vs|approx|ca|cf|Dr|Prof|St|Mr|Mrs|Ms|Inc|Ltd|Jr|Sr)\.(?=\s)/g,
];

/** Hides abbreviation periods so a sentence split can't break on them. */
export function protectAbbreviations(text: string): string {
  let t = text;
  for (const re of ABBREVIATIONS) t = t.replace(re, m => m.replace(/\./g, ABBR_DOT));
  return t;
}
export function restoreAbbreviations(text: string): string {
  return text.split(ABBR_DOT).join(".");
}

/** Sentences of one line, split on whitespace after . ! ? (abbreviations kept whole). */
export function sentenceChunks(text: string): string[] {
  return protectAbbreviations(text)
    .split(/(?<=[.!?])\s+/)
    .map(restoreAbbreviations);
}

/** Split prose into sentences (keeps the terminal punctuation; abbreviations kept whole). */
export function splitSentences(text: string): string[] {
  return (
    protectAbbreviations(text)
      .match(/[^.!?\n]+(?:[.!?]+|$)/g)
      ?.map(s => restoreAbbreviations(s).trim())
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

/** Hosts that may appear in prose only as a plain-text name, never as a URL (Julia: TSP is named, never linked). */
const PLAIN_NAME_HOSTS = /^(?:www\.)?(theshortpeptide\.com|appliedlongevityinsights\.com)$/i;
/** Never mentioned at all on Pure Fire, not even as text (Julia, 2026-11-12). */
const BANNED_MENTION = /peptid\.ru|\bref=\d|referral link/i;

/**
 * Model prose → plain text with no outbound links: markdown links keep their text, bare URLs are
 * removed (TSP keeps its plain-text domain name), and any sentence naming the supplier's
 * website or a referral link is dropped.
 */
export function withoutLinks(text: string): string {
  if (!text) return text;
  let t = text.replace(/\[([^\]]+)\]\((?:[^)\s]+)\)/g, "$1");
  t = t.replace(/\b(?:https?:\/\/|www\.)[^\s)\]]+/gi, raw => {
    const host = raw.replace(/^https?:\/\//i, "").split(/[/?#]/)[0].replace(/[.,;:]+$/, "");
    const m = host.match(PLAIN_NAME_HOSTS);
    return m ? m[1].toLowerCase() : "";
  });
  if (BANNED_MENTION.test(t)) t = splitSentences(t).filter(x => !BANNED_MENTION.test(x)).join(" ");
  return t.replace(/\(\s*\)/g, "").replace(/[ \t]{2,}/g, " ").replace(/\s+([.,;:])/g, "$1").trim();
}
