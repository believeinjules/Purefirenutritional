/**
 * Verified per-product data layer for Pepita (schema v2). Pepita reads ONE file,
 * product-data.json, built by scripts/build-product-data.ts from:
 *   1. a repo seed with NO dosing (catalog usage text is kept only as an RD `candidate`), and
 *   2. the Research Director's dataset (data/pepita-product-dataset.json), merged when present.
 *
 * RULES
 *  - A field is used only when status === "verified" with a per-product source.
 *  - No generic or template schedule anywhere: shared strings (e.g. one Cytomax line reused for
 *    every product) never become "verified". A schedule needs RD verification for that product.
 *  - Protocol types stay separate: label / manufacturer-protocol / research-regimen.
 *  - Package duration is arithmetic from a verified schedule. Nothing else is derived,
 *    extrapolated between products, or adjusted by age/sex/goal.
 */
import DATA from "./product-data.json";

export type FieldStatus = "verified" | "unverified";
export interface DataField {
  status: FieldStatus;
  value: string | null;
  /** Text RD should check (repo catalog, manufacturer claim). Never shown to users. */
  candidate?: string | null;
  source?: string | null;
}

export type ProtocolType = "label" | "manufacturer-protocol" | "research-regimen";
export type Range = [number, number];
export interface Schedule {
  protocolType: ProtocolType;
  /** Pack format this applies to ("20 capsules", "60 capsules"), or null for all formats. */
  format: string | null;
  unit: string;
  unitsPerDose: Range;
  /** Doses on a dosing day. */
  dosesPerDay: Range;
  /** 1 = every day; 3 = once every third day (intermittent). */
  everyNDays: number;
  /** On/off cycling, e.g. 15 days on then a break of at least 10 days (Revifort). */
  cycle?: { onDays: number; offDays: number } | null;
  text: string;
  source: string;
}
export interface PackFormat {
  format: string;
  units: number;
  directions: DataField;
}

export const PRODUCT_DATA_FIELDS = [
  "ingredients",
  "quantities",
  "formulation",
  "labelDirections",
  "food",
  "courseDuration",
  "sizes",
  "sizeDifferences",
  "documentedProtocols",
  "sexSpecificNotes",
  "humanStudyDoses",
  "contraindications",
  "warnings",
] as const;
export type ProductDataFieldName = (typeof PRODUCT_DATA_FIELDS)[number];

export type ProductDataRecord = {
  id: string;
  name: string;
  sourceDocs: string[];
  verifiedOn: string | null;
  productVersion: string | null;
  formats: PackFormat[];
  schedules: Schedule[];
} & Record<ProductDataFieldName, DataField>;
export interface ProductDataFile { schemaVersion: number; note?: string; products: ProductDataRecord[] }

export function emptyRecord(id: string, name: string): ProductDataRecord {
  const r = { id, name, sourceDocs: [], verifiedOn: null, productVersion: null, formats: [], schedules: [] } as unknown as ProductDataRecord;
  for (const f of PRODUCT_DATA_FIELDS) (r as any)[f] = { status: "unverified", value: null };
  return r;
}

// ---------- schedule parsing + duration math (pure, tested) ----------

const WORD: Record<string, number> = { once: 1, one: 1, twice: 2, two: 2, three: 3, four: 4, other: 2, second: 2, third: 3, fourth: 4, fifth: 5 };
const num = (s: string) => (/^\d+$/.test(s) ? Number(s) : WORD[s.toLowerCase()] ?? NaN);

/** Parse printed directions ("1 or 2 capsules 2 times a day", "1 capsule once every 3 days"). Null if unclear. */
export function parseSchedule(text: string): Pick<Schedule, "unit" | "unitsPerDose" | "dosesPerDay" | "everyNDays" | "cycle"> | null {
  const t = text.toLowerCase().replace(/–/g, "-");
  const u = t.match(/(\d+)(?:\s*(?:or|-|to)\s*(\d+))?\s*(capsules?|tablets?|truffles?)\b/);
  if (!u) return null;
  const unitsPerDose: Range = [Number(u[1]), Number(u[2] ?? u[1])];
  const unit = u[3].replace(/s$/, "");
  const every = t.match(/every\s+(\d+|other|second|third|fourth|fifth)(?:st|nd|rd|th)?\s+days?/);
  const everyNDays = every ? num(every[1]) : 1;
  const per: number[] = [];
  for (const m of Array.from(t.matchAll(/\b(once|twice|\d+|two|three|four)(?:\s*(?:or|-|to)\s*(\d+|two|three|four))?\s*(?:times?\s*)?(?:a|per)\s+day\b|\b(once|twice)\s+daily\b|\b(\d+)(?:\s*(?:-|to)\s*(\d+))?\s+times\s+daily\b/g))) {
    if (m[1]) { per.push(num(m[1])); if (m[2]) per.push(num(m[2])); }
    else if (m[3]) per.push(num(m[3]));
    else if (m[4]) { per.push(Number(m[4])); if (m[5]) per.push(Number(m[5])); }
  }
  // "3 capsules a day" = one daily amount; "every 3rd day" = one dose on that day.
  if (!per.length && (every || /\b(?:a|per) day\b|\bdaily\b/.test(t))) per.push(1);
  if (!per.length || per.some(Number.isNaN) || Number.isNaN(everyNDays)) return null;
  // "a day" right after the unit means the units are the DAILY total, so 1 dose/day.
  const cyc = t.match(/for (\d+) days\b.*?break (?:of|for) (?:at least )?(\d+) days/);
  const cycle = cyc ? { onDays: Number(cyc[1]), offDays: Number(cyc[2]) } : null;
  return { unit, unitsPerDose, dosesPerDay: [Math.min(...per), Math.max(...per)], everyNDays, ...(cycle ? { cycle } : {}) };
}

