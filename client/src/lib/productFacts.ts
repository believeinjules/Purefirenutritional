/**
 * "At a glance" facts for a product + size, derived ONLY from data
 * (variant names and client/src/data/dosing.ts). Anything that cannot be
 * computed from data is returned as undefined so the UI renders nothing.
 */
import { DOSING, type DosingFacts } from "@/data/dosing";

type FactsProduct = {
  id: string;
  variants?: Array<{ id: string; name: string; priceUSD: number; inStock?: boolean }>;
};

export type ProductFacts = {
  /** e.g. "20 caps" or "20 or 60 caps". */
  sizeLabel?: string;
  /** Units in the selected bottle. */
  units?: number;
  /** Days one bottle lasts at the stated daily amount. */
  daysPerBottle?: number;
  /** One course length, when stated. */
  cycleDays?: number;
  /** Bottles needed for one full course (whole number), when known. */
  bottlesPerCycle?: number;
  /** e.g. "One 10-day cycle" / "10 days · 3 bottles = one 30-day course". */
  coverageLabel?: string;
  /** Dollars per day at the stated daily amount. */
  costPerDayUSD?: number;
};

function unitsFromVariantName(name: string): number | undefined {
  const m = name.match(/\b(\d{1,4})\s*(capsules|caps|tablets|tabs)\b/i);
  return m ? Number(m[1]) : undefined;
}

/** Units in a bottle of the given size ("20" | "60"), from variant names or dosing data. */
export function bottleUnits(product: FactsProduct, size?: string): number | undefined {
  const variants = product.variants ?? [];
  if (variants.length > 0) {
    const v =
      variants.find((x) => x.id === `${size}-count`) ??
      variants.find((x) => unitsFromVariantName(x.name) === Number(size)) ??
      variants[0];
    return unitsFromVariantName(v.name);
  }
  return DOSING[product.id]?.unitsPerBottle;
}

export function getDosing(productId: string): DosingFacts | undefined {
  return DOSING[productId];
}

/** Facts for the listing card (no size picked: shows all sizes, facts for the first). */
export function getProductFacts(
  product: FactsProduct,
  size: string | undefined,
  unitPriceUSD: number | undefined
): ProductFacts {
  const dosing = DOSING[product.id];
  const unitLabel = dosing?.unitLabel ?? "caps";
  const facts: ProductFacts = {};

  const variantUnits = (product.variants ?? [])
    .map((v) => unitsFromVariantName(v.name))
    .filter((n): n is number => typeof n === "number");
  const allSizes = Array.from(new Set(variantUnits)).sort((a, b) => a - b);

  const effectiveSize = size ?? (allSizes[0] !== undefined ? String(allSizes[0]) : undefined);
  const units = bottleUnits(product, effectiveSize);
  facts.units = units;

  if (size === undefined && allSizes.length > 1) {
    facts.sizeLabel = `${allSizes.join(" or ")} ${unitLabel}`;
  } else if (units) {
    facts.sizeLabel = `${units} ${unitLabel}`;
  }

  const perDay = dosing?.unitsPerDay;
  if (units && perDay && perDay > 0) {
    const days = units / perDay;
    if (Number.isInteger(days)) facts.daysPerBottle = days;
  }

  if (dosing?.cycleDays) facts.cycleDays = dosing.cycleDays;

  if (facts.daysPerBottle && facts.cycleDays) {
    const d = facts.daysPerBottle;
    const c = facts.cycleDays;
    if (d === c) {
      facts.bottlesPerCycle = 1;
      facts.coverageLabel = `One ${c}-day cycle`;
    } else if (d > c && d % c === 0) {
      facts.bottlesPerCycle = 1;
      facts.coverageLabel = `${d / c} × ${c}-day cycles`;
    } else if (d < c && c % d === 0) {
      facts.bottlesPerCycle = c / d;
      facts.coverageLabel = `${d} days · ${c / d} bottles = one ${c}-day cycle`;
    } else {
      facts.coverageLabel = `${d} days per bottle`;
    }
  } else if (facts.daysPerBottle) {
    facts.coverageLabel = `${facts.daysPerBottle} days per bottle`;
  }

  if (
    facts.daysPerBottle &&
    typeof unitPriceUSD === "number" &&
    Number.isFinite(unitPriceUSD) &&
    unitPriceUSD > 0
  ) {
    facts.costPerDayUSD = Math.round((unitPriceUSD / facts.daysPerBottle) * 100) / 100;
  }

  return facts;
}
