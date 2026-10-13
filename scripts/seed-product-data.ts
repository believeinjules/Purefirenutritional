/**
 * Seeds shared/peppy/product-data.json (the single file the Research Director fills in)
 * and writes the gap report CSV. Seeds ONLY what is already in the repo:
 *  - label directions + course: shared/peppy/manufacturer-guide.ts (Julia/Regulatory-reviewed label text)
 *  - ingredient names: client/src/data/products.ts
 *  - 20 vs 60 sizes: product variants
 * Everything else is left empty with status "unverified". products.ts `usage` text that was NOT
 * in the reviewed guide is kept as `candidate` for RD to check; Pepita never reads candidates.
 * Usage: npx tsx scripts/seed-product-data.ts [gapCsvPath]
 * Re-running keeps any field RD already marked verified.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { products } from "../client/src/data/products";
import { MANUFACTURER_GUIDE_BY_ID } from "../shared/peppy/manufacturer-guide";
import { PRODUCT_DATA_FIELDS, emptyRecord, type ProductDataFile, type ProductDataRecord } from "../shared/peppy/product-data";

const OUT = "shared/peppy/product-data.json";
const CSV = process.argv[2] ?? "/workspace/pepita-product-data-gaps.csv";
const GUIDE_SRC = "shared/peppy/manufacturer-guide.ts (label/site usage text, Regulatory-reviewed)";
const prev: ProductDataFile | null = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : null;

const v = (value: string, source: string) => ({ status: "verified" as const, value, source });
const lit = (text: string, re: RegExp) => text.match(re)?.[0] ?? null;

const records: ProductDataRecord[] = products.map(p => {
  const r = emptyRecord(p.id, p.name);
  const g = MANUFACTURER_GUIDE_BY_ID.get(p.id);
  if (p.ingredients?.length) r.ingredients = v(p.ingredients.join("; "), "client/src/data/products.ts ingredients");
  const sizes = (p.variants ?? []).map(x => x.name).filter(n => /\d+\s*(capsules|caps|tablets)/i.test(n));
  if (sizes.length) r.sizes = v(sizes.join(" / "), "client/src/data/products.ts variants");
  if (g) {
    const d = g.directions;
    r.labelDirections = v(d, GUIDE_SRC);
    const freq = lit(d, /\d+(?:–\d+)? (?:capsules?|tablets?) (?:\d+(?:–\d+)? times|once|twice|daily)[^.]*?(?=(?: with| during| in the| on an|\.))/i);
    if (freq) r.frequency = v(freq, GUIDE_SRC);
    const timing = lit(d, /in the morning/i);
    if (timing) r.timing = v(timing, GUIDE_SRC);
    const food = lit(d, /with meals|during meals|on an empty stomach/i);
    if (food) r.food = v(food, GUIDE_SRC);
    if (g.course) r.courseDuration = v(g.course, GUIDE_SRC);
    const maint = lit(d, /Maintenance:[^.]*(?:\([^)]*\))?\.?/);
    if (maint) r.maintenanceProtocol = v(maint.replace(/\.$/, ""), GUIDE_SRC);
  }
  if (!g && p.usage) r.labelDirections = { status: "unverified", value: null, candidate: p.usage, source: "client/src/data/products.ts usage (not in reviewed guide)" };
  const intensive = p.usage && lit(p.usage, /Intensive:[^.]*(?:\([^)]*\))?\.?/);
  if (intensive) r.intensiveProtocol = { status: "unverified", value: null, candidate: intensive, source: "client/src/data/products.ts usage" };
  // Keep anything RD already verified.
  const old = prev?.products.find(x => x.id === p.id);
  if (old) for (const f of PRODUCT_DATA_FIELDS) if (old[f]?.status === "verified" && old[f].source?.startsWith("RD")) (r as any)[f] = old[f];
  if (old?.verifiedOn) r.verifiedOn = old.verifiedOn;
  if (old?.productVersion) r.productVersion = old.productVersion;
  if (old?.sourceDocs?.length) r.sourceDocs = old.sourceDocs;
  return r;
});

const file: ProductDataFile = {
  schemaVersion: 1,
  note: "Single source for Pepita's product facts. Research Director: fill value + source, set status 'verified' (source starting 'RD:'), and set verifiedOn/productVersion. Pepita only uses fields with status 'verified'; 'candidate' text is never shown.",
  products: records,
};
writeFileSync(OUT, JSON.stringify(file, null, 2) + "\n");

const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
const rows = [["product_id", "product_name", "field", "status", "current_value", "candidate_from_repo", "source"].join(",")];
for (const r of records) for (const f of PRODUCT_DATA_FIELDS) {
  const x = r[f];
  rows.push([r.id, r.name, f, x.status, x.value ?? "", x.candidate ?? "", x.source ?? ""].map(String).map(esc).join(","));
}
writeFileSync(CSV, rows.join("\n") + "\n");
const verifiedLabel = records.filter(r => r.labelDirections.status === "verified").length;
console.log(`products=${records.length} verifiedLabelDirections=${verifiedLabel} csv=${CSV}`);
