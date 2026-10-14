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
import type { PeppyProduct, PeppyProductSuggestion, ProtocolTimeline, PeppyResponse, SafetyNotice } from "./types.js";

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
  protocol?: ProtocolTimeline;
}

const MEDICAL_FIRST = (title: string, body: string): SafetyNotice => ({ level: "caution", title, body });

/** Source for the manufacturer protocol timelines (Julia's PDF, Peptides "Complex application of products", 2025). */
const CAP_2025 = "Peptides, “Complex application of products” (2025 edition)";

export const CARDIO_COURSE: ProtocolTimeline = {
  id: "cardio-4-month",
  name: "Four-month cardiovascular-system course",
  goal: "Manufacturer-described course for the heart and blood vessels",
  source: `${CAP_2025}, cardiovascular system section, p. 6`,
  duration: "4 months",
  note: "Educational: this is the manufacturer's published scheme, not a clinically validated regimen. In the source it is written for people with diagnosed cardiovascular conditions, so plan it with your doctor. Schedules here can differ from each product's label.",
  phases: [
    { label: "Month 1", items: [
      { name: "Revilab SL 01", productId: "revilab-sl-01", directions: "4–6 drops under the tongue in the first half of the day" },
      { name: "Revilab SL 03", productId: "revilab-sl-03", directions: "8 drops in the morning, every other day" },
      { name: "Previn", productId: "previn", directions: "1–2 tablets in the first half of the day, before meals" },
      { name: "Complex 3D", productId: "complex-3d", directions: "1 capsule morning and evening" },
      { name: "Vladonix", productId: "vladonix", directions: "2 capsules in the morning, every third day" },
    ] },
    { label: "Month 2", items: [
      { name: "Revilab ML 04", productId: "revilab-ml-04", directions: "1 capsule in the morning, every third day" },
      { name: "Vesugen or Ventfort", productId: "ventfort", directions: "1 capsule in the morning before meals" },
      { name: "Pinealon or Cerluten", productId: "cerluten", directions: "1 capsule in the morning before meals" },
      { name: "Mesotel Ultra", productId: null, directions: "1 teaspoon in the morning before meals" },
      { name: "Prime Peptide Omega", productId: "prime-peptide-omega", directions: "1 capsule 2 times a day with meals" },
    ] },
    { label: "Month 3", items: [
      { name: "Ventfort, Chelohart and Cerluten Lingual", productId: null, directions: "10 drops of each under the tongue in the morning before meals" },
      { name: "Mesotel Neo", productId: "mesotel-neo", directions: "1 teaspoon in the morning before meals" },
      { name: "Adestab", productId: null, directions: "1 capsule in the morning before meals" },
      { name: "Prime Peptide Omega", productId: "prime-peptide-omega", directions: "1 capsule 2 times a day with meals" },
    ] },
    { label: "Month 4", items: [
      { name: "Adestab", productId: null, directions: "1 capsule in the morning before meals" },
      { name: "Canacor", productId: null, directions: "1 teaspoon in the morning before meals (the source advises caution with atrial fibrillation)" },
      { name: "Olecap", productId: "olecap", directions: "1 capsule 2 times a day with meals" },
      { name: "Calcium Complex", productId: null, directions: "1 tablet 3 times a day with meals" },
    ] },
  ],
};

