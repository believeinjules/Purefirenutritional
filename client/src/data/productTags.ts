/**
 * ONE SOURCE OF TRUTH for shop browsing: which body-system group, collection
 * and goal each product belongs to (plus its complex code, if its own meta
 * names one). Every Shop menu entry, browse page, list-page section and
 * product "Part of" link is generated from this file.
 *
 * To add a product: add one line here with its tags. That's it.
 *  - `system:<slug>`     body-system group (first one = primary, used in breadcrumbs)
 *  - `collection:<slug>` brand line / collection
 *  - `goal:<slug>`       shopping goal
 *  - `list:<section>`    Khavinson Peptides List section only, for products with no
 *                        group (list:eyes-vision; anything else untagged goes to "Skin, Energy & General")
 *
 * Rule for assignments: a tag is given only when the product's OWN existing
 * copy (pdp tags, biologicalTarget or meta description in
 * shared/product-facts.json) names that system or goal. Nothing is inferred
 * from ingredients. Audit: docs/shop-taxonomy-audit.md.
 *
 * Hidden products (shared/hidden-products.ts) keep their tags for when they
 * return, but are never shown: pages resolve membership against the
 * storefront catalog, which drops hidden ids.
 */
export const PRODUCT_TAGS: Record<string, { tags: string[]; code?: string }> = {
  // ── Khavinson Cytomax® (A-codes) ─────────────────────────────────────────
  cerluten: { code: "A-5", tags: ["system:brain-nervous-system", "collection:khavinson-cytomaxes", "goal:focus-cognition"] },
  endoluten: { code: "A-8", tags: ["system:brain-nervous-system", "system:hormonal-reproductive-health", "collection:khavinson-cytomaxes", "goal:sleep-daily-rhythms", "goal:healthy-aging"] },
  chelohart: { code: "A-14", tags: ["system:heart-circulation", "collection:khavinson-cytomaxes", "goal:energy-vitality", "goal:healthy-aging"] },
  ventfort: { code: "A-3", tags: ["system:heart-circulation", "collection:khavinson-cytomaxes"] },
  vladonix: { code: "A-6", tags: ["system:immune-respiratory", "collection:khavinson-cytomaxes", "goal:healthy-aging"] },
  taxorest: { code: "A-19", tags: ["system:immune-respiratory", "collection:khavinson-cytomaxes"] },
  bonomarlot: { code: "A-20", tags: ["system:blood-bone-marrow", "system:immune-respiratory", "collection:khavinson-cytomaxes"] },
  svetinorm: { code: "A-7", tags: ["system:digestion-metabolism", "collection:khavinson-cytomaxes"] },
  stamakort: { code: "A-10", tags: ["system:digestion-metabolism", "collection:khavinson-cytomaxes"] },
  suprefort: { code: "A-1", tags: ["system:digestion-metabolism", "collection:khavinson-cytomaxes"] },
  pielotax: { code: "A-9", tags: ["system:kidney-bladder", "collection:khavinson-cytomaxes"] },
  chitomur: { code: "A-12", tags: ["system:kidney-bladder", "collection:khavinson-cytomaxes"] },
  sigumir: { code: "A-4", tags: ["system:bones-joints-muscles", "collection:khavinson-cytomaxes", "goal:recovery-mobility"] },
  bonothyrk: { code: "A-21", tags: ["system:bones-joints-muscles", "system:hormonal-reproductive-health", "collection:khavinson-cytomaxes"] },
  gotratix: { code: "A-18", tags: ["system:bones-joints-muscles", "collection:khavinson-cytomaxes", "goal:recovery-mobility"] },
  thyreogen: { code: "A-2", tags: ["system:hormonal-reproductive-health", "collection:khavinson-cytomaxes", "goal:energy-vitality"] },
  glandokort: { code: "A-17", tags: ["system:hormonal-reproductive-health", "collection:khavinson-cytomaxes", "goal:energy-vitality", "goal:stress-resilience"] },
  zhenoluten: { code: "A-15", tags: ["system:hormonal-reproductive-health", "collection:khavinson-cytomaxes"] },
  testoluten: { code: "A-13", tags: ["system:hormonal-reproductive-health", "collection:khavinson-cytomaxes"] },
  libidon: { code: "A-16", tags: ["system:hormonal-reproductive-health", "collection:khavinson-cytomaxes"] },
  visoluten: { code: "A-11", tags: ["collection:khavinson-cytomaxes", "list:eyes-vision"] },

  // ── Khavinson Cytogen® (AC-codes) ────────────────────────────────────────
  pinealon: { code: "AC-5", tags: ["system:brain-nervous-system", "collection:khavinson-cytogens", "goal:focus-cognition", "goal:stress-resilience"] },
  vesugen: { code: "AC-2", tags: ["system:heart-circulation", "collection:khavinson-cytogens"] },
  crystagen: { code: "AC-6", tags: ["system:immune-respiratory", "collection:khavinson-cytogens"] },
  chonluten: { code: "AC-7", tags: ["system:immune-respiratory", "collection:khavinson-cytogens"] },
  ovagen: { code: "AC-3", tags: ["system:digestion-metabolism", "collection:khavinson-cytogens"] },
  cartalax: { code: "AC-4", tags: ["system:bones-joints-muscles", "collection:khavinson-cytogens", "goal:recovery-mobility"] },

  // ── Prime Peptide ────────────────────────────────────────────────────────
  "prime-peptide-brain": { tags: ["system:brain-nervous-system", "collection:prime-peptide", "goal:focus-cognition"] },
  "prime-peptide-protect": { tags: ["system:brain-nervous-system", "collection:prime-peptide", "goal:sleep-daily-rhythms", "goal:stress-resilience"] },
  "prime-peptide-omega": { tags: ["system:immune-respiratory", "collection:prime-peptide"] },
  "prime-peptide-joints": { tags: ["system:bones-joints-muscles", "collection:prime-peptide", "goal:recovery-mobility"] },
  "prime-peptide-collagen": { tags: ["collection:prime-peptide", "goal:skin-hair-beauty"] },

  // ── Revilab ML (capsules) ────────────────────────────────────────────────
  "revilab-ml-01": { tags: ["system:brain-nervous-system", "system:immune-respiratory", "collection:revilab"] },
  "revilab-ml-02": { tags: ["system:blood-bone-marrow", "system:immune-respiratory", "collection:revilab"] },
  "revilab-ml-03": { tags: ["system:brain-nervous-system", "collection:revilab", "list:eyes-vision"] },
  "revilab-ml-04": { tags: ["system:heart-circulation", "collection:revilab"] },
  "revilab-ml-05": { tags: ["system:immune-respiratory", "collection:revilab"] },
  "revilab-ml-06": { tags: ["system:digestion-metabolism", "collection:revilab"] },
  "revilab-ml-07": { tags: ["system:hormonal-reproductive-health", "system:kidney-bladder", "collection:revilab"] },
  "revilab-ml-08": { tags: ["system:hormonal-reproductive-health", "system:bones-joints-muscles", "collection:revilab"] },
  "revilab-ml-09": { tags: ["system:bones-joints-muscles", "collection:revilab", "goal:recovery-mobility"] },
  // ── Revilab SL (lingual) ─────────────────────────────────────────────────
  "revilab-sl-01": { tags: ["system:heart-circulation", "collection:revilab"] },
  "revilab-sl-02": { tags: ["system:brain-nervous-system", "collection:revilab"] },
  "revilab-sl-03": { tags: ["system:immune-respiratory", "collection:revilab", "goal:sleep-daily-rhythms"] },
  "revilab-sl-04": { tags: ["system:bones-joints-muscles", "collection:revilab", "goal:recovery-mobility"] },
  "revilab-sl-05": { tags: ["system:digestion-metabolism", "collection:revilab"] },
  "revilab-sl-06": { tags: ["system:immune-respiratory", "collection:revilab"] },
  "revilab-sl-07": { tags: ["system:blood-bone-marrow", "system:immune-respiratory", "collection:revilab"] },
  "revilab-sl-08": { tags: ["system:kidney-bladder", "collection:revilab"] },
  "revilab-sl-09": { tags: ["system:hormonal-reproductive-health", "collection:revilab"] },
  "revilab-sl-10": { tags: ["system:hormonal-reproductive-health", "collection:revilab"] },
  // ── Revilab other ────────────────────────────────────────────────────────
  "revilab-anti-age": { tags: ["collection:revilab", "goal:skin-hair-beauty", "goal:healthy-aging"] },
  "revilab-pro-elements": { tags: ["collection:revilab", "goal:energy-vitality"] },

  // ── Multi-peptide complexes ──────────────────────────────────────────────
  "gpl-femme": { tags: ["system:hormonal-reproductive-health", "goal:healthy-aging"] },
  "gpl-man": { tags: ["system:hormonal-reproductive-health", "goal:energy-vitality", "goal:healthy-aging"] },
  "anti-age-nb-activity": { code: "AA-9, AA-3", tags: ["goal:energy-vitality"] },
  "anti-age-nb-health": { code: "AA-3, AA-1", tags: ["goal:healthy-aging"] },

  // ── Nutritional formulas ─────────────────────────────────────────────────
  felicita: { tags: ["system:brain-nervous-system", "goal:stress-resilience", "goal:focus-cognition"] },
  mesotel: { tags: ["system:brain-nervous-system", "goal:healthy-aging"] },
  "mesotel-neo": { tags: ["system:brain-nervous-system", "system:heart-circulation"] },
  "mesotel-beauty": { tags: ["goal:skin-hair-beauty"] },
  ensil: { tags: ["system:brain-nervous-system", "goal:energy-vitality"] },
  "complex-3r": { tags: ["system:heart-circulation"] },
  "complex-3d": { tags: ["list:general"] },
  imusil: { tags: ["system:immune-respiratory", "goal:stress-resilience", "goal:skin-hair-beauty"] },
  revifort: { tags: ["system:immune-respiratory", "system:blood-bone-marrow"] },
  "zinsil-t": { tags: ["system:immune-respiratory", "goal:sleep-daily-rhythms", "goal:stress-resilience", "goal:skin-hair-beauty"] },
  reviplant: { tags: ["system:immune-respiratory", "system:digestion-metabolism"] },
  "alvenorm-forte": { tags: ["system:immune-respiratory"] },
  rinolax: { tags: ["system:immune-respiratory"] },
  likam: { tags: ["system:digestion-metabolism", "goal:energy-vitality"] },
  pangluin: { tags: ["system:digestion-metabolism", "goal:energy-vitality"] },
  digemax: { tags: ["system:digestion-metabolism"] },
  getrufline: { tags: ["system:digestion-metabolism"] },
  volustom: { tags: ["system:digestion-metabolism"] },
  renefort: { tags: ["system:kidney-bladder"] },
  levain: { tags: ["system:bones-joints-muscles", "goal:energy-vitality", "goal:stress-resilience", "goal:recovery-mobility"] },
  "reviform-cocktail": { tags: ["system:bones-joints-muscles", "goal:recovery-mobility"] },
  revimite: { tags: ["system:blood-bone-marrow", "goal:energy-vitality", "goal:stress-resilience"] },
  mamiton: { tags: ["system:hormonal-reproductive-health"] },
  "pinalex-tab": { code: "AA-6", tags: ["list:eyes-vision"] },
  retisil: { tags: ["list:eyes-vision"] },
  "anti-wrinkle-serum-7": { tags: ["goal:skin-hair-beauty"] },

  // ── Hidden (never shown; tags kept for when they return) ─────────────────
  indosine: { tags: [] },
  "calsil-t": { tags: ["system:bones-joints-muscles"] },
  panaxod: { tags: ["goal:energy-vitality", "goal:stress-resilience"] },
};

export function tagsFor(id: string): string[] {
  return PRODUCT_TAGS[id]?.tags ?? [];
}

export function idsWithTag(tag: string): string[] {
  return Object.keys(PRODUCT_TAGS).filter((id) => PRODUCT_TAGS[id].tags.includes(tag));
}
