/**
 * Safety-first answers: emergencies, pregnancy, children, medicine replacement,
 * blood thinners / medicine interactions, combinations and side effects.
 * None of these responses carry product suggestions.
 */
import type { PeppyProduct, PeppyResponse, SafetyNotice } from "./types.js";
import { DISEASE_TERMS, type RedFlagKind } from "./claims.js";
import { capitalizeFirst, normalizeForMatch } from "./text.js";

type SafetyPart = Pick<
  PeppyResponse,
  "summary" | "sections" | "followUps" | "suggestions"
> & {
  sourceIds: string[];
  safety?: SafetyNotice;
  evidenceNote?: string;
};

const DEFAULT_SUGGESTIONS = [
  "How do peptide bioregulators work?",
  "Do Khavinson peptides actually work in humans?",
  "Which Pure Fire product for sleep?",
];

export function urgentResponse(kind: RedFlagKind): SafetyPart {
  const base = {
    sections: [] as PeppyResponse["sections"],
    followUps: [] as string[],
    suggestions: [] as string[],
    sourceIds: [] as string[],
  };
  if (kind === "crisis") {
    return {
      ...base,
      summary:
        "I'm really sorry you're going through this. You deserve support right now. In the US, call or text **988** (Suicide & Crisis Lifeline) — it's free, confidential and open 24/7. If you're in immediate danger, call **911** or go to the nearest emergency room. Outside the US, contact your local emergency number.",
      safety: {
        level: "urgent",
        title: "Please reach out now",
        body: "Call or text 988 in the US, or 911 if you might act on these thoughts. You don't have to handle this alone.",
      },
    };
  }
  if (kind === "overdose") {
    return {
      ...base,
      summary:
        "If someone has taken too much of any supplement or medicine, call **Poison Control at 1-800-222-1222** (US, 24/7) now, or **911** if they're drowsy, confused, having trouble breathing or have collapsed. Keep the bottle with you so you can read the label to them.",
      safety: {
        level: "urgent",
        title: "Act now",
        body: "Poison Control: 1-800-222-1222. Emergency: 911.",
      },
    };
  }
  const what: Record<Exclude<RedFlagKind, "crisis" | "overdose">, string> = {
    cardiac:
      "Chest pain or pressure can be a sign of a heart problem. **Call 911 (or your local emergency number) now** if it's happening at this moment, is severe, or comes with sweating, nausea, shortness of breath, fainting, or pain spreading to your arm, jaw or back.",
    stroke:
      "These can be signs of a stroke, where every minute matters. **Call 911 (or your local emergency number) now** — note the time the symptoms started.",
    breathing:
      "Trouble breathing needs urgent medical help. **Call 911 (or your local emergency number) now** if it's severe, getting worse, or your lips are turning blue.",
    allergy:
      "Swelling of the face, lips, tongue or throat can be a serious allergic reaction. **Call 911 (or your local emergency number) now**, and use an epinephrine auto-injector if you have one.",
    bleeding:
      "This kind of bleeding needs urgent medical assessment. **Call 911 (or your local emergency number) now** if it's heavy or you feel faint.",
    neuro:
      "Fainting or a seizure needs urgent medical assessment. **Call 911 (or your local emergency number) now** if someone is unconscious, the seizure lasts more than 5 minutes, or they're injured.",
  };
  return {
    ...base,
    summary: `${what[kind]} If symptoms started after taking a supplement, stop it and bring the label with you. If it has passed, contact your doctor today. This isn't something to troubleshoot with a supplement assistant.`,
    safety: {
      level: "urgent",
      title: "Seek medical care",
      body: "Call 911 for severe or ongoing symptoms. Don't drive yourself if you feel unwell.",
    },
  };
}

export function pregnancyResponse(): SafetyPart {
  return {
    summary:
      "There's no safety research on peptide bioregulators — or on most of the herbal formulas we sell — in pregnancy or breastfeeding, so the cautious answer is not to take them unless your obstetrician or midwife specifically approves. Several products act on hormone-related glands (pineal and melatonin, thyroid, reproductive), which is an extra reason for caution.",
    sections: [
      {
        heading: "What to do instead",
        body: "- Take the product label to your prenatal appointment and ask directly.\n- Prenatal basics with good evidence: folic acid (400 µg daily before and in early pregnancy) and anything your clinician prescribes.\n- Melatonin also lacks pregnancy and breastfeeding safety research (NCCIH).",
      },
    ],
    sourceIds: [
      "ref:medlineplus-pregnancy-medicines",
      "ref:nccih-melatonin",
      "ref:nccih-supplements-wisely",
    ],
    safety: {
      level: "caution",
      title: "Pregnancy and breastfeeding",
      body: "We don't suggest any Pure Fire products during pregnancy or breastfeeding. Please check with your obstetric provider.",
    },
    followUps: [],
    suggestions: DEFAULT_SUGGESTIONS,
    evidenceNote:
      "No pregnancy or breastfeeding safety data exist for these products.",
  };
}

