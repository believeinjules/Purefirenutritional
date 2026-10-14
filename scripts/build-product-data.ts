/**
 * Builds shared/peppy/product-data.json (the one file Pepita reads) and the gap report.
 *   npx tsx scripts/build-product-data.ts [rdDataset.json] [gaps.csv]
 * Default RD dataset: data/pepita-product-dataset.json (drop RD's updated file there and re-run).
 * 1. Repo seed: ingredient names, pack sizes. NO dosing: catalog usage text is only an RD candidate.
 * 2. RD merge (when the file exists; source of truth, overrides the seed). A label schedule is verified when RD
 *    sourced it to a per-product manufacturer document and flagged no FREQUENCY CONFLICT. Conflicts resolved by
 *    Julia live in data/pepita-rd-resolutions.json and become the verified label.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { allProducts, products } from "../client/src/data/products";
import { PENDING_PRODUCT_IDS, isHiddenProduct } from "../shared/hidden-products";
import {
  PRODUCT_DATA_FIELDS,
  emptyRecord,
  parseSchedule,
  type DataField,
  type ProductDataFile,
  type ProductDataRecord,
} from "../shared/peppy/product-data";

const RD_PATH = process.argv[2] ?? "data/pepita-product-dataset.json";
const CSV = process.argv[3] ?? "/workspace/pepita-product-data-gaps.csv";
const OUT = "shared/peppy/product-data.json";

type Rd = Record<string, any>;
const rd: Rd[] = existsSync(RD_PATH) ? JSON.parse(readFileSync(RD_PATH, "utf8")) : [];
const rdBy = new Map(rd.map(r => [r.slug, r]));

const ok = (value: string, source: string): DataField => ({ status: "verified", value, source });
const cand = (candidate: string | null | undefined, source: string): DataField =>
  candidate ? { status: "unverified", value: null, candidate, source } : { status: "unverified", value: null };
const isVerifiedConf = (c?: string) => !!c && /^verified/i.test(c);
const isSourcedConf = (c?: string) => !!c && (/^verified/i.test(c) || c === "manufacturer-claim");

const RESOLUTION_PATH = "data/pepita-rd-resolutions.json";
/** Julia-decided labels: become the verified label and replace conflicting catalog text. */
const resolutions: Record<string, any> = existsSync(RESOLUTION_PATH) ? JSON.parse(readFileSync(RESOLUTION_PATH, "utf8")) : {};

/**
 * RD dataset is the source of truth: it overrides every repo-seeded field it fills.
 * Never used: Pure Fire page directions or its "Maintenance 20 caps / Intensive N60" labels (unsourced).
 */
