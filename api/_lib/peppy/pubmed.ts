/**
 * Live PubMed retrieval via NCBI E-utilities (esearch → esummary → efetch abstracts).
 * - Prefers systematic reviews / meta-analyses / RCTs, broadens to human studies if too few.
 * - Titles are kept verbatim (HTML tags/entities decoded only); retracted papers skipped.
 * - The one-line finding is the abstract's own CONCLUSION(S) section (quoted, not paraphrased);
 *   without a labelled conclusion it says plainly that Peppy hasn't summarised the paper.
 * - Every request has a hard timeout; failures resolve to [] so answers never break.
 * - In-memory cache per warm function instance (6 h), bounded size.
 * Optional env: NCBI_API_KEY (raises NCBI's limit from 3 to 10 req/s), NCBI_EMAIL.
 */
import type { ResearchSource, StudyType } from "../../../shared/peppy/types.js";
import { BANNED_TERMS as BANNED } from "../../../shared/peppy/claims.js";

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_MAX = 200;
const cache = new Map<string, { at: number; data: ResearchSource[] }>();

export const PUBMED_TIMEOUT_MS = 2000;
/** Skip the broadening search if the first one already took this long. */
const BROADEN_BUDGET_MS = 1500;

// NCBI allows 3 requests/s without an API key (10/s with one). Space request starts per
// instance so bursts don't get HTTP 429s; the wait happens before each request's timeout starts.
let nextSlot = 0;
async function ncbiSlot(): Promise<void> {
  const gap = process.env.NCBI_API_KEY ? 110 : 350;
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + gap;
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
}

function commonParams(): string {
  const p = new URLSearchParams({ tool: "purefire-peppy" });
  if (process.env.NCBI_EMAIL) p.set("email", process.env.NCBI_EMAIL);
  if (process.env.NCBI_API_KEY) p.set("api_key", process.env.NCBI_API_KEY);
  return p.toString();
}

type FetchLike = (
  url: string,
  init?: { signal?: AbortSignal }
) => Promise<{
  ok: boolean;
  json(): Promise<unknown>;
  text?: () => Promise<string>;
}>;

async function getJson(
  url: string,
  fetchImpl: FetchLike,
  timeoutMs: number
): Promise<unknown | null> {
  await ncbiSlot();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function getText(
  url: string,
  fetchImpl: FetchLike,
  timeoutMs: number
): Promise<string | null> {
  await ncbiSlot();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal });
    if (!res.ok || typeof res.text !== "function") return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
  nbsp: " ",
};

export function cleanTitle(raw: string): string {
  // esummary encodes inline markup (&lt;i&gt;): decode entities first, then drop tags.
  return raw
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, code: string) => {
      const c = code.toLowerCase();
      if (ENTITIES[c]) return ENTITIES[c];
      if (c.startsWith("#x"))
        return String.fromCodePoint(parseInt(c.slice(2), 16));
      if (c.startsWith("#"))
        return String.fromCodePoint(parseInt(c.slice(1), 10));
      return m;
    })
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function studyTypeFromPubTypes(pubtypes: readonly string[]): StudyType {
  const t = pubtypes.map(p => p.toLowerCase());
  if (t.some(p => p === "meta-analysis" || p === "systematic review"))
    return "systematic-review";
  if (t.includes("randomized controlled trial")) return "rct";
  if (
    t.some(
      p => p.startsWith("clinical trial") || p === "controlled clinical trial"
    )
  )
    return "clinical";
  if (t.includes("observational study")) return "observational";
  if (t.some(p => p === "review" || p === "scoping review")) return "review";
  return "other";
}

const LIMIT_BY_TYPE: Record<StudyType, string> = {
  "systematic-review":
    "Pooled analysis; quality depends on the included trials, which may differ from your situation.",
  rct: "Single randomised trial; results may not generalise beyond its participants.",
  clinical:
    "Clinical study without the strongest controls; treat results as preliminary.",
  observational: "Observational: shows association, not cause and effect.",
  review:
    "Narrative review; summarises other studies rather than testing anything new.",
  animal: "Animal study; may not apply to people.",
  "in-vitro": "Lab study; no effect in people was measured.",
  guidance: "General guidance.",
  other: "Study design not classified; check the abstract.",
};

