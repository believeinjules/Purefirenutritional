/**
 * Pepita curated ("gold") answers with progressive disclosure (v11).
 *
 *  L1 SHOW (default): ≤1 opening sentence + ≤2 explanation sentences (≤75 generated words in total),
 *     1–3 product cards (≤12-word relevance line each), ≤2 research links, 1 follow-up + 2–3 chips.
 *     No directions in the text unless asked; no sequences or protocols.
 *  L2 EXPLORE: the card / protocol details the shopper taps open (rendered by the client, never auto-expanded).
 *  L3 DEEP DIVE: only when explicitly asked: conclusion first, then the evidence or a month-by-month
 *     protocol timeline taken from a real manufacturer document (educational, not clinically validated).
 *
 * Red-flag questions put the medical advice first and show no product cards.
 * Every product id must be sold (in the catalog); unsold protocol items are listed as "not sold by Pure Fire".
 */
import type { DosingFacts, PeppyProduct, PeppyProductSuggestion, ProtocolTimeline, PeppyResponse, SafetyNotice } from "./types.js";
import { pepitaDirections } from "../product-facts.js";

export type DisclosureLevel = "show" | "explore" | "deep";

export interface GoldProduct {
  id: string;
  /** ≤12 words: why this product, for this question. */
  relevance: string;
}

export interface GoldAnswer {
  id: string;
  patterns: RegExp[];
  level: DisclosureLevel;
  intent: "symptom" | "product-info" | "dosing" | "comparison" | "protocol" | "research" | "combining" | "red-flag" | "efficacy";
  summary: string;
  products: GoldProduct[];
  /** Registry source ids (≤2 shown as links). */
  sourceIds: string[];
  followUp?: string;
  chips: string[];
  safety?: SafetyNotice;
  /** L2/L3 sections shown under "Learn more" (collapsed). */
  learnMore?: { heading: string; body: string }[];
  protocols?: ProtocolTimeline[];
  /** Dosing questions: compact facts block shown before any product card. */
  dosingFacts?: DosingFacts;
  /** Extra contextual follow-up (0–2 total). */
  followUp2?: string;
}

const MEDICAL_FIRST = (title: string, body: string): SafetyNotice => ({ level: "caution", title, body });

/** Source documents (Julia's PDFs). Page numbers are the printed page numbers in the PDF. */
const CAP_2025 = "Peptides, “Complex application of products” (2025 edition)";
const NOT_FOUND = "Not found in the source documents (2025 “Complex application of products”, 2027 Cytomax Combined Use Guide, Peptides for Sports and Fitness).";

/**
 * Julia's BRIEF heart course (2026-10-14). Kept exactly as briefed; every month/item that differs from
 * the published source carries a visible "Differs from the published source" note (never silently corrected).
 * Full table: /workspace/pf-protocol-discrepancies.md.
 */