export function mergeRecord(p: { id: string; name: string; ingredients?: string[]; usage?: string }, r?: Rd): ProductDataRecord {
  const out = emptyRecord(p.id, p.name);
  if (p.ingredients?.length) out.ingredients = ok(p.ingredients.join("; "), "client/src/data/products.ts ingredients");
  if (p.usage) out.labelDirections = cand(p.usage, "client/src/data/products.ts usage (Pure Fire page text, not a manufacturer source)");
  if (!r) return out;

  const web = (r.source_documents ?? []).filter((s: string) => /^https?:/.test(s) && !/purefirenutritional/.test(s));
  const src = (urls: string[]) => `RD ${r.verification_date ?? ""}: ${urls.join(" ; ")}`.trim();
  const SRC = src(web);
  out.sourceDocs = r.source_documents ?? [];
  out.verifiedOn = r.verification_date ?? null;

  if (r.formulation && isSourcedConf(r.label_directions_confidence ?? r.directions_confidence)) out.formulation = ok(r.formulation, SRC);
  if (r.ingredients_as_printed && isSourcedConf(r.ingredients_confidence)) out.ingredients = ok(r.ingredients_as_printed, SRC);
  if (r.quantities_as_printed && isSourcedConf(r.quantities_confidence)) out.quantities = ok(r.quantities_as_printed, SRC);
  if (r.pack_size_as_printed) out.sizes = ok(r.pack_size_as_printed, SRC);
  if (r.contraindications_warnings_as_printed && isSourcedConf(r.contraindications_confidence))
    out.contraindications = ok(resolutions[p.id]?.contraindications ?? r.contraindications_warnings_as_printed, SRC);
  if (r.sex_specific_notes && isSourcedConf(r.sex_specific_confidence)) out.sexSpecificNotes = ok(r.sex_specific_notes, SRC);
  if (r.research_study_regimens?.length && isSourcedConf(r.research_study_regimens_confidence))
    out.humanStudyDoses = ok(`Research-study regimen (not product directions): ${JSON.stringify(r.research_study_regimens)}`, SRC);
  if (r.manufacturer_protocols && isSourcedConf(r.manufacturer_protocols_confidence) && !/^No named/i.test(r.manufacturer_protocols))
    out.documentedProtocols = ok(r.manufacturer_protocols, SRC);
  else if (r.manufacturer_protocols) out.documentedProtocols = cand(r.manufacturer_protocols, `RD (${r.manufacturer_protocols_confidence})`);

  const entries: { source: string; text: string; language: string }[] = r.label_directions ?? [];
  const en = (r.label_directions_en_as_printed || entries.find(e => e.language === "en")?.text || "").trim();
  const freqConflict = (r.conflicts ?? []).some((c: string) => /^FREQUENCY CONFLICT/i.test(c));
  let labelResolved = false;
  const labelOk = isSourcedConf(r.label_directions_confidence) && r.schedule_type !== "unverified" && !!en && !freqConflict && entries.length > 0;
  const labelSrc = src(entries.map(e => e.source));

  if (labelOk) {
    out.labelDirections = ok(en, labelSrc);
    if (r.with_or_without_food) out.food = ok(r.with_or_without_food, labelSrc);
    if (r.course_duration) out.courseDuration = ok(r.course_duration, labelSrc);
    if (r.pack_20_vs_60_differences && isSourcedConf(r.pack_differences_confidence)) out.sizeDifferences = ok(r.pack_20_vs_60_differences, SRC);
    const s = parseSchedule(en);
    if (s) out.schedules.push({ protocolType: "label", format: null, ...s, text: en, source: labelSrc });
  } else if (en || entries.length) {
    out.labelDirections = cand(en || entries[0]?.text, `RD (${r.label_directions_confidence}${freqConflict ? "; FREQUENCY CONFLICT between manufacturer sources" : ""})`);
  }
  for (const reg of r.research_study_regimens ?? []) {
    const text = typeof reg === "string" ? reg : reg.regimen ?? reg.text ?? JSON.stringify(reg);
    const parsed = parseSchedule(String(text));
    if (parsed && isSourcedConf(r.research_study_regimens_confidence))
      out.schedules.push({ protocolType: "research-regimen", format: null, ...parsed, text: String(text), source: src([reg.source ?? reg.pmid ?? SRC].map(String)) });
  }

  const res = resolutions[p.id];
  if (res?.labelDirections && res.source) {
    const rsrc = src([res.source]) + ` (resolved by ${res.decidedBy ?? "Julia"} ${res.decidedOn ?? ""})`.replace(" )", ")");
    out.labelDirections = ok(res.labelDirections, rsrc);
    if (res.courseDuration) out.courseDuration = ok(res.courseDuration, rsrc);
    if (res.contraindications) out.contraindications = ok(res.contraindications, rsrc);
    out.food = { status: "unverified", value: null };
    out.schedules = out.schedules.filter(x => x.protocolType !== "label");
    const parsed = parseSchedule(res.labelDirections);
    if (parsed) out.schedules.unshift({ protocolType: "label", format: null, ...parsed, text: res.labelDirections, source: rsrc });
    labelResolved = true;
  }

  // Per-format packs. Same directions per format only when RD says so (or there's one pack).
  const packs = Array.from(String(r.pack_size_as_printed ?? "").matchAll(/(\d+)\s*(capsules|tablets|pcs)/gi));
  const sameDirections = packs.length <= 1 || /same directions/i.test(r.pack_20_vs_60_differences ?? "");
  for (const m of packs) {
    const units = Number(m[1]);
    const unit = m[2].toLowerCase() === "pcs" ? "pieces" : m[2].toLowerCase();
    if (out.formats.some(f => f.units === units)) continue;
    out.formats.push({
      format: `${units}-${unit.replace(/s$/, "")}`,
      units,
      directions: labelResolved ? ok(out.labelDirections.value!, out.labelDirections.source!) : labelOk && sameDirections ? ok(en, labelSrc) : { status: "unverified", value: null },
    });
  }
  out.formats.sort((a, b) => a.units - b.units);
  return out;
}

// Visible products plus drafted-but-pending ones (hidden from the store until launch data arrives).
const visible = [
  ...products.filter(p => !isHiddenProduct(p)),
  ...allProducts.filter(p => PENDING_PRODUCT_IDS.has(p.id)),
];
const records = visible.map(p => mergeRecord(p, rdBy.get(p.id)));
const file: ProductDataFile = {
  schemaVersion: 2,
  note: "Built by scripts/build-product-data.ts. Do not hand-edit: update data/pepita-product-dataset.json (Research Director) and re-run.",
  products: records,
};
writeFileSync(OUT, JSON.stringify(file, null, 2) + "\n");

const esc = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const rows = [["product_id", "product_name", "field", "status", "current_value", "candidate", "source"].join(",")];
for (const r of records) {
  for (const f of PRODUCT_DATA_FIELDS) rows.push([r.id, r.name, f, r[f].status, r[f].value, r[f].candidate, r[f].source].map(esc).join(","));
  rows.push([r.id, r.name, "labelSchedule", r.schedules.some(s => s.protocolType === "label") ? "verified" : "unverified", r.schedules.find(s => s.protocolType === "label")?.text, "", ""].map(esc).join(","));
  for (const fm of r.formats) rows.push([r.id, r.name, `directions[${fm.format}]`, fm.directions.status, fm.directions.value, "", fm.directions.source].map(esc).join(","));
}
writeFileSync(CSV, rows.join("\n") + "\n");
const v = records.filter(r => r.schedules.some(s => s.protocolType === "label"));
console.log(`products=${records.length} rd=${rd.length} verifiedSchedules=${v.length}: ${v.map(r => r.id).join(", ")}`);