const TYPE_LABEL: Record<StudyType, string> = {
  "systematic-review": "a systematic review / meta-analysis",
  rct: "a randomised controlled trial",
  clinical: "a clinical trial",
  observational: "an observational study",
  review: "a review",
  animal: "an animal study",
  "in-vitro": "a lab study",
  guidance: "guidance",
  other: "a study",
};

/** Parse an esummary JSON payload into source cards (verbatim titles, honest generic finding). */
export function parseEsummary(payload: unknown): ResearchSource[] {
  const result = (payload as { result?: Record<string, unknown> } | null)
    ?.result;
  if (!result || typeof result !== "object") return [];
  const uids = Array.isArray(result.uids)
    ? (result.uids as unknown[]).map(String)
    : [];
  const out: ResearchSource[] = [];
  for (const uid of uids) {
    if (!/^\d{1,9}$/.test(uid)) continue;
    const doc = result[uid] as Record<string, unknown> | undefined;
    if (!doc || typeof doc !== "object" || doc.error) continue;
    const title = cleanTitle(String(doc.title ?? ""));
    if (!title) continue;
    const pubtypes = Array.isArray(doc.pubtype)
      ? (doc.pubtype as unknown[]).map(String)
      : [];
    if (pubtypes.some(p => /retract/i.test(p)) || /^retracted/i.test(title))
      continue;
    const studyType = studyTypeFromPubTypes(pubtypes);
    const authorsArr = Array.isArray(doc.authors)
      ? (doc.authors as { name?: unknown }[])
          .map(a => String(a?.name ?? ""))
          .filter(Boolean)
      : [];
    const authors = authorsArr.length
      ? authorsArr.length > 3
        ? `${authorsArr.slice(0, 3).join(", ")}, et al.`
        : authorsArr.join(", ")
      : undefined;
    const year = String(doc.pubdate ?? doc.epubdate ?? "").match(
      /\b(19|20)\d{2}\b/
    )?.[0];
    const ids = Array.isArray(doc.articleids)
      ? (doc.articleids as { idtype?: unknown; value?: unknown }[])
      : [];
    const doi = ids.find(a => a?.idtype === "doi")?.value;
    out.push({
      id: `pmid:${uid}`,
      kind: "pubmed",
      title,
      authors,
      journal: String(doc.fulljournalname ?? doc.source ?? "") || undefined,
      year,
      pmid: uid,
      doi: typeof doi === "string" ? doi : undefined,
      url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
      studyType,
      finding: `Indexed on PubMed as ${TYPE_LABEL[studyType]}${year ? ` (${year})` : ""}. Peppy hasn't summarised this paper — open the abstract for its findings.`,
      limitation: LIMIT_BY_TYPE[studyType],
      origin: "pubmed-live",
    });
  }
  return out;
}

/**
 * Per PMID, the abstract's own concluding text from efetch XML (rettype=abstract, retmode=xml):
 * a section labelled CONCLUSION(S)/INTERPRETATION when present ("conclusion"), otherwise the
 * abstract's final sentence ("closing"). Always quoted — never Peppy's paraphrase.
 */
export function parseEfetchConclusions(
  xml: string
): Map<string, { kind: "conclusion" | "closing"; text: string }> {
  const out = new Map<
    string,
    { kind: "conclusion" | "closing"; text: string }
  >();
  if (typeof xml !== "string") return out;
  for (const article of xml.split(/<PubmedArticle[\s>]/).slice(1)) {
    const pmid = article.match(/<PMID[^>]*>(\d{1,9})<\/PMID>/)?.[1];
    if (!pmid) continue;
    const re = /<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g;
    let m: RegExpExecArray | null;
    let conclusion = "";
    let last = "";
    while ((m = re.exec(article)) !== null) {
      const attrs = m[1];
      const label = attrs.match(/Label="([^"]*)"/i)?.[1] ?? "";
      const category = attrs.match(/NlmCategory="([^"]*)"/i)?.[1] ?? "";
      const text = cleanTitle(m[2]);
      if (!text) continue;
      last = text;
      if (
        /conclusion|interpretation/i.test(label) ||
        /^CONCLUSIONS$/i.test(category)
      )
        conclusion = text;
    }
    if (conclusion) out.set(pmid, { kind: "conclusion", text: conclusion });
    else if (last) {
      const sentences = last.split(/(?<=[.!?])\s+(?=[A-Z])/);
      const closing = sentences[sentences.length - 1]?.trim() ?? "";
      if (closing.length >= 40)
        out.set(pmid, { kind: "closing", text: closing });
    }
  }
  return out;
}