export function pediatricResponse(): SafetyPart {
  return {
    summary:
      "We don't give doses or product suggestions for children or teenagers. Peptide bioregulators haven't been studied for safety in young people, and children's needs differ a lot by age and weight. Please ask your child's pediatrician before giving any supplement.",
    sections: [],
    sourceIds: ["ref:nccih-supplements-wisely", "ref:fda-supplements-qa"],
    safety: {
      level: "caution",
      title: "Children and teens",
      body: "No pediatric dosing is available for these products. Talk to your pediatrician.",
    },
    followUps: [],
    suggestions: DEFAULT_SUGGESTIONS,
  };
}

/** The condition named in a message, e.g. "diabetes", or null. */
export function namedCondition(message: string): string | null {
  const m = new RegExp(DISEASE_TERMS.source, "i").exec(
    normalizeForMatch(message)
  );
  return m ? m[0] : null;
}

/** "Can X cure/treat my <condition>?" — honest no, no products, point to care. */
export function diseaseResponse(message: string): SafetyPart {
  const condition = namedCondition(message);
  const it = condition ? condition : "a diagnosed condition";
  return {
    summary: `No supplement or peptide has been shown to cure or treat ${it}. That includes everything we sell — none of it is intended for that. ${condition ? capitalizeFirst(condition) : "A diagnosed condition"} needs care from your doctor, who can tell you which treatments have real evidence behind them.`,
    sections: [
      {
        heading: "What you can do",
        body: "- Keep following the treatment plan you and your doctor agreed on — don't stop or reduce prescribed medicines.\n- If you're interested in a supplement for general wellness, bring the label to your doctor or pharmacist so they can check it against your condition and medicines.\n- Be wary of any product or website that claims to cure or reverse a disease — that's a red flag, not a selling point.",
      },
    ],
    sourceIds: ["ref:nccih-supplements-wisely", "ref:fda-supplements-qa"],
    safety: {
      level: "caution",
      title: "Supplements aren't a treatment",
      body: "I won't suggest products for a medical condition. Please involve your doctor in any decision about supplements.",
    },
    followUps: [],
    suggestions: DEFAULT_SUGGESTIONS,
  };
}

export function drugReplacementResponse(): SafetyPart {
  return {
    summary:
      "Please don't stop or swap a prescribed medicine for a supplement on your own — stopping some medicines suddenly can be dangerous. Supplements, including ours, aren't a substitute for prescribed care. If you're unhappy with a medicine (side effects, cost, or wanting a different approach), that's a really good conversation to have with your prescriber; they can often adjust it safely.",
    sections: [
      {
        heading: "If you'd like to add a supplement alongside your treatment",
        body: "Bring the label to your prescriber or pharmacist so they can check for interactions first. I'm happy to explain what the research does and doesn't show about any ingredient.",
      },
    ],
    sourceIds: ["ref:nccih-supplements-wisely", "ref:fda-supplements-qa"],
    safety: {
      level: "caution",
      title: "Keep taking prescribed medicines",
      body: "Don't change prescription medicines without your prescriber.",
    },
    followUps: [],
    suggestions: DEFAULT_SUGGESTIONS,
  };
}

const RISK_INGREDIENTS: { label: string; pattern: RegExp; note: string }[] = [
  {
    label: "omega-3 / fish oil",
    pattern: /omega[- ]?3|fish oil|salmon oil|epa\b|dha\b/i,
    note: "can have antiplatelet effects in large amounts",
  },
  {
    label: "ginseng",
    pattern: /ginseng|panax/i,
    note: "may affect clotting and blood sugar",
  },
  {
    label: "resveratrol",
    pattern: /resveratrol/i,
    note: "has antiplatelet activity in lab studies",
  },
  {
    label: "vitamin E",
    pattern: /vitamin e\b|vitamins? (?:[a-z0-9, ]+ )?and e\b|tocopherol/i,
    note: "can add to bleeding risk in larger amounts",
  },
  {
    label: "glucosamine / chondroitin",
    pattern: /glucosamine|chondroitin/i,
    note: "has been reported to raise INR with warfarin",
  },
  { label: "ginkgo", pattern: /ginkgo/i, note: "may increase bleeding risk" },
];

function productsContaining(
  pattern: RegExp,
  catalog: Map<string, PeppyProduct>
): string[] {
  const names: string[] = [];
  for (const p of Array.from(catalog.values())) {
    const hay = [p.name, p.summary, ...p.ingredients].join(" ");
    if (pattern.test(hay)) names.push(p.name);
  }
  return names;
}

