/**
 * Product-page → Peppy hand-off (/ai-assistant?product=&goal=&sex=).
 * Pure helpers so the parsing and copy are unit-testable.
 */
import { ASSISTANT_DISCLAIMER } from "@/lib/assistantReply";
import { DOCTOR_QUESTIONS } from "@/data/doctorQuestions";
import {
  getPublicProtocol,
  hasSexSpecific,
  scheduleFor,
  type ProductProtocol,
  type ProtocolGoal,
  type ProtocolSex,
} from "@/data/protocols";

export type PeppyParams = { productId?: string; goal?: ProtocolGoal; sex?: ProtocolSex };

const GOALS: ProtocolGoal[] = ["preventive", "restorative"];
const SEXES: ProtocolSex[] = ["men", "women"];

export const GOAL_TEXT: Record<ProtocolGoal, string> = {
  preventive: "preventive (maintenance)",
  restorative: "restorative (regenerative)",
};

export function parsePeppyParams(
  search: string,
  productExists: (id: string) => boolean
): PeppyParams {
  const q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const out: PeppyParams = {};
  const product = (q.get("product") ?? "").trim();
  if (product && /^[a-z0-9-]{1,80}$/.test(product) && productExists(product)) out.productId = product;
  const goal = q.get("goal") as ProtocolGoal | null;
  if (goal && GOALS.includes(goal)) out.goal = goal;
  const sex = q.get("sex") as ProtocolSex | null;
  if (sex && SEXES.includes(sex)) out.sex = sex;
  return out;
}

/** Text placed in the input box (not sent automatically). */
export function peppyPrefill(productName: string, goal?: ProtocolGoal): string {
  return goal
    ? `Tell me about ${productName} for ${GOAL_TEXT[goal]} use.`
    : `Tell me about ${productName}.`;
}

/** Reviewed schedule lines for the context card, or null when none is public. */
export function peppySchedule(
  productId: string,
  goal: ProtocolGoal | undefined,
  sex: ProtocolSex | undefined,
  table?: Record<string, ProductProtocol>
): { rows: { label: string; value: string }[]; note?: string; sexSpecific: boolean } | null {
  const protocol = getPublicProtocol(productId, table);
  if (!protocol || !goal) return null;
  const sexSpecific = hasSexSpecific(protocol, goal);
  const s = scheduleFor(protocol, goal, sexSpecific ? sex ?? "women" : undefined);
  if (!s) return null;
  return { rows: s.rows.filter((r) => r.label.trim() && r.value.trim()), note: s.note, sexSpecific };
}

/** Assistant message for the "Questions for my doctor" quick action. */
export function doctorQuestionsMessage(productName?: string): string {
  const intro = productName
    ? `Here are questions to bring to your doctor about ${productName}:`
    : "Here are questions to bring to your doctor:";
  const list = DOCTOR_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n");
  return `${intro}\n\n${list}\n\n${ASSISTANT_DISCLAIMER}`;
}
