/**
 * "Shop by system" taxonomy (Brand Advisor approved names + intros, Oct 2026).
 *
 * Product membership is DERIVED from data that already exists on the site —
 * nothing new is claimed about any product:
 *  - `listed`: the same product lists the homepage "Guided by System" cards
 *    already show for each system (names not in the catalog are skipped).
 *  - Longevity & Healthy Aging also includes every product in the existing
 *    "ANTI AGING-LONGEVITY" category.
 *  - Organ & Foundational Support also includes every Cytomax / Cytogen
 *    (20 / 60-capsule organ bioregulators), which the catalog already
 *    describes as matched to one organ or tissue.
 *
 * `intro` is the "Is this for you?" copy. An empty intro is never rendered.
 */
import type { Product } from "@/data/products";

export type ShopSystemId = "brain" | "recovery" | "longevity" | "organ";

export type ShopSystem = {
  id: ShopSystemId;
  name: string;
  /** "Is this for you?" — omitted from the page when empty. */
  intro: string;
  /** Product ids taken from the existing homepage system cards. */
  listed: string[];
  /** Extra membership rule from existing catalog data. */
  includes?: (p: Pick<Product, "id" | "category" | "variants">) => boolean;
};

/** Cytomax / Cytogen organ bioregulators are the products sold as 20 / 60 capsules. */
function isOrganBioregulator(p: Pick<Product, "category" | "variants">): boolean {
  return (
    p.category === "PEPTIDE BIOREGULATORS" &&
    (p.variants ?? []).some((v) => v.id === "20-count") &&
    (p.variants ?? []).some((v) => v.id === "60-count")
  );
}

export const SHOP_SYSTEMS: ShopSystem[] = [
  {
    id: "brain",
    name: "Brain & Cognitive Vitality",
    intro:
      "For people who want to support focus, memory, and mental clarity as part of a long-term routine.",
    listed: ["prime-peptide-brain", "revilab-ml-03", "revilab-sl-02"],
  },
  {
    id: "recovery",
    name: "Recovery & Resilience",
    intro:
      "For people under steady physical or mental load who want to support how the body recovers.",
    listed: ["gotratix", "chelohart", "revilab-ml-04", "revilab-sl-07"],
  },
  {
    id: "longevity",
    name: "Longevity & Healthy Aging",
    intro: "For people thinking ahead, building a preventive routine for the years to come.",
    listed: ["endoluten", "revilab-anti-age", "gpl-man", "gpl-femme"],
    includes: (p) => p.category === "ANTI AGING-LONGEVITY",
  },
  {
    id: "organ",
    name: "Organ & Foundational Support",
    intro:
      "For people who want targeted support for one specific organ or system, like liver, kidney, thyroid, or immune.",
    listed: ["vladonix", "thyreogen", "pielotax", "revilab-ml-06"],
    includes: isOrganBioregulator,
  },
];

/** Shown under every intro. */
export const SYSTEM_HELP_LINE = {
  before: "Not sure which one fits?",
  askPeppy: "Ask Peppy",
  middle: ", or bring the",
  doctorQuestions: "doctor questions",
  after: "to your next appointment.",
};

export function getSystem(id: string | null | undefined): ShopSystem | undefined {
  return SHOP_SYSTEMS.find((s) => s.id === id);
}

export function productInSystem(
  p: Pick<Product, "id" | "category" | "variants">,
  system: ShopSystem
): boolean {
  return system.listed.includes(p.id) || (system.includes ? system.includes(p) : false);
}

/** Collection filter value for a system (shares the category filter state). */
export const SYSTEM_FILTER_PREFIX = "system:";
