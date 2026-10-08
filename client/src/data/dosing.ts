/**
 * Per-product dosing DATA used for the "at a glance" facts on product cards and
 * product pages: bottle size, how many days one bottle covers, cycle coverage
 * and cost per day.
 *
 * RULES (do not relax):
 *  - Only fill a field when the product's OFFICIAL usage text states it
 *    unambiguously. Ranges such as "1–2 capsules 1–2 times daily" or
 *    "Course: 4–6 weeks" are NOT filled. Nothing here is invented.
 *  - Every field is optional. A fact renders only when the numbers it needs
 *    are all present (e.g. cost per day needs unitsPerDay AND bottle units).
 *  - `source` quotes the usage text each value was derived from, so the
 *    Regulatory Advisor can check it.
 *
 * Bottle units for 20 / 60 capsule products come from the variant names
 * ("20 Capsules" / "60 Capsules"); `unitsPerBottle` is only needed for
 * products sold in one size.
 */

export type DosingFacts = {
  /** Capsules / tablets taken per day at the stated dose. */
  unitsPerDay?: number;
  /** Units in the bottle, for single-size products (e.g. 60). */
  unitsPerBottle?: number;
  /** Singular / plural unit noun, default "caps". */
  unitLabel?: string;
  /** Length of one course (cycle) in days, when stated as a single number. */
  cycleDays?: number;
  /** Exact usage text the numbers were taken from. */
  source: string;
};

export const DOSING: Record<string, DosingFacts> = {
  // "Maintenance: 20-capsule vial (10 days)" → 2 caps/day, one 10-day cycle per 20-cap bottle.
  bonomarlot: {
    unitsPerDay: 2,
    cycleDays: 10,
    source: "Maintenance: 20-capsule vial (10 days).",
  },
  endoluten: {
    unitsPerDay: 2,
    cycleDays: 10,
    source: "Maintenance: 20-capsule vial (10 days).",
  },
  // "1 capsule twice daily with meals for 30 days" → 2 caps/day, 30-day course.
  testoluten: {
    unitsPerDay: 2,
    cycleDays: 30,
    source: "Prevention: 1 capsule twice daily with meals for 30 days. Repeat every 4–6 months.",
  },

  // Unambiguous daily amount, but the bottle count is not in our product data,
  // so no coverage / cost per day can render until `unitsPerBottle` is added.
  "revilab-ml-01": { unitsPerDay: 1, source: "Take 1 capsule daily in the morning on an empty stomach." },
  "revilab-ml-02": { unitsPerDay: 1, source: "Take 1 capsule daily in the morning on an empty stomach." },
  "revilab-ml-03": { unitsPerDay: 1, source: "Take 1 capsule daily in the morning on an empty stomach." },
  "revilab-ml-04": { unitsPerDay: 1, source: "Take 1 capsule daily in the morning on an empty stomach." },
  "revilab-ml-05": { unitsPerDay: 1, source: "Take 1 capsule daily in the morning on an empty stomach." },
  "revilab-ml-06": { unitsPerDay: 1, source: "Take 1 capsule daily in the morning on an empty stomach." },
  "revilab-ml-07": { unitsPerDay: 1, source: "Take 1 capsule daily in the morning on an empty stomach." },
  "revilab-ml-08": { unitsPerDay: 1, source: "Take 1 capsule daily in the morning on an empty stomach." },
  "revilab-ml-09": { unitsPerDay: 1, source: "Take 1 capsule daily in the morning on an empty stomach." },
  "revilab-anti-age": { unitsPerDay: 1, source: "Take 1 capsule per day during meals." },
  "complex-3d": { unitsPerDay: 1, source: "Take 1 capsule daily with meals." },
  previn: { unitsPerDay: 1, unitLabel: "tablets", source: "Take 1 tablet per day during meals." },
  "zinsil-t": { unitsPerDay: 2, unitLabel: "tablets", source: "Take 1 tablet 2 times daily, chewing during meals." },
  ensil: { unitsPerDay: 3, source: "Take 1 capsule 3 times daily with meals." },
  getrufline: { unitsPerDay: 1, unitLabel: "truffles", source: "Chew 1 truffle thoroughly per day for 6–12 days." },
};