/** How many days a pack lasts on a schedule: [shortest, longest], whole days. Handles every-N-day dosing. */
export function packageDurationDays(units: number, s: Pick<Schedule, "unitsPerDose" | "dosesPerDay" | "everyNDays" | "cycle">): Range {
  const most = s.unitsPerDose[1] * s.dosesPerDay[1];
  const least = s.unitsPerDose[0] * s.dosesPerDay[0];
  // Dosing days available × spacing between dosing days, plus any minimum breaks between on-cycles.
  const days = (perDosingDay: number) => {
    const dosingDays = Math.floor(units / perDosingDay);
    const span = dosingDays * s.everyNDays;
    const breaks = s.cycle && dosingDays > 0 ? Math.floor((dosingDays - 1) / s.cycle.onDays) * s.cycle.offDays : 0;
    return span + breaks;
  };
  return [days(most), days(least)];
}

const fmtRange = ([a, b]: Range) => (a === b ? `${a}` : `${a}–${b}`);

// ---------- lookups ----------

const FILE = DATA as unknown as ProductDataFile;
const BY_ID = new Map(FILE.products.map(p => [p.id, p]));

export function getProductData(id: string): ProductDataRecord | undefined {
  return BY_ID.get(id);
}

export function verified(id: string, field: ProductDataFieldName): string | null {
  const f = BY_ID.get(id)?.[field];
  return f && f.status === "verified" && f.source && f.value && f.value.trim() ? f.value.trim() : null;
}

/** Schedules we may state: only ones with a per-product source. */
export function verifiedSchedules(id: string, type?: ProtocolType): Schedule[] {
  return (BY_ID.get(id)?.schedules ?? []).filter(s => s.source && (!type || s.protocolType === type));
}

export function verifiedFacts(id: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of PRODUCT_DATA_FIELDS) {
    const v = verified(id, f);
    if (v) out[f] = v;
  }
  const sch = verifiedSchedules(id);
  if (sch.length) out.schedules = sch.map(s => ({ ...s, packDurations: packDurations(id, s) }));
  return out;
}

function packDurations(id: string, s: Schedule): { format: string; days: string }[] {
  return (BY_ID.get(id)?.formats ?? [])
    .filter(f => f.directions.status === "verified" && (!s.format || s.format === f.format))
    .map(f => ({ format: f.format, days: fmtRange(packageDurationDays(f.units, s)) }));
}

/** Say "Adults" rather than "Adults over 14" / "adults and children older 14 years" (Julia, 2026-10-13). */
export function plainAudience(label: string): string {
  return label
    .replace(/\badults(?:\s+and\s+children)?\s+(?:over|older(?:\s+than)?|from)\s+14(?:\s+years)?(?:\s+old)?\b/gi, "adults")
    .replace(/^adults by /i, "adults take ")
    .replace(/^adults\b/, "Adults");
}

const end = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);

/** Short dosing answer: exact verified numbers, or a plain "not verified yet". */
export function dosingAnswer(id: string, name: string, packUnits?: number | null): { text: string; verified: boolean } {
  const label = verified(id, "labelDirections");
  const sched = verifiedSchedules(id, "label")[0];
  if (!label) {
    return {
      verified: false,
      text: `I can't give you a schedule for ${name} yet, because its label directions haven't been verified for our site, and schedules really do differ between products (some aren't taken every day). Please follow the package insert that came with yours, and check it with your doctor.`,
    };
  }
  const parts = [`The manufacturer's directions for ${name}: ${end(plainAudience(label))}`];
  // Endoluten (Pepita-only override): the course length, not pack arithmetic, is the guide.
  const all = sched && id !== "endoluten" ? packDurations(id, sched) : [];
  const mine = all.filter(p => packUnits && p.format.startsWith(`${packUnits}-`));
  const packs = mine.length ? mine : all;
  if (packs.length)
    parts.push(`At that schedule ${packs.map(p => `${mine.length ? "your" : "a"} ${p.format} pack lasts about ${p.days} days`).join(" and ")}.`);
  const proto = verifiedSchedules(id, "manufacturer-protocol")[0];
  if (proto) parts.push(`The manufacturer also documents a separate protocol: ${end(proto.text)}`);
  const sex = verified(id, "sexSpecificNotes");
  if (sex) parts.push(end(sex));
  parts.push("That's manufacturer guidance, not results from clinical trials of this product.");
  return { verified: true, text: parts.join(" ") };
}

/** Products whose verified (or voiced) schedule is not plain daily dosing: data-driven examples. */
export function nonDailyExamples(): { id: string; name: string; kind: string }[] {
  const out: { id: string; name: string; kind: string }[] = [];
  for (const p of FILE.products) {
    const s = verifiedSchedules(p.id, "label")[0];
    if (s?.cycle) out.push({ id: p.id, name: p.name, kind: `runs in ${s.cycle.onDays}-day blocks with a break of at least ${s.cycle.offDays} days` });
    else if (s && s.everyNDays > 1) out.push({ id: p.id, name: p.name, kind: `is taken once every ${s.everyNDays} days` });
  }
  return out;
}

export function productDataSummary() {
  return {
    products: FILE.products.length,
    verifiedLabelDirections: FILE.products.filter(p => dosingAnswer(p.id, p.name).verified).length,
  };
}