export const CARDIO_COURSE: ProtocolTimeline = {
  id: "cardio-4-month",
  name: "Four-month heart and blood-vessel course",
  goal: "Support for the heart muscle and blood vessels",
  source: `Julia's brief, checked against ${CAP_2025}, “Atherosclerosis, arterial hypertension, cardiopsychoneurosis”, p. 6`,
  duration: "4 months",
  includes: ["Revilab SL 01", "Revilab SL 03", "Revilab ML 04", "Ventfort", "Chelohart", "Olecap", "Canacor", "Vedomir"],
  note: "Manufacturer-published educational reference, not a clinically validated regimen. The source writes it for people with diagnosed cardiovascular conditions. Course schedules can differ from each product's label.",
  phases: [
    { label: "Month 1", discrepancy: "The source's month 1 also includes Previn, Complex 3D and Vladonix (or Vladonix Lingual), which the brief leaves out.", items: [
      { name: "Revilab SL 01", productId: "revilab-sl-01", sourceDirections: "4–6 drops under the tongue in the first half of the day (p. 6)" },
      { name: "Revilab SL 03", productId: "revilab-sl-03", sourceDirections: "8 drops in the morning, every other day (p. 6)" },
    ] },
    { label: "Month 2", discrepancy: "The source's month 2 also includes Vladonix, Pinealon or Cerluten, Mesotel Ultra and Prime Peptide Omega.", items: [
      { name: "Revilab ML 04", productId: "revilab-ml-04", sourceDirections: "1 capsule in the morning, every third day (p. 6)" },
      { name: "Ventfort", productId: "ventfort", orWith: [{ name: "Vesugen", productId: "vesugen" }], sourceDirections: "1 capsule in the morning before meals (p. 6, listed as “Vesugen/Ventfort”: either one)" },
      { name: "Chelohart", productId: "chelohart", sourceDirections: "1 capsule in the morning before meals (p. 7, months 2–3)", discrepancy: "On p. 6 Chelohart appears only in month 3, as Chelohart Lingual (10 drops under the tongue). The capsule in months 2–3 is from the coronary-rehabilitation table, p. 7; months 1–2 in the cardiac-insufficiency table, p. 10." },
      { name: "Olecap", productId: "olecap", sourceDirections: "1 capsule 2 times a day during meals (p. 6, month 4)", discrepancy: "On p. 6 Olecap is in month 4, not month 2 (p. 7 places it in month 1)." },
    ] },
    { label: "Month 3", discrepancy: "The source's month 3 is Ventfort, Chelohart and Cerluten Lingual (10 drops each), Mesotel Neo, Adestab and Prime Peptide Omega; it has no Olecap.", items: [
      { name: "Olecap", productId: "olecap", sourceDirections: "1 capsule 2 times a day during meals (p. 6, month 4)", discrepancy: "Not in the source's month 3 (p. 6 lists it in month 4)." },
    ] },
    { label: "Month 4", discrepancy: "The source's month 4 is Adestab, Canacor, Olecap and Calcium Complex.", items: [
      { name: "Canacor", productId: null, sourceDirections: "1 teaspoon in the morning before meals; use with caution in atrial fibrillation (p. 6)" },
      { name: "Vedomir", productId: null, notFound: true, sourceDirections: null, discrepancy: NOT_FOUND },
    ] },
  ],
};

/** Julia's BRIEF women's / menopause course: SL 10 in month 1, then ML 08 in month 2. */
export const MENOPAUSE_COURSE: ProtocolTimeline = {
  id: "menopause-2-month",
  name: "Women's menopause-transition course",
  goal: "Support for the female reproductive and neuroendocrine systems",
  source: `Julia's brief, checked against ${CAP_2025}, “Climacteric syndrome”, p. 62`,
  duration: "2 months",
  includes: ["Revilab SL 10", "Revilab ML 08"],
  note: "Manufacturer-published educational reference, not a clinically validated regimen. Course schedules can differ from each product's label.",
  phases: [
    { label: "Month 1", discrepancy: "The p. 62 course runs 4 months: months 1–2 are Endoluten, Zhenoluten, Femalin, Revilab SL 04, Prime Peptide Collagen or Revilab Elements or Calcium Complex, Vladonix and Revilab ML 08; SL 10 comes in months 3–4. The brief's order (SL 10 first, ML 08 later) matches the pelvic-floor table on p. 64 (SL 10 month 1, ML 08 month 4), a different context.", items: [
      { name: "Revilab SL 10", productId: "revilab-sl-10", sourceDirections: "4–6 drops under the tongue in the morning (p. 62, months 3–4)", discrepancy: "p. 62 places SL 10 in months 3–4, not month 1." },
    ] },
    { label: "Month 2", discrepancy: "p. 62 months 3–4 also include Mesotel Neo, Olecap, Mamiton, Temero / Genero and Calcium Complex.", items: [
      { name: "Revilab ML 08", productId: "revilab-ml-08", sourceDirections: "1 capsule in the morning, every third day (p. 62, months 1–2)", discrepancy: "p. 62 places ML 08 in months 1–2 (taken alongside the other month 1–2 products), not after SL 10." },
    ] },
  ],
};