export function bloodThinnerResponse(
  catalog: Map<string, PeppyProduct>,
  mentioned: PeppyProduct[]
): SafetyPart {
  const lines = RISK_INGREDIENTS.map(r => {
    const names = productsContaining(r.pattern, catalog).slice(0, 5);
    // Ingredient caution and product names in separate sentences, so the claim sanitiser
    // never reads a product name next to a health-risk phrase as a product claim.
    return names.length
      ? `- **${r.label}** — ${r.note}. Found in: ${names.join(", ")}.`
      : null;
  }).filter((l): l is string => !!l);
  const asked = mentioned[0];
  const askedLine = asked
    ? `For ${asked.name} specifically: ${
        RISK_INGREDIENTS.some(r =>
          r.pattern.test(
            [asked.name, asked.summary, ...asked.ingredients].join(" ")
          )
        )
          ? "it contains at least one ingredient on that list. Check with your anticoagulation clinician first."
          : "none of its listed ingredients are on that list. It has also never been studied alongside anticoagulants, so the risk is unknown."
      }`
    : "";
  return {
    summary:
      "Peptide bioregulators themselves have no published interaction studies with blood thinners — that means the risk is unknown, not that it's zero. The clearer concerns are several non-peptide ingredients that can affect bleeding or clotting tests. Check with whoever manages your anticoagulant before starting anything new.",
    sections: [
      {
        heading: "Ingredients to flag in our catalog",
        body:
          lines.join("\n") ||
          "None of our listed ingredients are on the common bleeding-risk list.",
      },
      ...(askedLine ? [{ body: askedLine }] : []),
      {
        heading: "If you and your clinician decide to go ahead",
        body: "- Start one product at a time.\n- On warfarin, ask whether to recheck your INR after starting or stopping a supplement.\n- Watch for unusual bruising, nosebleeds, bleeding gums, pink or dark urine, or black stools — and call your clinician if they appear.\n- Melatonin should also only be used under medical supervision with blood thinners (NCCIH).",
      },
    ],
    sourceIds: [
      "ref:medlineplus-blood-thinners",
      "ref:ods-omega3",
      "ref:nccih-ginseng",
      "ref:nccih-melatonin",
    ],
    safety: {
      level: "caution",
      title: "Blood thinners",
      body: "We don't suggest starting any supplement on a blood thinner without your prescriber's OK.",
    },
    followUps: asked
      ? ["Which blood thinner do you take?"]
      : [
          "Which blood thinner do you take, and which product were you considering?",
        ],
    suggestions: [
      "Can I take Endoluten with melatonin?",
      "Do Khavinson peptides actually work in humans?",
      "How do peptide bioregulators work?",
    ],
    evidenceNote:
      "No interaction studies exist for peptide bioregulators; ingredient-level cautions come from NIH sources.",
  };
}

const PINEAL_PRODUCTS =
  /endoluten|pinalex|revilab sl 03|revilab ml 01|alvenorm/i;

export function combinationResponse(
  message: string,
  mentioned: PeppyProduct[]
): SafetyPart {
  const t = normalizeForMatch(message);
  const product = mentioned[0];
  const second = mentioned[1];
  const withMelatonin = /melatonin/.test(t);
  const withAlcohol = /alcohol|wine|beer|drink(?:ing|s)?\b/.test(t);
  const pName = product?.name ?? "these products";

  if (withMelatonin) {
    const pineal = product ? PINEAL_PRODUCTS.test(product.name) : false;
    return {
      summary: pineal
        ? `There are no studies of ${pName} combined with melatonin, so nobody can say for certain. Both work on the same system — ${pName} is described for the pineal gland and melatonin rhythm, and melatonin is the pineal hormone itself — so the main theoretical concern is extra drowsiness rather than a known dangerous interaction.`
        : `There are no studies of ${pName} combined with melatonin. Melatonin's main cautions are next-day grogginess and use with blood thinners or epilepsy medicines; ${product ? "nothing in its listed ingredients is a known melatonin interaction, but it hasn't been tested." : "tell me which product you mean and I'll check its ingredients."}`,
      sections: [
        {
          heading: "If you and your clinician decide to combine them",
          body: "- Start one at a time (a week or two apart) so you can tell what's doing what.\n- Use the lowest melatonin dose that works — many people do well on 0.5–3 mg, 1–2 hours before bed.\n- Don't drive or operate machinery if you feel groggy the next morning.\n- Check first if you take blood thinners, epilepsy medicines, sedatives or immune-suppressing drugs.",
        },
      ],
      sourceIds: ["ref:nccih-melatonin", "pmid:17969590", "pmid:23691095"],
      safety: {
        level: "info",
        title: "Worth knowing",
        body: "People taking blood thinners or with epilepsy should only use melatonin under medical supervision (NCCIH).",
      },
      followUps: [],
      suggestions: [
        "How can I sleep better?",
        "What is Epitalon?",
        "Is it safe with blood thinners?",
      ],
      evidenceNote: "No interaction studies exist for this combination.",
    };
  }
  if (withAlcohol) {
    return {
      summary: `There are no studies of ${pName} with alcohol. Alcohol itself works against most of what people take supplements for — it fragments sleep, strains the liver and raises blood pressure — so keeping it light is sensible either way.`,
      sections: [],
      sourceIds: ["ref:nccih-supplements-wisely"],
      followUps: [],
      suggestions: [
        "How can I sleep better?",
        "Do Khavinson peptides actually work in humans?",
      ],
      evidenceNote: "No interaction studies exist for this combination.",
    };
  }
  const pair = second ? `${pName} and ${second.name}` : pName;
  return {
    summary: `There are no published interaction studies for ${pair}${second ? "" : " with other supplements or medicines"}. The manufacturer often recommends combining bioregulators in protocols, but that's based on practice, not trials. If you take prescription medicines, check the full ingredient lists with your pharmacist first.`,
    sections: [
      {
        heading: "A sensible way to combine",
        body: "- Add one product at a time, a week or two apart.\n- Keep a simple log (sleep, energy, digestion, any side effects).\n- Stop and ask your clinician if anything unexpected happens.",
      },
    ],
    sourceIds: ["ref:nccih-supplements-wisely"],
    followUps: [],
    suggestions: [
      "Is it safe with blood thinners?",
      "Do Khavinson peptides actually work in humans?",
      "How do peptide bioregulators work?",
    ],
    evidenceNote: "No interaction studies exist for these combinations.",
  };
}

