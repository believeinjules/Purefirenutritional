/**
 * Manufacturer protocol schedules for the product-page tabs
 * (Preventive / maintenance | Restorative / regenerative).
 *
 * RULES
 *  - Fill ONLY from the manufacturer's official protocol documents. Never invent.
 *  - `protocolReviewed` must be set to true by the Regulatory Advisor before a
 *    schedule is shown publicly. Unreviewed → tabs do not render at all.
 *  - Use `men` / `women` ONLY when the manufacturer gives distinct schedules by
 *    sex; otherwise use `all`. The Men's/Women's toggle appears only when both
 *    `men` and `women` exist for a goal.
 *  - A product with no schedule data shows no tabs.
 *
 * Currently EMPTY on purpose: no reviewed manufacturer protocols have been supplied yet.
 */

export type ScheduleRow = { label: string; value: string };

export type ProtocolSchedule = {
  rows: ScheduleRow[];
  note?: string;
};

export type GoalSchedules = {
  all?: ProtocolSchedule;
  men?: ProtocolSchedule;
  women?: ProtocolSchedule;
};

export type ProductProtocol = {
  /** Regulatory Advisor review gate. Nothing renders publicly until true. */
  protocolReviewed: boolean;
  preventive?: GoalSchedules;
  restorative?: GoalSchedules;
  /** Where the schedule came from (document name / page), for review. */
  source?: string;
};

export type ProtocolGoal = "preventive" | "restorative";
export type ProtocolSex = "men" | "women";

export const PROTOCOLS: Record<string, ProductProtocol> = {};

function hasRows(s?: ProtocolSchedule): s is ProtocolSchedule {
  return !!s && Array.isArray(s.rows) && s.rows.some((r) => r.label.trim() && r.value.trim());
}

/** Goals that have at least one schedule. */
export function goalsWithData(p: ProductProtocol | undefined): ProtocolGoal[] {
  if (!p) return [];
  return (["preventive", "restorative"] as const).filter((g) => {
    const s = p[g];
    return !!s && (hasRows(s.all) || hasRows(s.men) || hasRows(s.women));
  });
}

/** Public protocol for a product, or null when unreviewed / empty. */
export function getPublicProtocol(
  productId: string,
  table: Record<string, ProductProtocol> = PROTOCOLS
): ProductProtocol | null {
  const p = table[productId];
  if (!p || p.protocolReviewed !== true) return null;
  return goalsWithData(p).length > 0 ? p : null;
}

/** True when the goal has DISTINCT men's and women's schedules. */
export function hasSexSpecific(p: ProductProtocol, goal: ProtocolGoal): boolean {
  const g = p[goal];
  if (!g || !hasRows(g.men) || !hasRows(g.women)) return false;
  return JSON.stringify(g.men) !== JSON.stringify(g.women);
}

/** Schedule to show for a goal / sex selection. */
export function scheduleFor(
  p: ProductProtocol,
  goal: ProtocolGoal,
  sex?: ProtocolSex
): ProtocolSchedule | undefined {
  const g = p[goal];
  if (!g) return undefined;
  if (hasSexSpecific(p, goal) && sex) return g[sex];
  if (hasRows(g.all)) return g.all;
  return hasRows(g.men) ? g.men : hasRows(g.women) ? g.women : undefined;
}