export const PREVENTION_ML_COURSE: ProtocolTimeline = {
  id: "prevention-revilab-ml",
  name: "Premature-ageing prevention course (Revilab ML)",
  goal: "Preventive maintenance; the source suggests 2–3 times a year",
  source: `${CAP_2025}, “Premature aging prevention (Revilab ML)”, p. 74`,
  duration: "3 stages, about 90 days",
  includes: ["Revilab ML 01–09", "Revilab Elements", "Complex 3D"],
  note: "Manufacturer-published educational reference, not a clinically validated regimen. Its schedules differ from the single-product labels.",
  phases: [
    { label: "Stage 1 (days 1–60)", items: [
      { name: "Revilab ML 04", productId: "revilab-ml-04", sourceDirections: "1 capsule in the morning, once every 2 days, 60 days (p. 74)" },
      { name: "Revilab ML 01", productId: "revilab-ml-01", sourceDirections: "1 capsule in the morning, once every 2 days, 60 days (p. 74)" },
      { name: "Revilab ML 03", productId: "revilab-ml-03", sourceDirections: "1 capsule in the morning daily, days 1–30 (p. 74)" },
      { name: "Revilab ML 02", productId: "revilab-ml-02", sourceDirections: "1 capsule in the morning daily, days 1–30 (p. 74)" },
      { name: "Revilab Elements", productId: "revilab-pro-elements", sourceDirections: "1 tablet 3 times a day (p. 74)" },
      { name: "Complex 3D", productId: "complex-3d", sourceDirections: "1 capsule morning and evening (p. 74)" },
    ] },
    { label: "Stage 2 (from day 31)", items: [
      { name: "Revilab ML 05", productId: "revilab-ml-05", sourceDirections: "1 capsule in the morning daily (p. 74)" },
      { name: "Revilab ML 06", productId: "revilab-ml-06", sourceDirections: "1 capsule in the morning daily (p. 74)" },
      { name: "Revilab ML 09", productId: "revilab-ml-09", sourceDirections: "1 capsule in the morning daily (p. 74)" },
    ] },
    { label: "Stage 3 (from day 61)", items: [
      { name: "Revilab ML 07 (men)", productId: "revilab-ml-07", orWith: [{ name: "Revilab ML 08 (women)", productId: "revilab-ml-08" }], sourceDirections: "1 capsule in the morning once every 2 days (p. 74)" },
    ] },
  ],
};

