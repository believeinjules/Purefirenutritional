/**
 * Pepita conversation memory (fallback mode). Pulls simple slots (goal, duration, age or
 * life stage, activity, body area) out of what the customer has typed, so later answers
 * refine the picks instead of restarting. Pure functions; the chat keeps the result in
 * component state and sends it with each request.
 */
import type { PeppyProfile } from "./types.js";

const AREA =
  /\b(knees?|hips?|ankles?|shoulders?|elbows?|wrists?|hands?|fingers?|lower back|back|neck|spine)\b/i;

export function extractProfile(text: string, prev: PeppyProfile = {}): PeppyProfile {
  const t = text.toLowerCase();
  const out: PeppyProfile = { ...prev };

  if (/\b(prevent\w*|maintenance|stay ahead|keep (?:them|it|my \w+) healthy|long[- ]term upkeep|before it starts)\b/.test(t))
    out.goal = "prevention";
  else if (/\b(recover\w*|after (?:a |an |my )?(?:injury|surgery|race|marathon|workout|training)|bounce back|rehab\w*)\b/.test(t))
    out.goal = "recovery";
  else if (/\b(existing|already (?:have|has)|ongoing|chronic|it hurts now|current(?:ly)? (?:hurts|sore|painful))\b/.test(t))
    out.goal = "existing";

  const dur = t.match(
    /\b(?:for |about |around |over |past |last )?((?:a|one|two|three|four|five|six|a few|a couple of|several|\d+)\s*(?:days?|weeks?|months?|years?))\b/
  );
  if (dur) out.duration = dur[1].replace(/\s+/g, " ");
  else if (/\b(just started|recently|new(?:ly)?)\b/.test(t)) out.duration = "recent";
  else if (/\b(for ages|for years|long time)\b/.test(t)) out.duration = "years";

  const age =
    t.match(/\b(?:i'?m|i am|age[d]?|aged)\s*(\d{2})\b/) ??
    t.match(/\b(\d{2})\s*(?:y\/?o|years? old|yrs? old)\b/) ??
    t.match(/\b(\d{2})[- ]?year[- ]?old\b/);
  if (age) out.age = age[1];
  else if (/\b(menopaus\w*|perimenopaus\w*)\b/.test(t)) out.age = "menopause";
  else if (/\b(retired|senior|over (?:60|65|70))\b/.test(t)) out.age = "60+";

  const act = t.match(
    /\b(run(?:ning|ner)?|jog\w*|marathons?|cycl\w*|bik\w*|swim\w*|lift\w*|weights|gym|crossfit|tennis|football|soccer|basketball|hik\w*|yoga|climb\w*|ski\w*|dance\w*|desk job|sit(?:ting)? all day|on my feet all day|manual work|sedentary)\b/
  );
  if (act) out.activity = act[1];

  const area = t.match(AREA);
  if (area) out.area = area[1];
  return out;
}

/** Profile from every user message so far (used when the client didn't send one). */
export function profileFromMessages(userMessages: readonly string[]): PeppyProfile {
  return userMessages.reduce<PeppyProfile>((p, m) => extractProfile(m, p), {});
}

export function hasProfile(p: PeppyProfile | undefined): p is PeppyProfile {
  return !!p && Object.values(p).some(v => typeof v === "string" && v.length > 0);
}

/** Plain-words recap of what the customer told us ("a runner, 55, about 3 months"). */
export function profileRecap(p: PeppyProfile): string {
  const bits: string[] = [];
  if (p.area) bits.push(`your ${p.area}`);
  if (p.activity) bits.push(activityPhrase(p.activity));
  if (p.age) bits.push(/^\d+$/.test(p.age) ? `${p.age} years old` : p.age === "menopause" ? "around menopause" : `in your ${p.age}`);
  if (p.duration) bits.push(p.duration === "recent" ? "a recent change" : `going on ${p.duration}`);
  if (p.goal) bits.push(p.goal === "prevention" ? "aiming for prevention" : p.goal === "recovery" ? "focused on recovery" : "dealing with an existing concern");
  return bits.join(", ");
}

function activityPhrase(a: string): string {
  if (/^run|jog|marathon/.test(a)) return "running regularly";
  if (/desk|sit|sedentary/.test(a)) return "mostly sitting";
  if (/on my feet|manual/.test(a)) return "on your feet a lot";
  return `active with ${a}`;
}

/** The 1–2 most useful clarifying questions for slots we don't know yet. */
export function missingSlotQuestions(p: PeppyProfile, max = 2): string[] {
  const qs: string[] = [];
  if (!p.duration || !p.area)
    qs.push(
      p.area
        ? `How long has it been bothering you, and is it worse with movement or at rest?`
        : "Which joint is it, and how long has it been bothering you?"
    );
  if (!p.goal)
    qs.push("Is your goal prevention, recovery after activity, or support for something you already feel?");
  if (!p.age || !p.activity)
    qs.push("How old are you, and how active — running, gym, mostly sitting?");
  return qs.slice(0, max);
}