function quoteConclusion(c: {
  kind: "conclusion" | "closing";
  text: string;
}): string | null {
  if (BANNED.test(c.text)) return null;
  let t = c.text;
  if (t.length > 280) {
    const cut = t.slice(0, 280);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
    t =
      end > 120
        ? cut.slice(0, end + 1)
        : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
  }
  return c.kind === "conclusion"
    ? `Authors' conclusion: "${t}"`
    : `From the abstract: "${t}"`;
}

export function parseEsearchIds(payload: unknown): string[] {
  const list = (payload as { esearchresult?: { idlist?: unknown } } | null)
    ?.esearchresult?.idlist;
  return Array.isArray(list)
    ? list.map(String).filter(id => /^\d{1,9}$/.test(id))
    : [];
}

const HIGH_EVIDENCE =
  "(meta-analysis[pt] OR systematic review[pt] OR randomized controlled trial[pt])";

export async function searchPubmed(
  query: string,
  opts: { fetchImpl?: FetchLike; timeoutMs?: number; max?: number } = {}
): Promise<ResearchSource[]> {
  const q = query.trim().slice(0, 300);
  if (!q) return [];
  const max = opts.max ?? 4;
  const key = `${q}|${max}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  const fetchImpl =
    opts.fetchImpl ?? (globalThis.fetch as unknown as FetchLike);
  const timeoutMs = opts.timeoutMs ?? PUBMED_TIMEOUT_MS;
  const params = commonParams();
  const esearch = (term: string) =>
    `${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&sort=relevance&retmax=${max}&term=${encodeURIComponent(term)}&${params}`;

  const started = Date.now();
  let ids = parseEsearchIds(
    await getJson(
      esearch(`(${q}) AND ${HIGH_EVIDENCE} AND humans[mh]`),
      fetchImpl,
      timeoutMs
    )
  );
  if (ids.length < 2 && Date.now() - started < BROADEN_BUDGET_MS) {
    const broader = parseEsearchIds(
      await getJson(esearch(`(${q}) AND humans[mh]`), fetchImpl, timeoutMs)
    );
    ids = Array.from(new Set([...ids, ...broader])).slice(0, max);
  }
  if (!ids.length) return [];
  const idList = ids.join(",");
  const [summary, abstracts] = await Promise.all([
    getJson(
      `${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${idList}&${params}`,
      fetchImpl,
      timeoutMs
    ),
    getText(
      `${EUTILS}/efetch.fcgi?db=pubmed&rettype=abstract&retmode=xml&id=${idList}&${params}`,
      fetchImpl,
      timeoutMs
    ),
  ]);
  const conclusions = abstracts
    ? parseEfetchConclusions(abstracts)
    : new Map<string, { kind: "conclusion" | "closing"; text: string }>();
  const data = parseEsummary(summary).map(src => {
    const quoted =
      src.pmid && conclusions.has(src.pmid)
        ? quoteConclusion(conclusions.get(src.pmid)!)
        : null;
    return quoted ? { ...src, finding: quoted } : src;
  });
  if (data.length) {
    if (cache.size >= CACHE_MAX)
      cache.delete(cache.keys().next().value as string);
    cache.set(key, { at: Date.now(), data });
  }
  return data;
}

/** Test hook. */
export function clearPubmedCache(): void {
  cache.clear();
  nextSlot = 0;
}
