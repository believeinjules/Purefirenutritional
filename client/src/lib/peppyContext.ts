/**
 * Product-page → Pepita hand-off (/ai-assistant?product=&goal=&sex=).
 * Pure helpers so the parsing and copy are unit-testable.
 */
import { ASSISTANT_DISCLAIMER } from "@shared/peppy/claims";
import { DOCTOR_QUESTIONS } from "@/data/doctorQuestions";
import {
  getPublicProtocol,
  hasSexSpecific,
  scheduleFor,
  type ProductProtocol,
  type ProtocolGoal,
  type ProtocolSex,
} from "@/data/protocols";

/** `question` is a prefilled question from ?q= (Learn pages); placed in the input, never auto-sent. */
export type PeppyParams = { productId?: string; goal?: ProtocolGoal; sex?: ProtocolSex; question?: string };

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
  const question = (q.get("q") ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 300);
  if (question) out.question = question;
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

// ---------- Questions for my doctor (v5): built only from what the user volunteered ----------

const MED_RE = /\b(?:my|on|taking|take)\s+((?:[a-z-]+\s){0,3}?(?:medication|medicine|meds|pills|prescription|tablets))\b|\b(warfarin|eliquis|xarelto|metformin|insulin|levothyroxine|statins?|ssris?|antidepressants?|blood thinners?|birth control|hrt|hormone therapy)\b/i;
const MEDICAL_RE = /\b(medication|medicine|meds|pills|prescription|doctor|pregnan\w*|breast-?feed\w*|surgery|operation|menopaus\w*|perimenopaus\w*|thyroid|blood pressure|diabet\w*|heart|kidney|liver|bladder|urinary|ketamine|pain|symptom\w*|condition|diagnos\w*|side effects?|interact\w*|safe|allerg\w*|sleep|insomnia|tired|fatigue|anxiety|depress\w*)\b/i;

/** True when a user message touches health, safety or medicines (then we offer doctor questions). */
export function isMedicallyRelevant(text: string): boolean {
  return MEDICAL_RE.test(text);
}

/**
 * 3–5 questions for the user's doctor, using ONLY details the user wrote themselves.
 * Never infers sex, hormonal status or a diagnosis.
 */
export function doctorQuestionsFromConversation(userTexts: string[], productNames: string[] = []): string[] {
  const all = userTexts.join(" \n ");
  const t = all.toLowerCase();
  const thing = productNames.length === 1 ? productNames[0] : productNames.length > 1 ? productNames.slice(0, 2).join(" and ") : "this supplement";
  const qs: string[] = [];
  const med = all.match(MED_RE);
  if (med) qs.push(`Could ${thing} interact with my ${(med[1] ?? med[2]).trim().replace(/^my\s+/i, "")}?`);
  if (/\bpregnan|trying to conceive/.test(t)) qs.push(`Is ${thing} appropriate during pregnancy or while trying to conceive?`);
  if (/breast-?feed|nursing/.test(t)) qs.push(`Is ${thing} appropriate while I'm breastfeeding?`);
  if (/\bsurgery|operation\b/.test(t)) qs.push(`Should I avoid ${thing} around my upcoming surgery?`);
  if (/ketamine/.test(t) && /bladder|urin/.test(t)) qs.push("Could my bladder symptoms be related to past ketamine use, and should a urologist look at them?");
  else if (/\b(menopaus\w*|perimenopaus\w*)\b/.test(t)) qs.push("Which of my menopause symptoms are worth checking before I try a supplement?");
  const cond = t.match(/\bmy (thyroid|blood pressure|diabetes|heart|kidneys?|liver|bladder|joints?|sleep|anxiety|migraines?)\b(?!\s+(?:medication|medicine|meds|pills|tablets))/);
  if (cond) qs.push(`Is there anything about my ${cond[1]} that makes ${thing} a poor fit?`);
  if (/\b(how (?:much|many|often)|dose|dosage|schedule|every \d|course)\b/.test(t)) qs.push(`Is the label schedule for ${thing} right for me, and how long should one course be?`);
  if (productNames.length) qs.push(`Is ${thing} appropriate with my current medications or conditions?`);
  const coversMeds = qs.some(q => /medication|interact/i.test(q));
  for (const q of DOCTOR_QUESTIONS) if (qs.length < 3 && !(coversMeds && /medications/i.test(q))) qs.push(q);
  return Array.from(new Set(qs)).slice(0, 5);
}

/** Assistant message: numbered, copy-friendly, no clinical advice. */
export function doctorQuestionsMessageFor(userTexts: string[], productNames: string[] = []): string {
  const qs = doctorQuestionsFromConversation(userTexts, productNames);
  const about = productNames.length ? ` about ${productNames.slice(0, 2).join(" and ")}` : "";
  return `Here are questions to bring to your doctor${about}, based on what you've told me:\n\n${qs.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
}