export const GOLD: GoldAnswer[] = [
  // ── Red flags: medical advice first, no product cards ─────────────────────
  {
    id: "rf-painful-urination", level: "show", intent: "red-flag",
    patterns: [/\b(painful|burning|pain(?:ful)? when|hurts? when|stings? when)\b.*\b(urinat\w*|pee\w*|urine)\b|\b(urinat\w*|peeing)\b.*\b(hurts?|pain\w*|burn\w*)\b/i],
    summary: "Pain or burning when you urinate should be checked by a doctor first, ideally within a day or two, because it often needs a simple urine test and sometimes prescription treatment. Get care the same day if you also have fever, back or side pain, or blood in your urine. Once you've been checked, I can explain the bladder peptides we carry.",
    products: [], sourceIds: [],
    safety: MEDICAL_FIRST("See a doctor first", "Painful urination needs a medical check before any supplement."),
    followUp: "Would you like questions to bring to your doctor?",
    chips: ["What should I ask my doctor?", "Which products support the bladder?"],
  },
  {
    id: "rf-blood-in-urine", level: "show", intent: "red-flag",
    patterns: [/\b(blood|bloody|red|pink)\b.{0,20}\b(urine|pee|wee)\b|\bhaematuria|hematuria\b/i],
    summary: "Blood in your urine always needs a doctor's assessment, even if it happened once and doesn't hurt, so please book an appointment promptly. Go to urgent care today if you also feel unwell, have fever, severe pain or can't pass urine. A supplement isn't the right first step here.",
    products: [], sourceIds: [],
    safety: MEDICAL_FIRST("See a doctor first", "Blood in the urine should be checked by a doctor before anything else."),
    followUp: "Would you like questions to bring to your doctor?",
    chips: ["What should I ask my doctor?"],
  },
  {
    id: "rf-severe-dizziness", level: "show", intent: "red-flag",
    patterns: [/\b(severe|sudden|bad|extreme|constant|really)\b.{0,15}\b(dizz\w*|vertigo|lightheaded\w*|faint\w*)\b|\b(dizz\w*|vertigo)\b.{0,30}\b(fall|faint|can'?t stand|won'?t stop)\b/i],
    summary: "Severe or sudden dizziness needs medical care first. Call 911 if it comes with chest pain, a racing heartbeat, fainting, slurred speech, weakness or numbness on one side, or a sudden severe headache. Otherwise, see a doctor soon and sit or lie down until it passes.",
    products: [], sourceIds: [],
    safety: MEDICAL_FIRST("Medical care first", "Severe dizziness is a reason to see a doctor before any supplement."),
    followUp: "Has your doctor already checked this?",
    chips: ["What should I ask my doctor?"],
  },
  {
    id: "rf-new-chest", level: "show", intent: "red-flag",
    patterns: [/\b(new|sudden)\b.{0,20}\b(chest|heart)\b.{0,20}\b(symptom\w*|pain|pressure|tight\w*|flutter\w*|palpitation\w*|racing)\b|\bpalpitations?\b|\bheart (?:is )?racing\b|\bchest (?:tightness|pressure)\b/i],
    summary: "New chest or heart symptoms need a doctor before any supplement. Call 911 now if you have chest pain or pressure, shortness of breath, fainting, sweating or pain spreading to your arm, jaw or back. If it has passed, contact your doctor today.",
    products: [], sourceIds: [],
    safety: { level: "urgent", title: "Get medical help", body: "New chest or heart symptoms: call 911 if they are happening now." },
    chips: [],
  },

  // ── Endoluten ─────────────────────────────────────────────────────────────
  {
    id: "endoluten-dosing", level: "show", intent: "dosing",
    patterns: [/\bhow (?:do|should|can) i take endoluten\b|\bendoluten\b.*\b(dos\w*|how (?:much|many|often|to take)|directions|schedule)\b|\b(dos\w*|how (?:much|many|often))\b.*\bendoluten\b/i],
    summary: "Endoluten is a pineal gland peptide complex studied for supporting the gland's own melatonin rhythm, rather than adding melatonin. It is not taken daily.",
    dosingFacts: { product: "Endoluten", dose: "1 capsule every 3 days", timing: "In the morning or at midday", course: "20 days to 2 months", source: "Manufacturer directions (peptid.ru); the 20- and 60-capsule packs are the same complex" },
    products: [{ id: "endoluten", relevance: "Pineal gland peptide complex." }],
    sourceIds: [],
    chips: [],
  },
  {
    id: "endoluten-vs-pinealon", level: "show", intent: "comparison",
    patterns: [/\bdifference\b.*\b(endoluten\b.*\bpinealon|pinealon\b.*\bendoluten)\b/i, /\bendoluten\b.*\b(vs\.?|versus|or|compared?|difference)\b.*\bpinealon\b|\bpinealon\b.*\b(vs\.?|versus|or|compared?|difference)\b.*\bendoluten\b/i],
    summary: "Endoluten is a natural pineal gland complex, researched for the gland's own melatonin rhythm; Pinealon is a synthesized brain peptide complex (AC-5), researched for nerve-cell protection. Choose by target: body clock and pineal function, or brain and nervous system.",
    products: [
      { id: "endoluten", relevance: "Pineal gland: melatonin rhythm and body clock." },
      { id: "pinealon", relevance: "Brain and nervous system peptide complex (AC-5)." },
    ],
    sourceIds: ["topic:sleep"],
    followUp: "Is your main goal sleep timing or focus?",
    chips: ["How do I take Endoluten?", "Can I take these together?"],
  },
  {
    id: "endoluten-what", level: "show", intent: "product-info",
    patterns: [/\b(what(?:'s| is)|tell me about|explain)\b.{0,10}\bendoluten\b/i],
    summary: "Endoluten is a natural peptide complex from the pineal gland, the gland that releases melatonin at night. Researchers have investigated pineal peptides for the gland's own melatonin rhythm, mostly with injectable extracts; Endoluten itself has no published human trials.",
    products: [{ id: "endoluten", relevance: "Pineal gland peptide complex for the body's daily rhythm." }],
    sourceIds: ["topic:sleep"],
    followUp: "Would directions or the research help most?",
    chips: ["How do I take Endoluten?", "Endoluten vs Pinealon", "Is Endoluten the same as melatonin?"],
  },

  // ── Symptom / body-system L1 answers ──────────────────────────────────────
  {
    id: "vertigo", level: "show", intent: "red-flag",
    patterns: [/\b(vertigo|off[- ]balance|balance (?:problems?|issues?)|(?:feel(?:ing)?|get(?:ting)?) dizzy|dizziness|unsteady)\b/i],
    summary: "Vertigo and balance problems have many causes, from the inner ear to blood pressure or medicines, so have a doctor find the reason first. Call 911 for sudden severe vertigo with headache, weakness, numbness, slurred speech or vision loss. Some peptides target the brain, nerves and blood vessels involved in balance.",
    products: [
      { id: "cerluten", relevance: "Brain and nervous system peptide complex." },
      { id: "ventfort", relevance: "Blood-vessel peptide complex (microcirculation)." },
      { id: "pinealon", relevance: "Brain peptide complex (AC-5)." },
    ],
    sourceIds: [],
    safety: MEDICAL_FIRST("See a doctor first", "Get balance problems checked before choosing a supplement."),
    learnMore: [
      { heading: "Other supportive approaches", body: "Hydration, regular sleep and stress management, and inner-ear (vestibular) exercises when a clinician recommends them." },
      { heading: "When to see a doctor", body: "New, worsening or recurring vertigo, hearing loss or ringing in one ear, falls, or vertigo after a head injury." },
    ],
    followUp: "Is it spinning, or feeling unsteady?",
    chips: [],
  },
  {
    id: "sleep", level: "show", intent: "symptom",
    patterns: [/\b(can'?t|cannot|trouble|problems?|struggl\w*|hard to)\b.{0,15}\bsleep\w*\b|\binsomnia\b|\bsleep (?:better|well|poorly|badly|support)\b|\bwak(?:e|ing) up (?:at night|a lot|often)\b/i],
    summary: "Endoluten is our closest match: researchers have investigated pineal peptides for supporting the gland's own melatonin rhythm, rather than adding melatonin. Pinealon is a secondary option aimed at the brain and nervous system.",
    products: [
      { id: "endoluten", relevance: "Pineal gland complex studied for the melatonin rhythm." },
      { id: "pinealon", relevance: "Brain peptide complex; direct sleep evidence is limited." },
    ],
    sourceIds: ["topic:sleep"],
    followUp: "Is it falling asleep or waking at night?",
    chips: ["How do I take Endoluten?", "Endoluten vs Pinealon", "Is it the same as melatonin?"],
    learnMore: [{ heading: "Endoluten vs melatonin", body: "A melatonin supplement adds the hormone directly. Endoluten contains no melatonin; the idea researchers have investigated is a slower effect on the pineal gland's own function, based on small melatonin-level studies rather than sleep trials." }],
  },
  {
    id: "joints", level: "show", intent: "symptom",
    patterns: [/\bjoints?\b|\bknees?\b.{0,15}\b(ache|achy|pain|stiff\w*|sore)\b|\bcartilage\b/i],
    summary: "Sigumir is a cartilage and bone peptide complex, Prime Peptide Joints pairs short peptides with glucosamine and MSM, and Revilab SL 04 is a drop-under-the-tongue musculoskeletal formula. The difference is single-tissue capsules, a daily nutrient blend, or a sublingual complex.",
    products: [
      { id: "sigumir", relevance: "Cartilage and bone peptide complex, taken as a course." },
      { id: "prime-peptide-joints", relevance: "Peptides plus glucosamine and MSM, taken daily." },
      { id: "revilab-sl-04", relevance: "Sublingual musculoskeletal peptide complex." },
    ],
    sourceIds: ["topic:joints"],
    followUp: "Is it one joint, or general stiffness?",
    chips: ["Sigumir vs Cartalax", "Can I take these together?"],
  },
  {
    id: "bladder", level: "show", intent: "symptom",
    patterns: [/\bbladder\b|\burinary (?:support|health|tract)\b|\bpee(?:ing)? (?:a lot|often|at night)\b/i],
    summary: "Chitomur is a natural bladder peptide complex taken as capsules, and Revilab SL 08 is a sublingual urinary-system formula. Pain, burning or blood in the urine should be checked by a doctor first.",
    products: [
      { id: "chitomur", relevance: "Bladder peptide complex, capsules." },
      { id: "revilab-sl-08", relevance: "Sublingual urinary-system peptide complex." },
    ],
    sourceIds: [],
    followUp: "Is this general support or a new symptom?",
    chips: ["How do I take Chitomur?", "Chitomur vs Revilab SL 08"],
  },
  {
    id: "prostate", level: "show", intent: "symptom",
    patterns: [/\bprostate\b/i],
    summary: "Libidon is a natural prostate peptide complex, and Revilab SL 09 is a sublingual men's reproductive formula. New urinary symptoms, or a PSA question, belong with your doctor before choosing a supplement.",
    products: [
      { id: "libidon", relevance: "Prostate peptide complex, capsules." },
      { id: "revilab-sl-09", relevance: "Sublingual men's reproductive peptide complex." },
    ],
    sourceIds: [],
    followUp: "Is this general upkeep or a new symptom?",
    chips: ["How do I take Libidon?", "What should a 50-year-old man take?"],
  },
  {
    id: "brain", level: "show", intent: "symptom",
    patterns: [/\b(brain|memory|focus|concentrat\w*|brain fog|cognit\w*)\b/i],
    summary: "Cerluten is a natural brain peptide complex, Pinealon a synthesized brain peptide complex (AC-5), and Prime Peptide Brain a daily peptide formula with magnesium, choline and GABA. Researchers have investigated brain peptides mainly in cell and animal work.",
    products: [
      { id: "cerluten", relevance: "Natural brain peptide complex, taken as a course." },
      { id: "pinealon", relevance: "Synthesized brain peptide complex (AC-5)." },
      { id: "prime-peptide-brain", relevance: "Daily peptide formula with magnesium, choline and GABA." },
    ],
    sourceIds: ["topic:brain"],
    followUp: "Day-to-day focus, or memory changes?",
    chips: ["Cerluten vs Pinealon", "Can I take these together?"],
  },
  {
    id: "liver", level: "show", intent: "symptom",
    patterns: [/\bliver\b/i],
    summary: "Svetinorm is a natural liver peptide complex, Ovagen a synthesized complex for the liver and gastrointestinal tract, and Revilab SL 05 a sublingual digestive formula covering liver, pancreas and stomach.",
    products: [
      { id: "svetinorm", relevance: "Natural liver peptide complex." },
      { id: "ovagen", relevance: "Liver and gastrointestinal peptide complex." },
      { id: "revilab-sl-05", relevance: "Sublingual liver, pancreas and stomach complex." },
    ],
    sourceIds: ["topic:liver"],
    followUp: "General upkeep, or did a doctor mention your liver tests?",
    chips: ["Svetinorm vs Ovagen", "Can I take these together?"],
  },
  {
    id: "menopause", level: "show", intent: "symptom",
    patterns: [/\b(menopaus\w*|perimenopaus\w*|hot flash\w*|hot flush\w*|climacteric)\b/i],
    summary: "Zhenoluten is a natural ovarian peptide complex; Revilab ML 08 and SL 10 are women's formulas for the reproductive and neuroendocrine systems, as capsules or drops. Ask for the menopause course to see how they're sequenced.",
    products: [
      { id: "zhenoluten", relevance: "Ovarian peptide complex, capsules." },
      { id: "revilab-ml-08", relevance: "Women's capsule formula: reproductive and neuroendocrine." },
      { id: "revilab-sl-10", relevance: "Women's sublingual formula, used later in the course." },
    ],
    sourceIds: [],
    followUp: "Are you on hormone therapy or other medicines?",
    chips: ["Show me the menopause course", "Can I take these together?"],
  },

  // ── Combining, families, efficacy ─────────────────────────────────────────
  {
    id: "combining", level: "show", intent: "combining",
    patterns: [/\b(take|use|combine)\b.{0,25}\b(together|at the same time|combin\w*|stack)\b|\bcan i (?:combine|stack)\b/i],
    summary: "Manufacturers do describe combining peptides, usually in sequence, one body system per month, rather than all at once. Their course schedules can differ from each label, and nobody has published trials of the combinations, so check yours with your doctor, especially if you take medicines.",
    products: [],
    sourceIds: [],
    followUp: "Which products are you thinking of combining?",
    chips: ["Show me a preventive course", "Do I take every peptide daily?"],
  },
  {
    id: "families", level: "show", intent: "comparison",
    patterns: [/\bcytomax\w*\b.*\bcytogen\w*\b|\bcytogen\w*\b.*\bcytomax\w*\b|\b(cytomax|cytogen)\w*\b.*\brevilab\b/i],
    summary: "Cytomaxes are natural peptide complexes extracted from young animal organs; Cytogens are synthesized copies of a few key short peptides; Revilab formulas blend several peptides with vitamins and plant extracts, as capsules (ML) or under-the-tongue drops (SL).",
    products: [],
    sourceIds: [],
    followUp: "Which body system are you interested in?",
    chips: ["Do peptide bioregulators work?", "Endoluten vs Pinealon"],
  },
  {
    id: "efficacy", level: "show", intent: "efficacy",
    patterns: [/\b(do|does|will)\b.{0,20}\b(peptides?|bioregulators?|khavinson|they|these|it)\b.{0,15}\b(work|actually work|effective|do anything)\b/i],
    summary: "Possibly, but the evidence is early. Researchers have shown short peptides are active in cells and ageing animals, and small human studies used injectable preparations; independent controlled trials of the oral products are still missing.",
    products: [],
    sourceIds: ["topic:khavinson-evidence"],
    followUp: "Want the strongest studies, or a product for a goal?",
    chips: ["Epitalon research", "Cytomax vs Cytogen vs Revilab"],
  },

  // ── L3 deep dives (explicit asks) ─────────────────────────────────────────
  {
    id: "cardio-preventive", level: "explore", intent: "protocol",
    patterns: [/\bprevent\w*\b.{0,30}\b(cardio\w*|heart|vascular|blood vessels?)\b.{0,20}\b(protocol|course|plan|program\w*)?|\b(cardio\w*|heart|vascular)\b.{0,20}\bprevent\w*\b/i],
    summary: "For prevention, the manufacturer's documented option is its general premature-ageing course, which starts with Revilab ML 04 for the heart and vessels; its dedicated four-month cardiovascular course is written for people with a diagnosed condition. Tap the course to see each stage.",
    products: [
      { id: "revilab-ml-04", relevance: "Heart-muscle and vascular peptides; starts the preventive course." },
      { id: "ventfort", relevance: "Natural blood-vessel peptide complex." },
    ],
    sourceIds: [],
    protocols: [PREVENTION_ML_COURSE],
    followUp: "Want the full four-month cardiovascular course too?",
    chips: ["Show me the full four-month course", "Can I take these together?"],
  },
  {
    id: "heart-menopause", level: "deep", intent: "protocol",
    patterns: [/\b(heart|cardio\w*|vascular)\b.*\b(menopaus\w*|women)\b|\b(menopaus\w*)\b.*\b(heart|cardio\w*|vascular)\b/i],
    summary: "Here are the two manufacturer-published courses: a four-month heart and blood-vessel course and a two-month menopause-transition course. Each is shown as briefed, with notes where it differs from the published source. They're educational references, not clinically validated regimens.",
    products: [],
    sourceIds: [],
    protocols: [CARDIO_COURSE, MENOPAUSE_COURSE],
    followUp: "Do you take any heart or hormone medicines?",
    chips: [],
  },
  {
    id: "cardio-four-month", level: "deep", intent: "protocol",
    patterns: [/\b(full|whole|complete|4|four)[- ]?(month)?\b.{0,15}\b(month|course|protocol)\b.{0,25}(cardio|heart|vascular)?|\bfour[- ]month\b|\b4[- ]month\b|\bheart\b.{0,20}\b(protocol|course)\b/i],
    summary: "Here is the four-month heart and blood-vessel course, month by month. It follows the course as briefed; where it differs from the published source, the month shows a note. It's an educational reference written for people with diagnosed conditions, not a validated regimen.",
    products: [],
    sourceIds: [],
    protocols: [CARDIO_COURSE],
    followUp: "Do you take any heart or blood-thinning medicines?",
    chips: [],
  },
  {
    id: "menopause-course", level: "deep", intent: "protocol",
    patterns: [/\b(menopaus\w*|climacteric|women'?s)\b.{0,15}\b(course|protocol|plan)\b|\bshow me the menopause course\b/i],
    summary: "Here is the women's menopause-transition course: Revilab SL 10 in month 1, then Revilab ML 08 in month 2. The published source orders these differently, so each month shows a note. It's an educational reference, not a validated regimen.",
    products: [],
    sourceIds: [],
    protocols: [MENOPAUSE_COURSE],
    followUp: "Are you on hormone therapy?",
    chips: [],
  },
  {
    id: "epitalon-research", level: "deep", intent: "research",
    patterns: [/\bepitalon\b.{0,20}\b(research|studies|study|evidence|science|trials?)\b|\b(research|studies|evidence)\b.{0,20}\bepitalon\b/i],
    summary: "Bottom line: Epitalon (AEDG) is well studied in cells and animals but has only small human studies, almost all from one research network. In cells it switched on telomerase; in older adults, pineal preparations shifted night-time melatonin. Pure Fire doesn't sell Epitalon; Endoluten is the related natural pineal complex.",
    products: [{ id: "endoluten", relevance: "Natural pineal complex in which the AEDG sequence was detected." }],
    sourceIds: ["topic:epitalon"],
    learnMore: [
      { heading: "Strongest evidence", body: "Cell studies: AEDG added to human fibroblasts switched on telomerase and extended their divisions. Human: small studies of injectable pineal preparations in older adults measured melatonin and other markers." },
      { heading: "Limitations", body: "Most papers come from one research network, many in Russian, with small samples and no independent controlled trials of oral products." },
    ],
    followUp: "Would you like Endoluten's directions?",
    chips: ["How do I take Endoluten?", "Do peptide bioregulators work?"],
  },
];

export function matchGold(message: string): GoldAnswer | null {
  const m = message.trim();
  // Red flags win over everything else, then specific asks before broad symptom answers.
  const order = ["red-flag", "dosing", "comparison", "protocol", "research", "product-info", "combining", "efficacy", "symptom"];
  for (const intent of order)
    for (const g of GOLD) if (g.intent === intent && g.patterns.some(p => p.test(m))) return g;
  return null;
}

export const L1_MAX_WORDS = 75;
export const L3_MAX_WORDS = 90;
export const RELEVANCE_MAX_WORDS = 12;
export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function goldResponse(
  g: GoldAnswer,
  catalog: Map<string, PeppyProduct>,
  enrich: (s: PeppyProductSuggestion) => PeppyProductSuggestion,
  sources: (ids: string[]) => PeppyResponse["research"]
): PeppyResponse {
  const products = g.products
    .map(gp => {
      const product = catalog.get(gp.id);
      return product ? enrich({ product, why: gp.relevance, evidenceNote: "The finished product has no published trials." }) : null;
    })
    .filter((x): x is PeppyProductSuggestion => !!x);
  const sold = (id: string | null) => !!(id && catalog.has(id));
  const protocols = g.protocols?.map(pr => ({
    ...pr,
    phases: pr.phases.map(ph => ({
      ...ph,
      items: ph.items.map(it => ({
        ...it,
        sold: sold(it.productId),
        labelDirections: it.productId ? pepitaDirections(it.productId) : null,
        orWith: it.orWith?.map(o => ({ ...o, sold: sold(o.productId) })),
      })),
    })),
  }));
  return {
    mode: g.intent === "red-flag" && g.safety?.level === "urgent" ? "urgent" : "fallback",
    level: g.level,
    gold: g.id,
    summary: g.summary,
    sections: [],
    research: sources(g.sourceIds).slice(0, 2),
    safety: g.safety,
    learnMore: g.learnMore,
    protocols,
    dosingFacts: g.dosingFacts,
    followUps: [g.followUp, g.followUp2].filter((x): x is string => !!x).slice(0, 2),
    suggestions: [],
    products,
    showDisclaimer: true,
    topics: [g.id],
  };
}