export const PREVENTION_ML_COURSE: ProtocolTimeline = {
  id: "prevention-revilab-ml",
  name: "Premature-ageing prevention course (Revilab ML)",
  goal: "Manufacturer's preventive maintenance course; can be taken 2–3 times a year",
  source: `${CAP_2025}, peptide prevention of premature ageing, p. 74`,
  duration: "3 stages, about 90 days",
  note: "Educational: the manufacturer's published preventive scheme, not a clinically validated regimen. Its schedules differ from the single-product labels.",
  phases: [
    { label: "Stage 1 (days 1–60)", items: [
      { name: "Revilab ML 04 + ML 01", productId: "revilab-ml-04", directions: "1 capsule each in the morning, once every 2 days, for 60 days" },
      { name: "Revilab ML 03 and ML 02", productId: "revilab-ml-03", directions: "1 capsule each in the morning daily, days 1–30" },
      { name: "Revilab Elements", productId: "revilab-pro-elements", directions: "1 tablet 3 times a day" },
      { name: "Complex 3D", productId: "complex-3d", directions: "1 capsule morning and evening" },
    ] },
    { label: "Stage 2 (from day 31)", items: [
      { name: "Revilab ML 05, ML 06, ML 09", productId: "revilab-ml-06", directions: "1 capsule of each in the morning daily" },
    ] },
    { label: "Stage 3 (from day 61)", items: [
      { name: "Revilab ML 07 (men) or ML 08 (women)", productId: "revilab-ml-08", directions: "1 capsule in the morning once every 2 days" },
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
    summary: "Adults: 1 capsule every 3 days, in the morning or at midday. Course: 20 days to 2 months.",
    products: [{ id: "endoluten", relevance: "Pineal gland peptide complex; 20 and 60 capsules, same complex." }],
    sourceIds: [],
    followUp: "Want to know how a course fits with other peptides?",
    chips: ["Can I take Endoluten with melatonin?", "Can I take these together?"],
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
    summary: "Zhenoluten is a natural ovarian peptide complex; Revilab ML 08 and SL 10 are women's formulas for the reproductive and neuroendocrine systems, as capsules or drops. The manufacturer's course places ML 08 in the first two months and SL 10 in months three and four.",
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
    protocol: PREVENTION_ML_COURSE,
    followUp: "Want the full four-month cardiovascular course too?",
    chips: ["Show me the full four-month course", "Can I take these together?"],
  },
  {
    id: "cardio-four-month", level: "deep", intent: "protocol",
    patterns: [/\b(full|whole|complete|4|four)[- ]?(month)?\b.{0,15}\b(month|course|protocol)\b.{0,25}(cardio|heart|vascular)?|\bfour[- ]month\b|\b4[- ]month\b/i],
    summary: "Here is the manufacturer's four-month cardiovascular course, one month per step; tap a month to see its products and directions. It's educational, not a clinically validated regimen, and the source writes it for people with a diagnosed condition, so plan it with your doctor.",
    products: [],
    sourceIds: [],
    protocol: CARDIO_COURSE,
    followUp: "Want just the products we carry from it?",
    chips: ["Show me a preventive course", "Can I take these together?"],
  },
  {
    id: "menopause-course", level: "deep", intent: "protocol",
    patterns: [/\b(menopaus\w*|climacteric)\b.{0,15}\b(course|protocol|plan)\b|\bshow me the menopause course\b/i],
    summary: "The manufacturer's four-month course pairs Endoluten, Zhenoluten and Revilab ML 08 in months one and two, then Revilab SL 10 in months three and four, alongside items we don't sell. Tap a stage to see it; it's educational, not a validated regimen.",
    products: [],
    sourceIds: [],
    protocol: {
      id: "menopause-4-month",
      name: "Four-month menopause-transition course",
      goal: "Manufacturer-described course for the female reproductive and neuroendocrine systems",
      source: `${CAP_2025}, reproductive system section, p. 62`,
      duration: "4 months",
      note: "Educational: the manufacturer's published scheme, not a clinically validated regimen. Its schedules differ from the labels; plan it with your doctor, especially with hormone therapy.",
      phases: [
        { label: "Months 1–2", items: [
          { name: "Endoluten", productId: "endoluten", directions: "1 capsule in the morning before meals, once every 3 days" },
          { name: "Zhenoluten", productId: "zhenoluten", directions: "2 capsules in the morning before meals" },
          { name: "Femalin", productId: "femalin", directions: "2 capsules in the morning before meals" },
          { name: "Revilab SL 04", productId: "revilab-sl-04", directions: "4–6 drops under the tongue" },
          { name: "Prime Peptide Collagen", productId: "prime-peptide-collagen", directions: "1 tablet 2–3 times a day" },
          { name: "Vladonix", productId: "vladonix", directions: "2 capsules in the morning" },
          { name: "Revilab ML 08", productId: "revilab-ml-08", directions: "1 capsule in the morning, every third day" },
        ] },
        { label: "Months 3–4", items: [
          { name: "Mesotel Neo", productId: "mesotel-neo", directions: "1 teaspoon in the morning before meals" },
          { name: "Olecap", productId: "olecap", directions: "1 capsule 2 times a day with meals" },
          { name: "Mamiton", productId: "mamiton", directions: "2 capsules in the morning before meals" },
          { name: "Temero / Genero", productId: "temero-genero", directions: "1 tablet morning (Temero) and evening (Genero) before meals" },
          { name: "Revilab SL 10", productId: "revilab-sl-10", directions: "4–6 drops under the tongue in the morning" },
          { name: "Calcium Complex", productId: null, directions: "1 tablet 3 times a day with meals" },
        ] },
      ],
    },
    followUp: "Want just the products we carry from it?",
    chips: ["Can I take these together?"],
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
  const protocol = g.protocol
    ? { ...g.protocol, phases: g.protocol.phases.map(ph => ({ ...ph, items: ph.items.map(it => ({ ...it, sold: !!(it.productId && catalog.has(it.productId)) })) })) }
    : undefined;
  return {
    mode: g.intent === "red-flag" && g.safety?.level === "urgent" ? "urgent" : "fallback",
    level: g.level,
    gold: g.id,
    summary: g.summary,
    sections: [],
    research: sources(g.sourceIds).slice(0, 2),
    safety: g.safety,
    learnMore: g.learnMore,
    protocol,
    followUps: g.followUp ? [g.followUp] : [],
    suggestions: g.chips.slice(0, 3),
    products,
    showDisclaimer: true,
    topics: [g.id],
  };
}
