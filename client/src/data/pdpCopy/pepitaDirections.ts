/**
 * Directions the live product pages show, keyed by product id, in the shape Pepita reads
 * (shared/peppy/storefront-directions.json). Pepita can't import this client file at runtime
 * (the API bundle has no "@" aliases), so the JSON is a generated copy; the sync test in
 * pepitaDirections.test.ts fails if the two drift.
 */
import { CYTOMAX_COPY } from "./cytomax";
import { CYTOGEN_COPY } from "./cytogen";
import { PHASE2_COPY } from "./phase2";
import { REVILAB_ML_COPY } from "./revilabMl";
import { HIDDEN_PRODUCT_IDS } from "@shared/hidden-products";

export interface PepitaStorefrontDirection {
  kind: "manufacturer" | "brochure" | "package" | "confirmed";
  text: string;
  page?: number;
}

export function pepitaStorefrontDirections(): Record<string, PepitaStorefrontDirection> {
  const all = { ...CYTOMAX_COPY, ...CYTOGEN_COPY, ...PHASE2_COPY, ...REVILAB_ML_COPY };
  const out: Record<string, PepitaStorefrontDirection> = {};
  for (const id of Object.keys(all).sort()) {
    const src = all[id].manufacturerDirections.source;
    if (!src || !src.text.trim() || HIDDEN_PRODUCT_IDS.has(id)) continue;
    out[id] = { kind: src.kind, text: src.text.trim(), ...(src.page ? { page: src.page } : {}) };
  }
  return out;
}
