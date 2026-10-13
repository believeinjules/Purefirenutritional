/**
 * Verified per-product data layer for Pepita. Loads from ONE file, product-data.json, which
 * the Research Director fills in (seed: scripts/seed-product-data.ts, from repo sources only).
 *
 * RULES: Pepita uses a field only when status === "verified" and value is non-empty.
 * Unverified fields are reported as "not verified yet"; `candidate` text is never shown.
 * No dose is ever derived, extrapolated between products, or adjusted by age/sex/goal.
 */
import DATA from "./product-data.json";

export type FieldStatus = "verified" | "unverified";
export interface DataField {
  status: FieldStatus;
  value: string | null;
  /** Repo text RD should check; never shown to users. */
  candidate?: string | null;
  /** Where the value came from (file path, label scan, "RD: …"). */
  source?: string | null;
}

export const PRODUCT_DATA_FIELDS = [
  "ingredients",
  "quantities",
  "formulation",
  "labelDirections",
  "frequency",
  "timing",
  "food",
  "courseDuration",
  "sizes",
  "sizeDifferences",
  "maintenanceProtocol",
  "intensiveProtocol",
  "sexSpecificNotes",
  "humanStudyDoses",
  "contraindications",
  "warnings",
  "limitations",
] as const;
export type ProductDataFieldName = (typeof PRODUCT_DATA_FIELDS)[number];

export type ProductDataRecord = { id: string; name: string; sourceDocs: string[]; verifiedOn: string | null; productVersion: string | null } & Record<ProductDataFieldName, DataField>;
export interface ProductDataFile { schemaVersion: number; note?: string; products: ProductDataRecord[] }

export function emptyRecord(id: string, name: string): ProductDataRecord {
  const r = { id, name, sourceDocs: [], verifiedOn: null, productVersion: null } as unknown as ProductDataRecord;
  for (const f of PRODUCT_DATA_FIELDS) (r as any)[f] = { status: "unverified", value: null };
  return r;
}

const FILE = DATA as unknown as ProductDataFile;
const BY_ID = new Map(FILE.products.map(p => [p.id, p]));

export function getProductData(id: string): ProductDataRecord | undefined {
  return BY_ID.get(id);
}

/** The value of a field ONLY if verified; otherwise null. The one gate every caller uses. */
export function verified(id: string, field: ProductDataFieldName): string | null {
  const f = BY_ID.get(id)?.[field];
  return f && f.status === "verified" && f.value && f.value.trim() ? f.value.trim() : null;
}

/** Every verified value for a product (used for the "no invented doses" check and the LLM context). */
export function verifiedFacts(id: string): Partial<Record<ProductDataFieldName, string>> {
  const out: Partial<Record<ProductDataFieldName, string>> = {};
  for (const f of PRODUCT_DATA_FIELDS) {
    const val = verified(id, f);
    if (val) out[f] = val;
  }
  return out;
}

const end = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);

/**
 * 2–4 sentence dosing answer. Exact verified manufacturer numbers when we have them; a plain
 * "not verified yet" otherwise. Always labelled as manufacturer guidance, not clinical evidence.
 */
export function dosingAnswer(id: string, name: string): { text: string; verified: boolean } {
  const label = verified(id, "labelDirections");
  if (!label) {
    return {
      verified: false,
      text: `I don't have verified label directions for ${name} yet, so I won't guess at an amount. Please follow the package insert that comes with it and check the amount with your doctor.`,
    };
  }
  const parts = [`The manufacturer's label for ${name} says: ${end(label)}`];
  const course = verified(id, "courseDuration");
  if (course && !label.toLowerCase().includes(course.toLowerCase().split(";")[0])) parts.push(`Course: ${end(course)}`);
  const intensive = verified(id, "intensiveProtocol");
  if (intensive) parts.push(`A more intensive course is also documented: ${end(intensive)}`);
  const sex = verified(id, "sexSpecificNotes");
  if (sex) parts.push(end(sex));
  parts.push("That's manufacturer guidance, not evidence from clinical trials of this product.");
  return { verified: true, text: parts.join(" ") };
}

export function productDataSummary() {
  const all = FILE.products;
  return {
    products: all.length,
    verifiedLabelDirections: all.filter(p => verified(p.id, "labelDirections")).length,
  };
}