export function medicationsResponse(mentioned: PeppyProduct[]): SafetyPart {
  const p = mentioned[0];
  return {
    summary: `There are no published interaction studies between peptide bioregulators and prescription medicines, so the honest answer is "unknown". ${p ? `For ${p.name}, ` : ""}the practical step is to show the full ingredient list to your pharmacist or prescriber before starting — most interaction concerns come from the non-peptide ingredients (herbs, vitamins, omega-3s).`,
    sections: [
      {
        heading: "Specific situations to flag",
        body: "- **Immune-suppressing medicines** (transplant, autoimmune): thymus and immune-focused products are meant to influence immune function — check with your specialist first.\n- **Thyroid medicine:** don't use a thyroid-focused product as a substitute, and tell your doctor so they can watch your levels.\n- **Diabetes medicines:** ginseng may lower blood sugar.\n- **Sedatives or sleep medicines:** pineal/sleep products and melatonin may add drowsiness.\n- **Blood thinners:** omega-3s, ginseng, resveratrol and vitamin E need a check first.",
      },
    ],
    sourceIds: [
      "ref:nccih-supplements-wisely",
      "ref:fda-supplements-qa",
      "ref:nccih-ginseng",
    ],
    safety: {
      level: "caution",
      title: "Medicines",
      body: "Check new supplements with your pharmacist or prescriber, and tell them everything you take.",
    },
    followUps: p
      ? ["Which medicines do you take?"]
      : [
          "Which medicines do you take, and which product were you considering?",
        ],
    suggestions: [
      "Is it safe with blood thinners?",
      "Can I take Endoluten with melatonin?",
      "Do Khavinson peptides actually work in humans?",
    ],
    evidenceNote:
      "No drug-interaction studies exist for peptide bioregulators.",
  };
}

export function sideEffectsResponse(mentioned: PeppyProduct[]): SafetyPart {
  const p = mentioned[0];
  const animal =
    p &&
    /cytomax|calves|young animals|bovine|from young/i.test(
      p.summary + " " + p.ingredients.join(" ")
    );
  return {
    summary: `${p ? `${p.name} hasn't` : "Peptide bioregulators haven't"} been through systematic safety studies, so side-effect information is limited to the manufacturer's experience, which reports them as uncommon. That's reassuring but not the same as trial data.`,
    sections: [
      {
        heading: "What to watch for",
        body: `- Allergic reactions (rash, itching, swelling) — stop and seek care.\n- Digestive upset or headache in the first days.\n- Anything new after starting — keep a short log and stop if unsure.${animal ? "\n- This product is derived from animal (calf) tissue, which matters if you have related allergies or dietary restrictions." : ""}`,
      },
      {
        heading: "Report problems",
        body: "Tell your clinician, and you can report suspected supplement reactions to FDA's MedWatch program.",
      },
    ],
    sourceIds: ["ref:fda-supplements-qa", "ref:nccih-supplements-wisely"],
    followUps: [],
    suggestions: [
      "Is it safe with my medications?",
      "Do Khavinson peptides actually work in humans?",
      "How do peptide bioregulators work?",
    ],
    evidenceNote: "No systematic safety studies exist for these products.",
  };
}
