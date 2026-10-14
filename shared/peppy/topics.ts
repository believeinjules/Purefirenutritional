/**
 * Pepita curated knowledge: topics → direct answer, research, products, follow-ups.
 *
 * Writing rules (enforced by tests):
 *  - Answer the question first, specifically. Products are secondary.
 *  - Product `why` / `evidenceNote` lines are structure/function only (claims.ts).
 *  - Prose never ties a product name to a disease or to treat/cure/prevent language.
 *  - sourceIds must exist in research-registry.ts; product ids must exist in the catalog.
 *  - Product mappings follow each SKU's actual ingredients (e.g. Revilab ML 07 is the men's
 *    formula, ML 03 is brain/retina) — the old keyword map got several of these wrong.
 */
import type { AnswerSection, ProductFamily, SafetyNotice } from "./types.js";

export interface TopicProduct {
  id: string;
  why: string;
  evidenceNote: string;
  /** Short tissue-target line for the compact card. */
  tissue?: string;
  family?: ProductFamily;
}

export interface Topic {
  id: string;
  label: string;
  patterns: RegExp[];
  summary: string;
  sections: AnswerSection[];
  sourceIds: string[];
  evidenceNote?: string;
  /** Live PubMed query used to supplement curated sources (server only). */
  pubmedQuery?: string;
  products: TopicProduct[];
  /**
   * symptom   — products may follow the answer for symptom/goal/product-finding questions
   * ingredient — at most one closely related product, as a secondary note
   * never     — evidence/explainer topics: no products
   */
  productPolicy: "symptom" | "ingredient" | "never";
  followUps: string[];
  suggestions: string[];
  safety?: SafetyNotice;
  /** Deeper science shown under "Learn more" (physiology, mechanisms, how the picks differ). */
  learnMore?: AnswerSection[];
  /** Fallback product cap for this topic (default 2); only for topics whose picks each serve a distinct reason. */
  maxProducts?: number;
  /** Ask follow-ups from the customer's missing memory slots (goal, duration, age, activity). */
  slotFollowUps?: boolean;
}

export const TOPICS: Topic[] = [
  {
    id: "fatigue",
    label: "Energy and tiredness",
    patterns: [
      /\b(tired\w*|fatigu\w*|exhaust\w*|low energy|no energy|lack of energy|more energy|energy levels?|energy|sluggish|drained|wiped out|afternoon (?:slump|crash|dip)|crash(?:ing)? in the afternoon|run down|worn out|lethargic)\b/i,
    ],
    summary:
      "Panaxod is built on Panax ginseng, the adaptogen with the most research for everyday tiredness, while Ensil combines CoQ10, L-carnitine and B vitamins, nutrients involved in how cells make energy. Researchers have found modest benefits for ginseng in a systematic review, and CoQ10 is studied mainly for its role in cellular energy production. The difference is a plant adaptogen versus an energy-metabolism nutrient blend. If tiredness lasts more than 2–3 weeks, get checked for causes such as low iron, B12 or thyroid changes.",
    sections: [
      {
        heading: "What usually drives it",
        body: "- **Sleep** — short, broken or poor-quality sleep, including snoring or waking unrefreshed, which can signal sleep apnea.\n- **Everyday factors** — meals, caffeine timing, dehydration and too little movement; a mild early-afternoon dip is normal body-clock behaviour.\n- **Medical causes** — low iron stores (especially with heavy periods or a plant-based diet), low B12, thyroid problems, low mood, and some medicines (antihistamines, beta-blockers, some antidepressants).",
      },
      {
        heading: "What the research says",
        body: "Iron helps tiredness only when iron stores are low: in a randomised trial of women with ferritin under 50 µg/L, iron reduced fatigue more than placebo. Ginseng has modest evidence for fatigue, mostly from small studies in people with chronic illness. CoQ10 is essential for cellular energy production, but supplementing mainly matters when levels are genuinely low.",
      },
      {
        heading: "When to get checked",
        body: "If tiredness lasts more than 2–3 weeks, ask your clinician about a basic blood panel (complete blood count, ferritin, TSH, B12, glucose). Go sooner if you also have unexplained weight loss, fever, night sweats, shortness of breath or persistent low mood.",
      },
    ],
    sourceIds: ["pmid:29624410", "pmid:24389208", "pmid:22777991"],
    evidenceNote:
      "Strongest evidence: iron when stores are low (randomised trial). Ginseng and CoQ10 evidence for everyday tiredness is modest.",
    pubmedQuery: "(fatigue OR tiredness) AND (ginseng OR coenzyme Q10 OR iron) AND randomized",
    products: [
      {
        id: "panaxod",
        why: "Built on Panax ginseng, the ingredient with the most research for everyday tiredness among our formulas.",
        evidenceNote:
          "Ginseng itself has modest, mixed evidence; Panaxod as a finished formula hasn't been tested in published trials.",
      },
      {
        id: "ensil",
        why: "Combines CoQ10, L-carnitine, nicotinamide and B vitamins — nutrients involved in cellular energy metabolism.",
        evidenceNote:
          "Evidence is for the individual ingredients, mainly when levels are low; the Ensil formula itself hasn't been studied.",
      },
      {
        id: "revimite",
        why: "Includes iron and B vitamins (B1, B6, B12), which matter if a blood test shows your iron or B12 is low.",
        evidenceNote:
          "Only worth considering after testing — extra iron doesn't help, and can be harmful, when your levels are normal.",
      },
      {
        id: "anti-age-nb-activity",
        why: "Described in its line as an energy concentrate for everyday vitality and cellular energy metabolism.",
        evidenceNote:
          "No published trials of this formula; evidence for its ingredients is mostly lab and small human work.",
      },
      {
        id: "revilab-pro-elements",
        why: "A mineral and vitamin base (magnesium, zinc, calcium, B6, D3) for everyday nutritional upkeep.",
        evidenceNote:
          "Minerals and vitamins mainly help when intake is low; this formula itself hasn't been tested in published trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["How long has the tiredness been going on, and is it mainly in the afternoon or all day?", "How are you sleeping — roughly how many hours, and do you snore or wake up unrefreshed?", "Do you have heavy periods, follow a plant-based diet, or take any regular medicines?"],
    suggestions: [
      "How can I sleep better?",
      "Tell me about Panaxod",
      "Is ginseng safe with my medications?",
      "Do Khavinson peptides actually work in humans?",
    ],
    safety: {
      level: "info",
      title: "Worth knowing",
      body: "Ginseng can interact with blood thinners and diabetes medicines and may disturb sleep if taken late in the day. Don't take iron unless a test shows you need it.",
    },
  },
  {
    id: "sleep",
    label: "Sleep",
    patterns: [
      /\b(sleep\w*|insomnia|can'?t sleep|cannot sleep|trouble sleeping|fall(?:ing)? asleep|stay(?:ing)? asleep|wak(?:e|ing) up (?:at night|in the night|at \d)|night waking|circadian|jet ?lag|bedtime|restless nights?)\b/i,
    ],
    summary:
      "Endoluten is the closest fit: a Khavinson Cytomax made from pineal gland peptides (A-8), and the pineal gland is the small brain gland that releases melatonin at night to keep the body's circadian clock in step with light and dark. Researchers have investigated whether pineal peptide preparations help the gland's own night-time melatonin release in older adults, which is a different idea from taking melatonin, where the hormone itself is supplied from outside. The manufacturer directions describe an intermittent course rather than a nightly dose: adults take 1 capsule once every 3 days, in the morning or at midday, for about 20 days to 2 months. Two related research peptides are often mentioned alongside it: Epitalon, the synthetic tetrapeptide AEDG, which Pure Fire doesn't sell, and Pinealon, the EDR tripeptide, studied mainly for neuroprotection and oxidative stress. The evidence is still early, because the pineal studies measured melatonin levels rather than sleep quality, and no published human trial has tested these products for sleep.",
    sections: [
      {
        heading: "What the research says",
        body: "In small studies from Khavinson's group, the pineal preparations Epithalamin and Epitalon restored night-time melatonin release in older monkeys and older adults, and an injectable pineal extract almost doubled a night-time melatonin marker in 55 older adults with low output. These studies measured hormone levels, not how well people slept. Melatonin taken as a supplement has better sleep data, but the effect is modest: a meta-analysis of 19 trials found people fell asleep about 7 minutes faster and slept about 8 minutes longer.",
      },
      {
        heading: "When to get checked",
        body: "Loud snoring, gasping at night, or daytime sleepiness despite enough time in bed needs a sleep study, not a supplement. Ongoing low mood, pain or medicines can also drive poor sleep.",
      },
    ],
    learnMore: [
      {
        heading: "How the pineal gland, melatonin and the body clock fit together",
        body: "The body's master clock in the hypothalamus reads light coming in through the eyes and signals the pineal gland to release melatonin after dark. Melatonin tells tissues that it's night, which helps line up sleep timing, body temperature and hormone rhythms. Night-time melatonin output tends to fall with age, and Khavinson's group studied pineal peptides as a way of supporting the gland's own rhythm rather than replacing the hormone.",
      },
      {
        heading: "Endoluten vs taking melatonin",
        body: "A melatonin supplement adds the hormone directly and acts within hours, so it's mainly used for timing problems such as jet lag. Endoluten is a pineal gland peptide complex taken as a short intermittent course; it contains no melatonin, and the idea researchers have investigated is a slower effect on the gland's own function. That idea rests on small melatonin-level studies, not on sleep trials.",
      },
      {
        heading: "Endoluten, Epitalon and Pinealon are different things",
        body: "Endoluten is a natural pineal gland peptide complex (A-8) sold by Pure Fire. Epitalon is a synthetic four-amino-acid peptide, Ala-Glu-Asp-Gly (AEDG), first identified in pineal extract research; Pure Fire doesn't sell it. Pinealon is a synthetic three-amino-acid peptide, Glu-Asp-Arg (EDR), studied in cell and animal work for neuroprotection and oxidative stress; it's sometimes discussed for sleep, but direct human sleep evidence is limited.",
      },
      {
        heading: "Course directions: manufacturer vs research",
        body: "Manufacturer directions for Endoluten (St. Petersburg Institute of Bioregulation and Gerontology): adults take 1 capsule once every 3 days, in the morning or at midday, for about 20 days to 2 months. The research studies used injectable pineal preparations, so their schedules don't carry over to the capsules.",
      },
    ],
    sourceIds: ["pmid:17969590", "pmid:11524632", "pmid:21978084", "pmid:28849889", "pmid:23691095"],
    evidenceNote:
      "Pineal peptides: small human and animal studies of melatonin levels, not sleep outcomes. Pinealon: cell studies. Melatonin: meta-analysis, modest benefit.",
    pubmedQuery: "(epithalamin OR epitalon OR pineal peptide) AND melatonin",
    products: [
      {
        id: "endoluten",
        why: "A Khavinson Cytomax from the pineal gland, the gland that releases melatonin at night, with its own intermittent course directions.",
        evidenceNote:
          "Pineal peptide research is mostly small Russian studies of injectable extracts measuring melatonin; Endoluten itself has no published sleep trial.",
      },
      {
        id: "pinealon",
        why: "A Khavinson Cytogen whose peptide complex (AC-5) is made from the amino acids of the EDR tripeptide, studied mainly for neuroprotection and oxidative stress.",
        evidenceNote:
          "Sometimes discussed for sleep, but the research is cell and animal work; direct human sleep evidence is limited.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["How is Endoluten different from Epitalon and Pinealon?", "How is an Endoluten course structured?", "How is a pineal peptide different from taking melatonin?"],
    suggestions: [
      "How is Endoluten different from Epitalon?",
      "How is a pineal peptide different from taking melatonin?",
      "How is an Endoluten course structured?",
      "What is Pinealon?",
    ],
    safety: {
      level: "info",
      title: "Worth knowing",
      body: "Melatonin can cause next-day grogginess. People taking blood thinners or with epilepsy should only use it under medical supervision (NCCIH).",
    },
  },
  {
    id: "joints",
    label: "Joints and cartilage",
    patterns: [
      /\b(joints?|knees?|hips?|ankles?|cartilage|stiff(?:ness)?|achy|aching|ache|mobility|connective tissue|running pain|hurts? when i run|sore when i run)\b/i,
    ],
    summary:
      "Sigumir is a Khavinson Cytomax, a natural peptide complex from cartilage and bone tissue taken as a course and intended to send a tissue-specific signal to cartilage cells. Prime Peptide Joints pairs IPH peptide complexes with glucosamine, MSM and PEA for daily joint support, and Prime Peptide Collagen builds on marine collagen with an IPH peptide, vitamin C and copper for connective tissue. Researchers have investigated cartilage peptides such as AED in human stem cells and ageing animals, while collagen has its own separate body of controlled trials. Achy joints can come from load, a strain or gradual cartilage turnover, so how long it has been going on helps narrow the picks.",
    sections: [
      {
        heading: "See a clinician or physio if",
        body: "the joint swells, locks or gives way, looks red or feels hot, hurts at night or at rest, or the pain persists after 2–3 weeks.",
      },
    ],
    learnMore: [
      {
        heading: "How cartilage keeps itself going",
        body: "Joint cartilage is a slow-turnover tissue. Chondrocytes keep making type II collagen and proteoglycans while enzymes break the old matrix down, and with age, heavy load or injury that balance can tip toward breakdown. Because cartilage has no blood vessels, nutrients and signals reach it through the synovial fluid, which is why researchers are interested in small molecules that can carry a signal to these cells.",
      },
      {
        heading: "What peptide bioregulation is investigating",
        body: "Khavinson's group proposes that short peptides (two to four amino acids) can enter cells and bind DNA regions that regulate tissue-specific genes. For cartilage the key sequence is AED (Ala-Glu-Asp, also called T-31). In lab work, AED and related peptides shifted ageing-related gene expression in human bone-marrow stem cells, and in ageing rats a cartilage extract and T-31 limited bone-density loss. A 2023 review maps how peptides can steer stem cells toward becoming cartilage cells. These are mechanistic, cellular and animal findings: they point to a plausible pathway, and human outcome trials of these peptides are the next step the field needs.",
      },
      {
        heading: "How the three picks differ",
        body: "Sigumir is a Khavinson Cytomax: a natural peptide complex from cartilage and bone tissue, taken as a course; Cartalax is its lab-made counterpart, the single synthesized AED cartilage tripeptide (complex AC-4). Prime Peptide Joints is a multi-ingredient formulation: the IPH AEN and IPH ESM peptide complexes plus liposomal glucosamine, MSM and PEA, so it combines a peptide signal with conventional joint nutrients taken daily. Prime Peptide Collagen is built on marine collagen with the IPH AEN peptide, vitamin C, copper and calcium, aimed more broadly at connective tissue, skin and nails.",
      },
      {
        heading: "Conventional joint supplements, judged on their own",
        body: "Collagen and glucosamine are a separate evidence story from bioregulators. Oral collagen has controlled clinical trials: a meta-analysis of placebo-controlled trials found a modest improvement in overall joint symptom scores and stiffness. Glucosamine and chondroitin were tested in the large GAIT trial, where they did no better than placebo for knee pain overall.",
      },
    ],
    sourceIds: ["pmid:32399807", "pmid:18306703", "pmid:37176122", "pmid:30368550", "pmid:16495392", "ref:niams-oa", "ref:nccih-glucosamine"],
    evidenceNote:
      "Cartilage bioregulator peptides: mechanistic, cellular and animal research. Collagen: controlled clinical trials (meta-analysis, modest effect). Glucosamine/chondroitin: a large controlled trial with no overall benefit for knee pain.",
    pubmedQuery: "(collagen peptide OR cartilage peptide) AND joint AND randomized",
    maxProducts: 3,
    slotFollowUps: true,
    products: [
      {
        id: "sigumir",
        family: "khavinson",
        tissue: "Cartilage and bone bioregulator (natural extract)",
        why: "A Khavinson Cytomax: a natural peptide complex from cartilage and bone tissue, believed to support normal joint and spine function. Unlike Cartalax's single lab-made tripeptide, it is a natural tissue extract.",
        evidenceNote:
          "Researchers have investigated organ-derived cartilage peptides in cell and animal work; Sigumir as a finished product has no published human trials.",
      },
      {
        id: "prime-peptide-joints",
        family: "prime-peptide",
        tissue: "Cartilage and joint formula (peptides + glucosamine, MSM)",
        why: "A Prime Peptide formulation pairing the IPH AEN and IPH ESM peptide complexes with liposomal glucosamine, MSM and PEA for daily joint and cartilage support.",
        evidenceNote:
          "Its glucosamine has controlled trials with mixed results; the full formula hasn't been tested in published trials.",
      },
      {
        id: "prime-peptide-collagen",
        family: "prime-peptide",
        tissue: "Connective tissue: marine collagen + IPH AEN peptide",
        why: "Marine collagen, the joint supplement with the most controlled-trial data, plus the IPH AEN peptide, vitamin C and copper for collagen-rich connective tissue.",
        evidenceNote:
          "Collagen trials used various products and amounts; this formula itself hasn't been tested.",
      },
      {
        id: "cartalax",
        family: "khavinson",
        tissue: "Cartilage bioregulator (AED tripeptide)",
        why: "A Khavinson cytogen: the synthesized cartilage tripeptide Ala-Glu-Asp (complex AC-4), a single organ-specific signal for cartilage and connective-tissue metabolism.",
        evidenceNote:
          "The AED peptide has been studied in human stem cells and in ageing rats; Cartalax as a finished product has no published human trials.",
      },
      {
        id: "revilab-ml-09",
        family: "revilab",
        tissue: "Cartilage and vascular-wall peptide complexes",
        why: "A Revilab complex pairing cartilage and vascular-wall peptide complexes with chondroitin sulfate and omega-3s for joint and connective-tissue support.",
        evidenceNote:
          "Chondroitin has mixed trial results; the full formula hasn't been studied in published trials.",
      },
      {
        id: "revilab-sl-04",
        family: "revilab",
        tissue: "Cartilage, muscle and immune peptide complexes",
        why: "Sublingual Revilab blend of cartilage, muscle and immune peptide complexes for the musculoskeletal system.",
        evidenceNote:
          "Cartilage peptide research is cell and animal work; Revilab SL 04 hasn't been tested in published trials.",
      },
      {
        id: "calsil-t",
        why: "Calcium and magnesium formula for bone, teeth and muscle function.",
        evidenceNote:
          "Calcium and magnesium matter most when dietary intake is low; Calsil-T itself hasn't been tested in published trials.",
      },
    ],
    productPolicy: "symptom",
    followUps: ["Would a comparison of Sigumir and Cartalax help?"],
    suggestions: [
      "Does Cartalax help joints?",
      "Do Khavinson peptides actually work in humans?",
      "Is it safe with blood thinners?",
      "What should a 50-year-old man take?",
    ],
  },
  {
    id: "epitalon",
    label: "Epitalon and the pineal gland",
    patterns: [
      /\b(epitalon|epithalon|epitalone|epithalamin\w*|aedg|ala-glu-asp-gly|pineal|epiphys\w*|telomer\w*|telomerase)\b/i,
    ],
    summary:
      "Epitalon (Ala-Glu-Asp-Gly, or AEDG) is a synthetic four-amino-acid peptide modelled on Epithalamin, a pineal gland extract from Prof. Vladimir Khavinson's group, and Endoluten is Pure Fire's closest product: the natural pineal peptide complex rather than the synthetic peptide itself. Researchers have investigated Epitalon mainly for melatonin rhythm and cell-ageing biology, in cell cultures, ageing animals and small human studies from the same research network. Mass-spectrometry work has detected the AEDG sequence inside the pineal polypeptide complex, which is the link between the two.",
    sections: [
      {
        heading: "What the research shows",
        body: "- **Cells:** added to human fibroblasts in a dish, it switched on telomerase and lengthened telomeres — a lab finding that hasn't been shown in people.\n- **Animals:** in mice it didn't change average lifespan but modestly raised maximum lifespan; the pineal extract lengthened lifespan in flies, some mice and rats.\n- **Humans:** small studies reported higher night-time melatonin in older adults, and a 12-year randomised study of the injectable extract Epithalamin in older adults with heart disease reported lower mortality.\n- **Chemistry:** AEDG has been detected inside the natural pineal extract, which links the two.",
      },
      {
        heading: "What's uncertain",
        body: "Almost all studies come from one research network, many in Russian, with small samples and limited blinding. Most human work used injectable extracts rather than oral products, and there are no large independent trials. Telomere and lifespan results should not be read as proven effects in people.",
      },
      {
        heading: "Epitalon vs Endoluten",
        body: "Pure Fire doesn't sell synthetic Epitalon. Endoluten is a natural pineal peptide complex (A-8) from the same research tradition, which the catalog describes as an analogue of Epithalamin. Evidence about the ingredient lineage is not evidence about a finished product.",
      },
    ],
    sourceIds: ["pmid:17969590", "pmid:29124531", "pmid:12937682"],
    evidenceNote:
      "Mostly cell and animal research plus small, single-network human studies; no large independent trials.",
    pubmedQuery: "epitalon OR epithalamin",
    products: [
      {
        id: "endoluten",
        why: "Pure Fire's closest product: a natural pineal gland peptide complex (A-8) from the Khavinson tradition.",
        evidenceNote:
          "It isn't synthetic Epitalon, and Endoluten itself has no published human trials.",
      },
    ],
    productPolicy: "ingredient",
    followUps: [],
    suggestions: [
      "Do Khavinson peptides actually work in humans?",
      "Can I take Endoluten with melatonin?",
      "How do peptide bioregulators work?",
      "Tell me about Endoluten",
    ],
  },
  {
    id: "thymus",
    label: "Thymus peptides and immune function",
    patterns: [
      /\b(thymus|thymic|thymalin|thymogen|vilon|t[- ]cells?)\b/i,
    ],
    summary:
      "Vladonix is a natural thymus peptide complex (A-6) in the Khavinson tradition, related to the Russian thymus preparation Thymalin. The thymus is the small gland behind the breastbone where T cells mature, and it shrinks with age. Researchers have investigated thymus peptides in human blood stem cells and immune-cell cultures, where Thymalin and its KE and EW dipeptides shifted T-cell differentiation and immune-signalling genes.",
    sections: [
      {
        heading: "What the research shows",
        body: "- **Humans:** in a 6–8-year study of 266 older adults, injectable Thymalin (alone or with Epithalamin) was linked to fewer respiratory illnesses and lower mortality — but the trial is small, old and run by the developers.\n- **Lab:** Thymalin and its active dipeptides (KE and EW) shift immune-cell maturation markers and inflammatory signalling in cell cultures.\n- Thymalin has also been used as an add-on in Russian hospital care; those small studies don't tell us what oral supplements do.",
      },
      {
        heading: "What's uncertain",
        body: "The human studies used injected pharmaceutical extracts. Whether oral thymus peptide products change immune function in healthy people hasn't been tested in independent trials.",
      },
      ],
    sourceIds: ["pmid:33237528", "pmid:37686182", "pmid:35408963"],
    evidenceNote:
      "One small, older human trial of injectable extracts plus lab studies; no trials of oral products.",
    pubmedQuery: "thymalin OR thymus peptide Khavinson",
    products: [
      {
        id: "vladonix",
        why: "A natural thymus peptide complex (A-6); the catalog describes it as an analogue of Thymalin, for healthy immune function.",
        evidenceNote:
          "Thymalin research used injections; Vladonix itself hasn't been tested in published human trials.",
      },
      {
        id: "crystagen",
        why: "A synthesized thymus peptide (cytogen) the catalog describes for immune support during periods of stress.",
        evidenceNote:
          "Evidence for thymic peptides is mostly lab work; Crystagen as a product has no published trials.",
      },
      {
        id: "prime-peptide-omega",
        why: "Thymus-focused peptide formula with omega-3-6-9 fatty acids from the Prime Peptide line.",
        evidenceNote:
          "Its thymus peptide data is the manufacturer's lab and animal work; no independent human trials.",
      },
    ],
    productPolicy: "ingredient",
    followUps: [],
    suggestions: [
      "Do Khavinson peptides actually work in humans?",
      "What is Epitalon?",
      "Tell me about Vladonix",
      "What should a 50-year-old man take?",
    ],
  },
  {
    id: "course-protocols",
    label: "Preventive vs restorative protocols",
    patterns: [
      /\b(prevent\w*|maintenance|prophyla\w*)\b.*\b(restor\w*|intensive|recover\w*)\b/i,
      /\b(restor\w*|intensive)\b.*\b(prevent\w*|maintenance|prophyla\w*)\b/i,
      /\b(peptide|bioregulator|cytomax\w*|cytogen\w*)s? (?:course|protocol)s?\b.*\b(repeat|how often|how long|length)\b/i,
    ],
    summary:
      "Khavinson bioregulators are taken as courses rather than every day, and the two cards show how differently individual products are scheduled, each with its own manufacturer directions. A standard, preventive-style course is usually about a month, then a break, then sometimes a repeat course a few months to a year later. When the aim is restoring function, the directions describe extending the course, pairing it with bioregulators for other organs, or running 2–3 courses a year. These are manufacturer guidance rather than clinically tested regimens, and a course is always set per product, never borrowed from another.",
    sections: [
      {
        heading: "Check with your doctor first if",
        body: "you take medicines, are pregnant or breastfeeding, or have an ongoing health condition.",
      },
    ],
    learnMore: [
      {
        heading: "How a standard course is framed",
        body: "In the manufacturer directions (peptideproduct.com and the institute store, peptid.ru), most capsule Cytomaxes and Cytogens follow one shape: 1–2 capsules with meals for about a month, a break, then sometimes a repeat course a few months to a year later. Each product's card shows its own label directions. These are label directions, not schedules compared against each other in trials.",
      },
      {
        heading: "What the directions say about restoring function",
        body: "The institute store's directions say the course can be extended and combined with bioregulators for other organs when the body is weakened or several systems are involved, and suggest 2–3 courses a year for long-standing concerns, after talking with a doctor. They don't set a separate, higher 'restorative' dose.",
      },
      {
        heading: "Why schedules aren't interchangeable",
        body: "Some products follow a very different rhythm from the usual twice-daily pattern; the pineal Cytomax shown below, for example, is taken once every few days. Where sources print different frequencies for the same product, each product card shows only its verified label directions rather than a blended regimen.",
      },
    ],
    sourceIds: [],
    evidenceNote:
      "Course framing comes from manufacturer directions; no trials have compared preventive and restorative schedules.",
    pubmedQuery: "Khavinson peptide bioregulator course",
    products: [
      {
        id: "cartalax",
        family: "khavinson",
        tissue: "Cartilage bioregulator (AED tripeptide)",
        why: "A Cytogen whose directions show the standard course shape: 10–30 days, then a repeat course after 4–6 months.",
        evidenceNote:
          "The AED peptide has been studied in human stem cells and in ageing rats; Cartalax as a finished product has no published human trials.",
      },
      {
        id: "endoluten",
        family: "khavinson",
        tissue: "Pineal gland bioregulator (natural extract)",
        why: "A Khavinson Cytomax from the pineal gland, with its own course directions.",
        evidenceNote:
          "Pineal peptide preparations have been studied for night-time melatonin; Endoluten as a finished product has no published human trials.",
      },
    ],
    productPolicy: "symptom",
    maxProducts: 2,
    followUps: ["Which body system or product are you thinking about?", "Is your goal prevention, or getting back to normal function?", "Would you like one product's documented course spelled out?"],
    suggestions: [
      "Cytogens vs Cytomaxes?",
      "What does peptide research show?",
    ],
  },
  {
    id: "khavinson-evidence",
    label: "Do Khavinson peptides work?",
    patterns: [
      /\b(khavinson|bioregulators?|peptides?|cytomax\w*|cytogens?)\b.*\b(work|works|working|effective|evidence|proof|proven|legit|scam|real|science|studies|research|trials?)\b/i,
      /\b(work|works|effective|evidence|proof|legit|scam)\b.*\b(khavinson|bioregulators?|cytomax\w*|cytogens?)\b/i,
    ],
    summary:
      "Researchers have investigated Khavinson peptides at several levels: how short peptides interact with DNA and get into cells, how they behave in cell cultures and ageing animals, and how older adults responded to the original injectable preparations. Together, that work suggests these tiny peptides can act as tissue-specific signals that influence gene activity. Most of it comes from Khavinson's own research network and used injectables rather than oral capsules, so independent controlled trials of the oral products are the step the field still needs.",
    sections: [
      {
        heading: "How to read product claims",
        body: "Treat headline numbers in marketing as early research, not proof. If you try a bioregulator, do it with your clinician's knowledge, track something you can measure, and stop if you notice side effects.",
      },
    ],
    learnMore: [
      {
        heading: "Mechanistic and cellular research",
        body: "Computer-modelling work (\"Systematic search for structural motifs of peptide binding to double-stranded DNA\") found a small set of dipeptides that could bind specific DNA sequences. The group's review \"Peptide Regulation of Gene Expression: A Systematic Review\" summarises cell studies proposing that 2–7 amino-acid peptides enter cell nuclei and influence gene expression, and a review of POT and LAT carriers explains how di- and tripeptides are carried into cells, which is why oral use is considered plausible.",
      },
      {
        heading: "Animal research",
        body: "Ageing-animal studies looked at hormone rhythms and tissue markers. For example, synthetic Epitalon raised evening melatonin and normalised the cortisol rhythm in old rhesus monkeys, in a very small, injected-peptide study.",
      },
      {
        heading: "Human research",
        body: "The developers' clinical review \"[Peptide bioregulators: the new class of geroprotectors. Message 2. Clinical studies results]\" summarises studies in which older adults received injectable preparations such as Thymalin and Epithalamin over several years. Independent groups have reported small comparative studies too, such as \"[Comparative analysis of different methods of geroprotection]\" (Myakotnykh et al., 2016), which included Vesugen and Pinealon in 110 people.",
      },
      {
        heading: "Where the uncertainty sits",
        body: "The human studies were small, mostly from one network, often Russian-language, and rarely describe randomisation or blinding in detail. They used injectables, and no published controlled trial has tested the oral capsules sold today, so product directions are manufacturer guidance rather than trial-tested regimens.",
      },
    ],
    sourceIds: [
      "pmid:31598715",
      "pmid:34834147",
      "pmid:35887081",
      "pmid:11524632",
      "pmid:24003726",
    ],
    evidenceNote:
      "Mechanistic, cellular and animal work plus small human studies of injectable preparations, mostly from one network; no controlled trials of the oral products yet.",
    pubmedQuery: "Khavinson peptide bioregulator",
    products: [],
    productPolicy: "never",
    followUps: [],
    suggestions: [
      "What is Epitalon?",
      "What does the thymus peptide do?",
      "How do peptide bioregulators work?",
      "Does Cartalax help joints?",
    ],
  },
  {
    id: "bioregulators",
    label: "How peptide bioregulators work",
    patterns: [
      /\b(bioregulators?|cytomax\w*|cytogens?|short peptides?|peptide bioregulat\w*|how (?:do|does) (?:the )?peptides? work|what are peptides?)\b/i,
    ],
    summary:
      "Peptide bioregulators are very short chains of amino acids (usually 2–4) that Khavinson's group proposes act as tissue-specific signals that influence which genes are switched on. Cytomaxes are peptide complexes extracted from young animal organs, Cytogens are synthesized copies of key short peptides, and Revilab formulas blend several with vitamins and plant extracts.",
    sections: [
      {
        heading: "The proposed mechanism",
        body: "Lab studies show short peptides can enter cell nuclei and interact with DNA and histone proteins, changing gene expression. Gut transporters (PEPT1/PEPT2) can carry di- and tripeptides into the body, which makes oral use plausible.",
      },
      {
        heading: "What's established vs not",
        body: "Established: short peptides are biologically active in cells. Not established: that oral bioregulator products reach their target organ in meaningful amounts, or that they change health outcomes in healthy people — independent trials are lacking.",
      },
      {
        heading: "How they're typically used",
        body: "In courses (often 10–30 days, repeated a few times a year) matched to a body system. That schedule comes from the manufacturer, not from comparative trials.",
      },
    ],
    sourceIds: [
      "pmid:34834147",
      "pmid:35887081",
      "pmid:31598715",
      "pmid:12374906",
      "pmid:19830585",
    ],
    evidenceNote:
      "Mechanism supported by lab and modelling studies; clinical evidence for oral products is lacking.",
    pubmedQuery: "short peptides gene expression Khavinson",
    products: [],
    productPolicy: "never",
    followUps: [],
    suggestions: [
      "Do Khavinson peptides actually work in humans?",
      "What is Epitalon?",
      "What does the thymus peptide do?",
      "Which Pure Fire product for sleep?",
    ],
  },
  {
    id: "eyes",
    label: "Eye health",
    patterns: [
      /\b(eyes?|eyesight|vision|visual|sight|retina\w*|macula\w*|lutein|zeaxanthin|screen strain|eye strain|dry eyes?)\b/i,
    ],
    summary:
      "Visoluten is a natural eye-tissue peptide complex (A-11) from the Khavinson line, while Revilab ML 03 combines brain, retina and vascular-wall peptide complexes with lutein, zeaxanthin and astaxanthin. Researchers have investigated retinal peptides such as Epitalon in animal retina studies, and lutein and zeaxanthin are the most-studied eye nutrients in large human trials. The difference is a single tissue-specific course versus a daily multi-peptide formula with carotenoids. Get any sudden change in vision checked the same day.",
    sections: [
      {
        heading: "What the research says",
        body: "In the large AREDS2 trial, adding lutein + zeaxanthin to the AREDS formula didn't further slow progression overall, but they became the recommended replacement for beta-carotene, which raised lung-cancer risk in former smokers. Retinal peptide research (Epitalon, Retinalamin) comes from small Russian studies of injectable drugs in people with retinal conditions; it hasn't been tested as an oral supplement for healthy eyes.",
      },
      {
        heading: "Get checked the same day if",
        body: "you notice sudden vision loss, a curtain or shadow over your vision, new flashes or a shower of floaters, a painful red eye, or double vision.",
      },
    ],
    sourceIds: ["pmid:30859383", "pmid:12195242", "pmid:23644932", "ref:nei-areds"],
    evidenceNote:
      "Lutein/zeaxanthin: large randomised trial in people at risk of AMD. Retinal peptides: small Russian studies of injectable drugs.",
    pubmedQuery: "(retinalamin OR retina peptide OR epitalon) AND retina AND Khavinson",
    products: [
      {
        id: "visoluten",
        why: "A natural eye-tissue peptide complex (A-11) the catalog describes for retina, ciliary muscle and conjunctiva support.",
        evidenceNote:
          "Related studies used injectable retinal drugs; Visoluten isn't indexed in PubMed and has no published trials.",
      },
      {
        id: "revilab-ml-03",
        why: "Combines brain, retina and vascular-wall peptide complexes with lutein, zeaxanthin, astaxanthin and omega-3s.",
        evidenceNote:
          "Ingredient evidence varies; the formula itself hasn't been studied in published trials.",
      },
      {
        id: "retisil",
        why: "Built on lutein and zeaxanthin, the carotenoids concentrated in the macula and the best-studied eye nutrients.",
        evidenceNote:
          "Lutein/zeaxanthin evidence comes from trials of specific formulas; Retisil itself hasn't been tested.",
      },
      {
        id: "pinalex-tab",
        why: "An eye-focused tablet: lutein, astaxanthin, blueberry and taurine with the KE peptide complex (AA-6).",
        evidenceNote:
          "Lutein is a well-studied eye nutrient; Pinalex Tab as a finished product has no published human trials.",
      },
      {
        id: "revilab-sl-02",
        why: "Sublingual blend of retina, brain and vascular-wall peptide complexes.",
        evidenceNote:
          "Retina peptide research is mostly cell and animal work; Revilab SL 02 hasn't been tested in published trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is this about general eye health, screen strain, or an eye condition you've been diagnosed with?", "Have you noticed any recent change in your vision?"],
    suggestions: [
      "Tell me about Visoluten",
      "Do Khavinson peptides actually work in humans?",
      "What is Epitalon?",
      "What should a 50-year-old man take?",
    ],
  },
  {
    id: "heart",
    label: "Heart and circulation",
    patterns: [
      /\b(heart|cardio\w*|circulation|blood vessels?|vascular|veins?|arter\w*|blood flow|omega-?3s?|fish oil)\b/i,
    ],
    summary:
      "Ventfort is a natural blood-vessel peptide complex (A-3) from the Khavinson line, and Revilab ML 04 combines heart-muscle, vascular-wall and pineal peptide complexes with resveratrol, rutin and omega-3s. Researchers have investigated vascular peptides in ageing vessel-wall cells and old rats, where they raised cell-renewal markers and microvessel density. The difference is a single-tissue course versus a daily multi-peptide formula. Seek urgent care for chest pain or pressure.",
    sections: [
      {
        heading: "What the research says about peptides",
        body: "Vascular peptide research from Khavinson's group is mostly cell and animal work — for example, renewal markers in ageing vessel cells and more microvessels in old rats. The main human signal is a 12-year study of the pineal extract Epithalamin in older adults with heart disease, which wasn't a vascular peptide and was injected.",
      },
      {
        heading: "Omega-3s",
        body: "Fish oil is well studied. It can have antiplatelet effects at high doses, so mention it to your doctor if you take blood thinners.",
      },
      {
        heading: "Seek urgent care for",
        body: "chest pain or pressure, new shortness of breath, fainting, or a racing heartbeat with dizziness.",
      },
    ],
    sourceIds: ["pmid:25408528", "pmid:27383168", "pmid:36611900", "ref:ods-omega3"],
    evidenceNote:
      "Vascular peptides: cell and animal studies. Omega-3s: extensive but mixed evidence for healthy people.",
    pubmedQuery: "(cardiogen OR vascular peptide OR vesugen) AND Khavinson",
    products: [
      {
        id: "ventfort",
        why: "A natural blood-vessel peptide complex (A-3) the catalog describes for healthy blood vessels and circulation.",
        evidenceNote:
          "Vascular peptide evidence comes from cell and animal studies; Ventfort itself has no published human trials.",
      },
      {
        id: "revilab-ml-04",
        why: "Combines heart-muscle, vascular-wall and pineal peptide complexes with resveratrol, rutin and omega-3s for cardiovascular function.",
        evidenceNote:
          "Peptide research is mostly cell and animal work; Revilab ML 04 hasn't been tested in published trials.",
      },
      {
        id: "chelohart",
        why: "A natural heart-muscle peptide complex (A-14) the catalog describes for heart muscle cell support.",
        evidenceNote:
          "Evidence is limited to related lab research; Chelohart itself has no published human trials.",
      },
      {
        id: "olecap",
        why: "Salmon and flaxseed oil providing omega-3s (EPA, DHA and ALA), which support normal heart function.",
        evidenceNote:
          "Omega-3 research is extensive but mixed for healthy people; Olecap as a formula hasn't been studied.",
      },
      {
        id: "revilab-sl-01",
        why: "Sublingual blend of vascular-wall and heart-muscle peptide complexes for the cardiovascular system.",
        evidenceNote:
          "No published trials of Revilab SL 01 itself.",
      },
      {
        id: "vesugen",
        why: "A vascular peptide complex for healthy blood vessels and circulation.",
        evidenceNote:
          "A small Russian clinical study used the vascular tripeptide; the oral product itself hasn't been tested in independent trials.",
      },
      {
        id: "complex-3r",
        why: "Antioxidant trio of dihydroquercetin, resveratrol and coenzyme Q10 for cardiovascular and cellular support.",
        evidenceNote:
          "Each ingredient has mixed human data; this combination hasn't been tested in published trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is this about general heart health, or has your doctor flagged blood pressure, cholesterol or heart rhythm?", "Do you take any heart or blood-thinning medicines?"],
    suggestions: [
      "Is it safe with blood thinners?",
      "Tell me about Ventfort",
      "Do Khavinson peptides actually work in humans?",
      "What should a 50-year-old man take?",
    ],
  },
  {
    id: "brain",
    label: "Memory and focus",
    patterns: [
      /\b(brain|memory|memor\w*|focus\w*|concentrat\w*|cognit\w*|brain fog|foggy|forgetful\w*|mental clarity|mental performance)\b/i,
    ],
    summary:
      "Cerluten is a natural brain peptide complex (A-5) from the Khavinson line, and Prime Peptide Brain builds on the IPH AGAP tetrapeptide with magnesium, choline, GABA and zinc. Researchers have investigated short brain peptides such as EDR (Pinealon) and KED in neuron cultures, where they reduced age-related changes and oxidative stress. The difference is a short tissue-specific course versus a daily peptide-plus-nutrient formula. Brain fog often has everyday causes too, such as poor sleep, stress or low iron or B12.",
    sections: [
      {
        heading: "What the research says about brain peptides",
        body: "Short brain peptides (such as EDR, also called Pinealon, and KED) protected neurons and raised serotonin-related activity in cell studies and are proposed as neuroprotective, but human data are thin and come from the originating group.",
      },
      {
        heading: "See a doctor if",
        body: "memory changes are new, getting worse or affecting daily life, or come with confusion, personality change, headaches or weakness.",
      },
    ],
    sourceIds: ["pmid:39518916", "pmid:33396470", "pmid:21978084", "pmid:24738258"],
    evidenceNote:
      "Brain peptides: cell and animal studies plus a review by the originating group; little human data.",
    pubmedQuery: "(cortexin OR pinealon OR cortagen) AND neuroprotective",
    products: [
      {
        id: "cerluten",
        why: "A Khavinson Cytomax: a natural brain peptide complex (A-5), believed to support normal brain cell metabolism.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Cerluten as a finished product has no published human trials.",
      },
      {
        id: "prime-peptide-brain",
        why: "Built around the IPH AGAP tetrapeptide with magnesium, choline, GABA and zinc, positioned for focus and memory support.",
        evidenceNote:
          "Choline and magnesium have some general research; the peptide complex and finished formula have no independent published trials.",
      },
      {
        id: "revilab-ml-03",
        why: "Combines brain, retina and vascular-wall peptide complexes with omega-3s, choline and B vitamins for nervous-system support.",
        evidenceNote:
          "Brain peptide research is cell-based; the formula hasn't been tested in people.",
      },
      {
        id: "revilab-sl-02",
        why: "Sublingual blend of brain, retina and vascular-wall peptide complexes for the nervous system.",
        evidenceNote:
          "Brain peptide research is mostly cell, animal and small Russian clinical work; Revilab SL 02 itself is untested.",
      },
      {
        id: "mesotel",
        why: "Choline-based formula for brain, liver and cardiovascular function.",
        evidenceNote:
          "Choline is an essential nutrient; Mesotel as a finished formula hasn't been tested in published trials.",
      },
      {
        id: "pinealon",
        why: "A Khavinson Cytogen: a synthesized brain-cortex peptide complex (AC-5) made from the amino acids of the EDR tripeptide (Glu-Asp-Arg), studied for neuroprotection and oxidative stress.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Pinealon as a finished product has no published human trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is this about day-to-day focus, or memory changes you or others have noticed?", "How are your sleep and stress levels lately?"],
    suggestions: [
      "How can I sleep better?",
      "Tell me about Prime Peptide Brain",
      "Do Khavinson peptides actually work in humans?",
      "Why am I tired in the afternoon?",
    ],
  },
  {
    id: "immune",
    label: "Immune system and blood formation",
    patterns: [
      /\b(immune|immunity|immune system|catch(?:ing)? (?:every )?colds?|get sick (?:often|a lot)|always sick|natural defen[cs]es|blood[- ]forming|blood formation|bone marrow|hematopoie\w*|haematopoie\w*)\b/i,
    ],
    summary:
      "Vladonix is a natural thymus peptide complex (A-6) from the Khavinson line, and Revilab ML 02 combines T-cell, B-cell, bone-marrow and liver peptide complexes with omega-3s. Researchers have investigated thymus peptides in human blood stem cells and immune-cell cultures, where Thymalin and its KE and EW dipeptides shifted T-cell differentiation and immune-signalling genes. The difference is a single-tissue course versus a daily multi-peptide formula. If you get ill unusually often or have unexplained fevers, get checked.",
    sections: [
      {
        heading: "What the research says",
        body: "Thymus and bone-marrow peptide research comes mainly from Russian groups. A long-term Russian clinical study of injectable thymus and pineal extracts in 266 older adults reported fewer respiratory infections, but it hasn't been independently replicated. Most other data are cell and animal studies, and oral products haven't been tested in comparable trials.",
      },
    ],
    sourceIds: ["pmid:33237528", "pmid:37686182"],
    evidenceNote:
      "One long-term Russian clinical study of injectable extracts; the rest is cell and animal work.",
    pubmedQuery: "(thymalin OR thymus peptide OR bone marrow peptide) AND Khavinson",
    products: [
      {
        id: "vladonix",
        why: "A natural thymus peptide complex (A-6); the catalog describes it as an analogue of Thymalin, for healthy immune function.",
        evidenceNote:
          "Thymus peptides have been studied in human blood stem cells and immune-cell cultures; Vladonix as a finished product has no published human trials.",
      },
      {
        id: "revilab-ml-02",
        why: "T-cell, B-cell, bone-marrow and liver peptide complexes for the blood-forming and immune systems.",
        evidenceNote:
          "Peptide research is cell and animal work; Revilab ML 02 hasn't been tested in published trials.",
      },
      {
        id: "revilab-sl-03",
        why: "Sublingual blend of T-cell, B-cell and pineal peptide complexes for immune function.",
        evidenceNote:
          "Immune peptide research is mostly cell and animal work; Revilab SL 03 hasn't been tested in published trials.",
      },
      {
        id: "revifort",
        why: "Four mushrooms (shiitake, reishi, maitake, cordyceps) with beta-glucans for immune function.",
        evidenceNote:
          "Mushroom beta-glucans have small human studies; Revifort itself hasn't been tested in published trials.",
      },
      {
        id: "bonomarlot",
        why: "A bone-marrow peptide complex for the blood-forming system.",
        evidenceNote:
          "Bone-marrow peptide research is older Russian animal work; Bonomarlot itself has no published human trials.",
      },
      {
        id: "revilab-sl-07",
        why: "Sublingual blend of bone-marrow, B-cell and vascular-wall peptide complexes with B vitamins for healthy blood formation.",
        evidenceNote:
          "No published trials of Revilab SL 07 itself.",
      },
      {
        id: "imusil",
        why: "Supports natural defences and cellular immunity.",
        evidenceNote:
          "No published trials of Imusil itself.",
      },
      {
        id: "levain",
        why: "Plant adaptogen blend for immune resilience during stressful periods.",
        evidenceNote:
          "Adaptogen evidence is mixed; Levain itself hasn't been tested in published trials.",
      },
      {
        id: "prime-peptide-omega",
        why: "Thymus-focused peptide formula with omega-3-6-9 fatty acids.",
        evidenceNote:
          "Its peptide data is the manufacturer's lab and animal work; no independent human trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is this about general immune upkeep, or has a doctor flagged something in your blood tests?", "Is your goal prevention, or getting back to normal function?"],
    suggestions: [
      "What does the thymus peptide do?",
      "Is it safe with my medications?",
      "Do Khavinson peptides actually work in humans?",
    ],
  },
  {
    id: "liver",
    label: "Liver and bile flow",
    patterns: [
      /\b(liver|hepat\w*|bile|gallbladder|detox\w*|alcohol metabolism|hangover)\b/i,
    ],
    summary:
      "Svetinorm is a natural liver peptide complex (A-7) from the Khavinson line, and Revilab ML 01 combines pineal, immune and liver peptide complexes with resveratrol, choline and omega-3s. Researchers have investigated the liver peptide Livagen in lymphocytes from older people and in ageing rats, where it activated chromatin and shifted digestive-enzyme activity toward younger levels. The difference is a single-tissue course versus a broader daily formula. Yellowing skin or eyes, or dark urine, needs a doctor's check.",
    sections: [
      {
        heading: "What the research says",
        body: "Liver peptide (Livagen) research is Russian cell and animal work, including lymphocytes from older people and digestive-enzyme studies in rats. There are no human trials of oral liver peptide products.",
      },
    ],
    sourceIds: ["pmid:12533768", "pmid:16075683"],
    evidenceNote: "Cell and animal studies only.",
    pubmedQuery: "(Livagen OR liver peptide) AND Khavinson",
    products: [
      {
        id: "svetinorm",
        why: "A Khavinson Cytomax: a natural liver peptide complex (A-7), believed to support normal liver function.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Svetinorm as a finished product has no published human trials.",
      },
      {
        id: "revilab-ml-01",
        why: "Includes a liver peptide complex alongside pineal and immune peptides, choline and antioxidants.",
        evidenceNote:
          "No published trials of Revilab ML 01 itself.",
      },
      {
        id: "likam",
        why: "A liver and bile-duct formula for healthy liver function and bile flow.",
        evidenceNote:
          "No published trials of Likam itself.",
      },
      {
        id: "revilab-sl-05",
        why: "Sublingual blend of liver, pancreas and stomach-wall peptide complexes.",
        evidenceNote:
          "Liver peptide research is cell and animal work; Revilab SL 05 hasn't been tested in published trials.",
      },
      {
        id: "reviplant",
        why: "Botanical formula for liver and immune function.",
        evidenceNote:
          "No published trials of Reviplant itself.",
      },
      {
        id: "complex-3d",
        why: "Antioxidant blend for the liver's own antioxidant and clearance pathways.",
        evidenceNote:
          "No published trials of Complex 3D itself.",
      },
      {
        id: "ovagen",
        why: "A Khavinson peptide bioregulator for the liver and digestive tract, believed to support normal liver function.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Ovagen as a finished product has no published human trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is this about general liver upkeep, or has a doctor mentioned your liver tests?", "Is your goal prevention, or getting back to normal function?"],
    suggestions: [
      "Is it safe with my medications?",
      "How do peptide bioregulators work?",
    ],
  },
  {
    id: "respiratory",
    label: "Lungs, airways and sinuses",
    patterns: [
      /\b(lungs?|bronch\w*|airways?|respiratory|sinus\w*|nasal|nose|throat)\b/i,
    ],
    summary:
      "Chonluten is a natural bronchial peptide complex from the Khavinson line, and Revilab ML 05 combines bronchial, lung and T-cell peptide complexes with omega-3s. Researchers have investigated bronchial peptides such as Bronchogen in ageing bronchial cell cultures and in rats, where they raised differentiation markers and improved the bronchial lining. The difference is a single-tissue course versus a daily multi-peptide formula. Get urgent care for chest pain, coughing up blood or struggling to breathe.",
    sections: [
      {
        heading: "What the research says",
        body: "Bronchial peptide (Bronchogen) research is Russian cell and rat work, including a rat model of chronic lung damage. There are no human trials of oral bronchial peptide products.",
      },
    ],
    sourceIds: ["pmid:22808515", "pmid:26468022"],
    evidenceNote: "Cell and rat studies only.",
    pubmedQuery: "(Bronchogen OR bronchial peptide) AND (Khavinson OR peptide bioregulator)",
    products: [
      {
        id: "chonluten",
        why: "A Khavinson peptide bioregulator for the respiratory system, believed to support normal bronchial function.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Chonluten as a finished product has no published human trials.",
      },
      {
        id: "revilab-ml-05",
        why: "Bronchial, lung/stomach-wall and T-cell peptide complexes with omega-3s for the respiratory system.",
        evidenceNote:
          "Bronchial peptide research is cell and rat work; Revilab ML 05 hasn't been tested in published trials.",
      },
      {
        id: "taxorest",
        why: "A Khavinson peptide bioregulator for the respiratory system, believed to support normal bronchial and lung function.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Taxorest as a finished product has no published human trials.",
      },
      {
        id: "revilab-sl-06",
        why: "Sublingual blend of bronchial, lung and B-cell peptide complexes for the airways.",
        evidenceNote:
          "No published trials of Revilab SL 06 itself.",
      },
      {
        id: "rinolax",
        why: "Herbal formula for nasal, sinus and throat comfort.",
        evidenceNote:
          "No published trials of Rinolax itself.",
      },
      {
        id: "alvenorm-forte",
        why: "A herbal liquid with thyme, Iceland moss, liquorice root and plantain, traditionally used for the airways.",
        evidenceNote:
          "Herbal ingredients with traditional use; Alvenorm Forte as a finished product has no published human trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is this about general upkeep, or about something specific like seasonal sinus trouble?", "Is your goal prevention, or getting back to normal function?"],
    suggestions: [
      "Is it safe with my medications?",
      "Do Khavinson peptides actually work in humans?",
    ],
  },
  {
    id: "digestion",
    label: "Liver and digestion",
    patterns: [
      /\b(digest\w*|gut|bloat\w*|stomach|indigestion|reflux|heartburn|constipat\w*|bowel)\b/i,
    ],
    summary:
      "Stamakort is a natural stomach peptide complex from the Khavinson line, and Revilab ML 06 combines liver, pancreas and stomach-wall peptide complexes with licorice root and artichoke extract. Researchers have investigated digestive-tissue peptides such as Pancragen in ageing cell cultures and old monkeys, where pancreatic function markers improved. The difference is a single-tissue course versus a daily multi-peptide formula. See a doctor for blood in your stool or unintended weight loss.",
    sections: [
      {
        heading: "What the research says",
        body: "Liver and stomach peptide research (for example Livagen and Pancragen) is mainly cell and animal work from Khavinson's group. We don't have strong human trials to point you to for liver or gut peptide products.",
      },
      {
        heading: "See a doctor if",
        body: "you notice yellowing of the skin or eyes, dark urine, persistent abdominal pain, blood in your stool, trouble swallowing, or unintended weight loss.",
      },
    ],
    sourceIds: ["pmid:22808515", "pmid:25946840"],
    evidenceNote:
      "Little human evidence for liver or digestive peptide products.",
    pubmedQuery: "(pancragen OR gastric peptide) AND Khavinson",
    products: [
      {
        id: "stamakort",
        why: "A Khavinson Cytomax: a natural stomach peptide complex, believed to support normal stomach function.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Stamakort as a finished product has no published human trials.",
      },
      {
        id: "revilab-ml-06",
        why: "Combines liver, pancreas and stomach-wall peptide complexes with omega-3s, licorice root and artichoke extract for digestive support.",
        evidenceNote:
          "No published trials of this formula; evidence for the individual ingredients is limited.",
      },
      {
        id: "suprefort",
        why: "A Khavinson Cytomax: a natural pancreas peptide complex (A-1), believed to support normal pancreatic function.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Suprefort as a finished product has no published human trials.",
      },
      {
        id: "digemax",
        why: "A digestive-enzyme support complex the catalog describes for comfortable digestion and nutrient absorption.",
        evidenceNote:
          "Its ingredient details are limited on our page and there are no published trials of the formula.",
      },
      {
        id: "getrufline",
        why: "Bitter herbal formula in chewable form for gut comfort and bile flow.",
        evidenceNote:
          "No published trials of Getrufline itself.",
      },
      {
        id: "volustom",
        why: "Dietary-fibre adsorbent complex for digestive comfort and regularity.",
        evidenceNote:
          "Fibre has good general evidence; this formula itself hasn't been tested in published trials.",
      },
      {
        id: "revilab-sl-05",
        why: "Sublingual blend of liver, pancreas and stomach-wall peptide complexes for digestive function.",
        evidenceNote:
          "Pancreas and liver peptide research is animal and cell work; Revilab SL 05 hasn't been tested in published trials.",
      },
      {
        id: "pangluin",
        why: "Pancreas-focused formula for healthy carbohydrate metabolism.",
        evidenceNote:
          "No published trials of Pangluin itself; check with your doctor first if you take glucose-lowering medicine.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is this about digestive symptoms (bloating, reflux, irregularity) or liver health specifically?", "How much alcohol do you drink in a typical week, and do you take any regular medicines?"],
    suggestions: [
      "Do Khavinson peptides actually work in humans?",
      "Is it safe with my medications?",
      "How do peptide bioregulators work?",
      "Why am I tired in the afternoon?",
    ],
  },
  {
    id: "kidney",
    label: "Kidney health",
    patterns: [/\b(kidneys?|renal|urinary tract)\b/i],
    summary:
      "Pielotax is a natural kidney peptide complex (A-9) from the Khavinson line, while Renefort is a herbal formula with cowberry leaf, horsetail and magnesium for normal filtration. Researchers have investigated kidney peptides in ageing kidney-cell cultures, where they activated cell-renewal markers, and in rats. The difference is a tissue-specific peptide course versus a daily herbal formula. Because the kidneys clear many supplements, check with your clinician first if you have any kidney concern.",
    sections: [
      {
        heading: "What the research says",
        body: "Kidney peptide research (a kidney polypeptide complex and the AED peptide) consists of cell-culture and rat studies from Khavinson's group. There are no human trials of oral kidney peptide products.",
      },
    ],
    sourceIds: ["pmid:24958378", "pmid:30607912"],
    evidenceNote: "Cell and rat studies only.",
    pubmedQuery: "kidney peptide Khavinson",
    products: [
      {
        id: "pielotax",
        why: "A natural kidney peptide complex (A-9) the catalog describes for healthy kidney function.",
        evidenceNote:
          "Research is cell and rat work only; Pielotax itself has no published human trials.",
      },
      {
        id: "renefort",
        why: "A kidney-focused formula for healthy filtration and renal function.",
        evidenceNote:
          "No published trials of Renefort itself; kidney peptide research is animal and cell work.",
      },
      {
        id: "revilab-sl-08",
        why: "Sublingual blend of bladder, vascular-wall and immune peptide complexes for the urinary tract.",
        evidenceNote:
          "No published trials of Revilab SL 08 itself.",
      },
      {
        id: "chitomur",
        why: "A Khavinson Cytomax: a natural bladder peptide complex (A-12), believed to support normal bladder function.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Chitomur as a finished product has no published human trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is this about general kidney health, or has a doctor mentioned your kidney function (eGFR)?", "Is your goal prevention, or getting back to normal function?"],
    suggestions: [
      "Is it safe with my medications?",
      "Do Khavinson peptides actually work in humans?",
      "How do peptide bioregulators work?",
    ],
  },
  {
    id: "men",
    label: "Men's health after 40",
    patterns: [
      /\b((?:[4-9]\d)[- ]?(?:year|yr)s?[- ]?old (?:man|male|guy)|(?:man|men|male|guy) (?:over|in (?:his|my) )?(?:[4-9]0s?|forties|fifties|sixties)|men'?s health|middle[- ]aged (?:man|men)|what should (?:a|an) (?:\d+|older) (?:year[- ]old )?man take)\b/i,
    ],
    summary:
      "Endoluten and Vladonix are the classic Khavinson pairing for healthy ageing: a pineal peptide complex and a thymus peptide complex, each taken as its own course. GPL Man combines pineal, brain, vascular, liver, pancreas and testes peptide complexes in a single formula instead. Researchers have investigated pineal and thymus peptides in cell, animal and small human studies of related injectable extracts, so this is an emerging area rather than a settled one.",
    sections: [
      {
        heading: "If you're considering bioregulators",
        body: "In the Khavinson tradition, the pineal complex (Endoluten) and the thymus complex (Vladonix) are the most commonly used foundation pairing for healthy ageing. The human evidence behind them comes from small studies of related injectable extracts (Epithalamin and Thymalin) in older adults, so treat it as early.",
      },
      {
        heading: "Pick by goal",
        body: "Energy, sleep, joints, heart, focus and prostate or urinary comfort each point to different options — and some are best handled with your doctor first. Tell me your main goal and I'll narrow it down.",
      },
    ],
    sourceIds: ["pmid:17969590", "pmid:33237528"],
    evidenceNote:
      "Foundation-pairing evidence: small studies of injectable extracts in older adults.",
    pubmedQuery: "(prostate peptide OR testes peptide) AND Khavinson",
    products: [
      {
        id: "endoluten",
        why: "The catalog's foundational pineal peptide complex, commonly paired with Vladonix in healthy-ageing protocols.",
        evidenceNote:
          "Evidence is from related injectable pineal extracts in small studies; Endoluten itself hasn't been tested in published trials.",
      },
      {
        id: "vladonix",
        why: "The catalog's foundational thymus peptide complex for healthy immune function with age.",
        evidenceNote:
          "Evidence is from the injectable extract Thymalin; Vladonix itself hasn't been tested in published trials.",
      },
      {
        id: "gpl-man",
        why: "Men's peptide formula combining pineal, brain, vascular, liver, pancreas and testes peptide complexes.",
        evidenceNote:
          "No published trials of GPL Man itself; the component peptides have mostly cell and animal data.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["What's your main goal — energy, sleep, joints, heart, focus, or prostate/urinary comfort?", "Do you take any prescription medicines?", "Have you had routine blood work in the last year?"],
    suggestions: [
      "Why am I tired in the afternoon?",
      "My joints ache when I run",
      "What does the thymus peptide do?",
      "Do Khavinson peptides actually work in humans?",
    ],
  },
  {
    id: "male-reproductive",
    label: "Testosterone and prostate",
    patterns: [
      /\b(testosterone|libido|prostate|testicular|sperm|male fertility|urinat\w* at night|nocturia|weak (?:urine )?stream)\b/i,
    ],
    summary:
      "Testoluten is a natural testicular peptide complex (A-13) from the Khavinson line, and Revilab ML 07 is the men's formula combining testes, bladder, vascular-wall and pineal peptide complexes with omega-3s and L-carnitine. Both are built on the bioregulation idea that organ-specific peptides signal to their source tissue, though there are no published trials of these finished products. Testosterone declines slowly with age and low libido has many causes, so new urinary symptoms should be checked by a doctor.",
    sections: [
      {
        heading: "What the research says",
        body: "We couldn't find PubMed-indexed trials of testicular or prostate peptide supplements. The only indexed human studies in this line are 1991 Russian reports on an injectable prostate extract, which tell us little about today's oral products.",
      },
    ],
    sourceIds: [],
    evidenceNote:
      "No indexed human trials for testicular or prostate peptide products.",
    pubmedQuery: "(prostate peptide OR prostatilen) AND Khavinson",
    products: [
      {
        id: "testoluten",
        why: "A natural testicular peptide complex (A-13) the catalog describes for male reproductive function and hormonal balance.",
        evidenceNote:
          "There are no published human trials of testicular peptide products, including Testoluten.",
      },
      {
        id: "revilab-ml-07",
        why: "The men's formula: testes, bladder, vascular-wall and pineal peptide complexes with omega-3s and L-carnitine.",
        evidenceNote:
          "Testes and bladder peptide research is animal and cell work; Revilab ML 07 hasn't been tested in published trials.",
      },
      {
        id: "revilab-sl-09",
        why: "A sublingual blend of pineal, testes, bladder and prostate peptide complexes with plant extracts for male urogenital support.",
        evidenceNote: "No published trials of this formula.",
      },
      {
        id: "libidon",
        why: "A Khavinson peptide bioregulator associated with the prostate, believed to support normal male reproductive function.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Libidon as a finished product has no published human trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Have you had a morning testosterone test or a PSA discussion with your doctor?", "Is your main concern energy and libido, or urinary symptoms?"],
    suggestions: [
      "What should a 50-year-old man take?",
      "How can I sleep better?",
      "Do Khavinson peptides actually work in humans?",
    ],
  },
  {
    id: "women",
    label: "Menopause and cycle",
    patterns: [
      /\b(menopaus\w*|perimenopaus\w*|hot flash\w*|hot flush\w*|night sweats|periods?|menstrua\w*|pms|female hormones?|women'?s health|hormonal balance)\b/i,
    ],
    summary:
      "Zhenoluten is a natural ovarian peptide complex (A-15) from the Khavinson line, and GPL Femme combines pineal, brain, vascular, liver, thyroid and ovarian peptide complexes with alpha-lipoic acid in a single formula. Researchers have investigated organ-specific peptides mainly in cell and animal work, and there are no published trials of these finished products for menopause comfort. Hot flushes, poor sleep and mood changes vary widely, so knowing which matters most helps narrow the picks.",
    sections: [
      {
        heading: "What the research says",
        body: "We don't have strong trials of peptide or herbal formulas for menopause comfort to point you to; some herbs (such as hops) have small, mixed studies.",
      },
    ],
    sourceIds: [],
    evidenceNote: "Limited evidence for peptide or herbal formulas.",
    pubmedQuery: "(ovarian peptide OR pineal peptide) AND (menopause OR reproductive) AND Khavinson",
    products: [
      {
        id: "zhenoluten",
        why: "A Khavinson Cytomax: a natural ovarian peptide complex (A-15), believed to support normal ovarian function.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Zhenoluten as a finished product has no published human trials.",
      },
      {
        id: "gpl-femme",
        why: "Women's peptide formula combining pineal, brain, vascular, liver, thyroid and ovarian peptide complexes.",
        evidenceNote:
          "No published trials of GPL Femme itself; the component peptides have mostly cell and animal data.",
      },
      {
        id: "revilab-ml-08",
        why: "The women's formula: pineal, vascular-wall, cartilage and bladder peptide complexes with omega-3s.",
        evidenceNote:
          "No published trials of Revilab ML 08 itself.",
      },
      {
        id: "revilab-sl-10",
        why: "A sublingual blend of pineal, vascular-wall and bladder peptide complexes with plant extracts, positioned for female neuroendocrine balance and cycle comfort.",
        evidenceNote: "No published trials of this formula.",
      },
      {
        id: "mamiton",
        why: "A herbal formula (motherwort, hops, nettle, resveratrol and others) designed around the female reproductive system.",
        evidenceNote:
          "Some of its herbs have small, mixed studies; Mamiton itself hasn't been tested.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Are you perimenopausal, post-menopausal, or asking about cycle-related symptoms?", "Are you on hormone therapy or any other medicines?"],
    suggestions: [
      "How can I sleep better?",
      "Is it safe with my medications?",
      "Do Khavinson peptides actually work in humans?",
    ],
  },
  {
    id: "skin",
    label: "Skin, hair and nails",
    patterns: [
      /\b(skin|wrinkl\w*|collagen|elasticity|complexion|hair|nails?|fine lines)\b/i,
    ],
    summary:
      "Prime Peptide Collagen pairs marine collagen with the IPH AEN peptide, vitamin C, copper and biotin, nutrients involved in collagen formation, while Mesotel Beauty is a choline-based formula with gotu kola, goji and zinc. Researchers have investigated short peptides such as KE, KED and AEDG in ageing human skin fibroblasts, and hydrolysed collagen has its own body of controlled trials for skin hydration and elasticity. The difference is a peptide-plus-collagen formula versus an antioxidant nutrient blend.",
    sections: [
      {
        heading: "What the research says",
        body: "A meta-analysis of 19 trials (1,125 mostly female participants) found hydrolysed collagen improved skin hydration, elasticity and wrinkles versus placebo over about 90 days — though many trials were short and industry-funded.",
      },
    ],
    sourceIds: ["pmid:27259496", "pmid:33742704"],
    evidenceNote:
      "Collagen: meta-analysis of randomised trials, modest effects.",
    pubmedQuery: "skin fibroblast peptide aging Khavinson",
    products: [
      {
        id: "prime-peptide-collagen",
        why: "Contains marine collagen plus vitamin C, copper and biotin — nutrients involved in collagen formation and skin, hair and nail structure.",
        evidenceNote:
          "Collagen trials tested various products; this formula itself hasn't been studied.",
      },
      {
        id: "mesotel-beauty",
        why: "Choline-based antioxidant formula with gotu kola, goji, zinc and vitamins for skin.",
        evidenceNote:
          "Gotu kola and zinc have small studies for skin; this formula itself hasn't been tested in published trials.",
      },
      {
        id: "anti-wrinkle-serum-7",
        why: "A topical peptide serum for skin firmness and hydration.",
        evidenceNote: "No published trials of this serum.",
      },
      {
        id: "anti-age-nb-activity",
        why: "Positioned in its line as a collagen activator for skin and connective tissue.",
        evidenceNote:
          "No published trials of this formula itself.",
      },
      {
        id: "imusil",
        why: "Supports skin barrier function and natural defences.",
        evidenceNote:
          "No published trials of Imusil itself.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is your goal prevention, or getting back to normal function?", "Would you like these products' manufacturer protocols compared?"],
    suggestions: [
      "Is collagen safe with my medications?",
      "Do Khavinson peptides actually work in humans?",
      "How do peptide bioregulators work?",
    ],
  },
  {
    id: "muscle",
    label: "Muscle and recovery",
    patterns: [
      /\b(muscles?|strength|recovery|workouts?|athlet\w*|gym|endurance|lifting|sarcopenia|protein intake)\b/i,
    ],
    summary:
      "Gotratix is a natural muscle-tissue peptide complex (A-18) from the Khavinson line taken as a course, while Reviform Cocktail is a protein, vitamin and mineral shake that helps you reach a daily protein target. The muscle peptide line hasn't been studied in published trials, so Gotratix rests on the general bioregulation idea rather than product-specific research. Protein intake and training remain the base that any supplement builds on.",
    sections: [
      {
        heading: "What the research says about muscle peptides",
        body: "The muscle peptide complex line isn't indexed in PubMed; the athlete reports in its marketing are not published trials.",
      },
    ],
    sourceIds: [],
    pubmedQuery: "creatine supplementation resistance training muscle strength",
    evidenceNote:
      "No published trials for muscle peptide products.",
    products: [
      {
        id: "gotratix",
        why: "A natural muscle-tissue peptide complex (A-18) the catalog describes for muscle strength, endurance and recovery.",
        evidenceNote:
          "Gotratix isn't indexed in PubMed and has no published human trials.",
      },
      {
        id: "reviform-cocktail",
        why: "A protein, vitamin and mineral shake that can help you reach a daily protein target.",
        evidenceNote:
          "Protein intake has strong evidence; this shake is simply one convenient way to get it.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["What does your training look like now, and roughly how much protein do you eat a day?", "Is your goal prevention, or getting back to normal function?"],
    suggestions: [
      "My joints ache when I run",
      "How can I sleep better?",
      "Do Khavinson peptides actually work in humans?",
    ],
  },
  {
    id: "thyroid",
    label: "Thyroid",
    patterns: [/\b(thyroid|tsh|t4|t3|iodine)\b/i],
    summary:
      "Thyreogen is a natural thyroid-gland peptide complex (A-2) and Bonothyrk a natural parathyroid peptide complex (A-21), both Khavinson Cytomaxes taken as courses. The thyroid sets the pace of energy use and temperature, while the parathyroid glands help keep calcium balanced. A controlled Russian study investigated a thyroid peptide bioregulator in older adults in a low-iodine region, though its published details are brief. Iodine and selenium also matter for the thyroid, but extra iodine can backfire without testing.",
    sections: [
      {
        heading: "What the research says",
        body: "A controlled Russian study tested a thyroid peptide bioregulator in older adults with reduced thyroid function in a low-iodine region; the published details are limited.",
      },
    ],
    sourceIds: ["pmid:16075681"],
    evidenceNote: "One small Russian controlled study with limited detail.",
    pubmedQuery: "thyroid peptide bioregulator",
    products: [
      {
        id: "thyreogen",
        why: "A natural thyroid-gland peptide complex (A-2) the catalog describes for thyroid support.",
        evidenceNote:
          "Thyroid peptide evidence is one small Russian study; Thyreogen itself hasn't been tested, and it is not a substitute for thyroid medicine.",
      },
      {
        id: "bonothyrk",
        why: "A Khavinson Cytomax: a natural parathyroid gland peptide complex (A-21), believed to support normal parathyroid function and calcium balance.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Bonothyrk as a finished product has no published human trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Have you had your TSH checked, and do you take thyroid medicine?", "Is your goal prevention, or getting back to normal function?"],
    suggestions: [
      "Why am I tired in the afternoon?",
      "Is it safe with my medications?",
      "Do Khavinson peptides actually work in humans?",
    ],
  },
  {
    id: "stress",
    label: "Stress and mood",
    patterns: [
      /\b(stress\w*|anxious|worr\w*|overwhelm\w*|burn ?out|burnt out|low mood|mood|irritab\w*|calm)\b/i,
    ],
    summary:
      "Glandokort is a natural adrenal gland peptide complex from the Khavinson line, believed to support the body's everyday stress response, while Panaxod is built on Panax ginseng, an adaptogen with modest, mixed evidence in small studies. The difference is a tissue-specific peptide course versus a daily plant adaptogen, and ginseng can interact with some medicines. If low mood or worry has affected your sleep, appetite or work for more than two weeks, get support from a clinician.",
    sections: [
      {
        heading: "What the research says",
        body: "Ginseng has modest, mixed evidence for fatigue and wellbeing in small studies; it can interact with some medicines.",
      },
    ],
    sourceIds: ["pmid:29624410", "ref:nccih-ginseng"],
    evidenceNote: "Adaptogens: modest, mixed evidence.",
    pubmedQuery: "(adaptogen OR peptide bioregulator) AND stress",
    products: [
      {
        id: "glandokort",
        why: "A Khavinson peptide bioregulator associated with the adrenal glands, believed to support the body's normal stress response.",
        evidenceNote:
          "Researchers have investigated organ-specific peptides mostly in cell and animal work; Glandokort as a finished product has no published human trials.",
      },
      {
        id: "panaxod",
        why: "Built on Panax ginseng, an adaptogen traditionally used for stress resilience and energy.",
        evidenceNote:
          "Ginseng evidence is modest; the finished formula hasn't been tested.",
      },
      {
        id: "felicita",
        why: "Mood-support formula for a balanced, positive mood and stress resilience.",
        evidenceNote:
          "No published trials of Felicita itself.",
      },
      {
        id: "levain",
        why: "Blend of nine plant adaptogens for stress resilience and recovery from fatigue.",
        evidenceNote:
          "Adaptogen evidence is mixed and mostly small studies; Levain itself hasn't been tested in published trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is this day-to-day stress, or has low mood or worry been affecting your sleep, appetite or work for weeks?", "Is your goal prevention, or getting back to normal function?"],
    suggestions: [
      "How can I sleep better?",
      "Why am I tired in the afternoon?",
      "Is ginseng safe with my medications?",
    ],
  },
  {
    id: "longevity",
    label: "Healthy ageing",
    patterns: [
      /\b(anti-?aging|anti-?ageing|aging|ageing|longevity|live longer|healthy aging|healthy ageing|geroprotect\w*|lifespan|age better|slow (?:down )?aging)\b/i,
    ],
    summary:
      "Endoluten is the Khavinson pineal peptide complex at the centre of most healthy-ageing protocols, and Revilab ML 01 combines pineal, immune and liver peptide complexes with resveratrol, choline and omega-3s. Researchers have investigated how short peptides influence gene activity in ageing cells and animals, with small human studies of related injectable extracts in older adults. No supplement has been shown in robust human trials to slow ageing, so this remains an emerging field.",
    sections: [
      {
        heading: "Where peptide bioregulators fit",
        body: "Peptide bioregulators were developed in Russia as 'geroprotectors'. The best-known human data — small studies of injectable pineal and thymus extracts in older adults — reported lower mortality, but they haven't been independently replicated, and oral products haven't been tested in comparable trials.",
      },
    ],
    sourceIds: ["pmid:17969590", "pmid:32399807"],
    evidenceNote:
      "Small, single-network human studies of injectable extracts; no independent trials of oral products.",
    pubmedQuery: "geroprotector peptide Khavinson aging",
    products: [
      {
        id: "endoluten",
        why: "The catalog's foundational pineal peptide complex, commonly paired with Vladonix in healthy-ageing protocols.",
        evidenceNote:
          "Evidence is from related injectable pineal extracts; Endoluten itself hasn't been tested in published trials.",
      },
      {
        id: "revilab-ml-01",
        why: "Multi-system formula: pineal, immune and liver peptide complexes with resveratrol, choline, omega-3s and vitamins A, C and E.",
        evidenceNote:
          "Peptide research is mostly cell and animal work; Revilab ML 01 hasn't been tested in published trials.",
      },
      {
        id: "vladonix",
        why: "The catalog's foundational thymus peptide complex, commonly paired with Endoluten.",
        evidenceNote:
          "Evidence is from the injectable extract Thymalin; Vladonix itself hasn't been tested in published trials.",
      },
      {
        id: "revilab-anti-age",
        why: "Antioxidant formula with carnosine, astaxanthin and alpha-lipoic acid for protein and cell upkeep with age.",
        evidenceNote:
          "Ingredient research is mostly lab and small human studies; this formula hasn't been tested in published trials.",
      },
      {
        id: "anti-age-nb-health",
        why: "Positioned in its line as a glycation (AGE) protector for protein structure with age.",
        evidenceNote:
          "No published trials of this formula itself.",
      },
      {
        id: "mesotel-neo",
        why: "Choline-based antioxidant formula with gotu kola, goji, zinc, vitamins and resveratrol.",
        evidenceNote:
          "No published trials of Mesotel Neo itself.",
      },
      {
        id: "zinsil-t",
        why: "Zinc, glycine and vitamin B6 for everyday upkeep with age.",
        evidenceNote:
          "Zinc and B6 matter most when intake is low; Zinsil-T itself hasn't been tested in published trials.",
      },
      {
        id: "complex-3d",
        why: "Antioxidant blend (vitamins C, E and A, selenium, cysteine, dihydroquercetin) for cellular antioxidant defences.",
        evidenceNote:
          "No published trials of Complex 3D itself.",
      },
      {
        id: "prime-peptide-protect",
        why: "Antioxidant peptide formula with broccoli extract and mushrooms from the Prime Peptide line.",
        evidenceNote:
          "Its peptide data is the manufacturer's lab and animal work; no independent human trials.",
      },
      {
        id: "indosine",
        why: "Indole-3-carbinol, broccoli extract, CoQ10 and antioxidant enzymes for cellular upkeep.",
        evidenceNote:
          "Ingredient research is mostly lab work; Indosine itself hasn't been tested in published trials.",
      },
    ],
    maxProducts: 2,
    productPolicy: "symptom",
    followUps: ["Is there a specific area you care most about — energy, sleep, joints, heart, focus or skin?", "Is your goal prevention, or getting back to normal function?"],
    suggestions: [
      "Do Khavinson peptides actually work in humans?",
      "What is Epitalon?",
      "What does the thymus peptide do?",
      "What should a 50-year-old man take?",
    ],
  },
];

export const TOPICS_BY_ID = new Map(TOPICS.map(t => [t.id, t]));

/**
 * Product-specific research lineage for "does X work / tell me about X" questions.
 * Keeps ingredient evidence clearly separate from evidence for the finished product.
 */
export const PRODUCT_EVIDENCE: Record<
  string,
  { lineage: string; sourceIds: string[]; productNote: string }
> = {
  endoluten: {
    lineage:
      "a natural pineal gland peptide complex (A-8), the oral counterpart in the same tradition as the injectable drug Epithalamin",
    sourceIds: [
      "pmid:17969590",
      "pmid:17426848",
      "pmid:29124531",
      "pmid:12937682",
    ],
    productNote:
      "Endoluten itself has no published human trials; the research is on related injectable extracts and the AEDG peptide.",
  },
  vladonix: {
    lineage:
      "a natural thymus peptide complex (A-6), related to the injectable drug Thymalin",
    sourceIds: ["pmid:14523363", "pmid:33237528", "pmid:35408963"],
    productNote:
      "Vladonix itself has no published human trials; the research is on injectable Thymalin and lab studies.",
  },
  crystagen: {
    lineage: "a synthesized thymus peptide (cytogen)",
    sourceIds: ["pmid:35408963", "pmid:33237528"],
    productNote:
      "Crystagen isn't indexed in PubMed; thymic peptide evidence is mostly lab work.",
  },
  cartalax: {
    lineage:
      "a synthesized cartilage tripeptide, AED (Ala-Glu-Asp, also called T-31)",
    sourceIds: ["pmid:32399807", "pmid:18306703", "pmid:30368550"],
    productNote:
      "Cartalax isn't indexed in PubMed and has no published human trials; AED research is cell and rat work.",
  },
  visoluten: {
    lineage: "a natural eye-tissue peptide complex (A-11)",
    sourceIds: ["pmid:12195242", "pmid:11521426", "pmid:30859383"],
    productNote:
      "Visoluten isn't indexed in PubMed; related studies used injectable retinal drugs.",
  },
  ventfort: {
    lineage: "a natural blood-vessel peptide complex (A-3)",
    sourceIds: ["pmid:27383168", "pmid:36611900", "pmid:25408528"],
    productNote:
      "Ventfort isn't indexed in PubMed; vascular peptide research is cell and animal work.",
  },
  vesugen: {
    lineage:
      "a synthesized vascular peptide (cytogen) built on the KED (Lys-Glu-Asp) sequence",
    sourceIds: ["pmid:36611900", "pmid:32399807", "pmid:39518916"],
    productNote:
      "Vesugen has no published human trials; KED research is in cells.",
  },
  chelohart: {
    lineage: "a natural heart-muscle peptide complex (A-14)",
    sourceIds: ["pmid:36611900"],
    productNote: "Chelohart has no published human trials.",
  },
  thyreogen: {
    lineage: "a natural thyroid-gland peptide complex (A-2)",
    sourceIds: ["pmid:16075681"],
    productNote:
      "Thyreogen itself hasn't been tested in published trials, and it is not a substitute for thyroid medicine.",
  },
  pielotax: {
    lineage: "a natural kidney peptide complex (A-9)",
    sourceIds: ["pmid:24958378", "pmid:26515176"],
    productNote:
      "Pielotax has no published human trials; kidney peptide research is cell and rat work.",
  },
  testoluten: {
    lineage: "a natural testicular peptide complex (A-13)",
    sourceIds: [],
    productNote:
      "We found no PubMed-indexed human trials of testicular peptide products.",
  },
  gotratix: {
    lineage: "a natural muscle-tissue peptide complex (A-18)",
    sourceIds: [],
    productNote:
      "Gotratix isn't indexed in PubMed; athlete reports in marketing aren't published trials.",
  },
  bonomarlot: {
    lineage: "a natural bone-marrow peptide complex (A-20)",
    sourceIds: [],
    productNote: "Bonomarlot has no published human trials.",
  },
  panaxod: {
    lineage: "a Panax ginseng adaptogen complex",
    sourceIds: ["pmid:29624410", "ref:nccih-ginseng"],
    productNote:
      "Panaxod as a finished formula hasn't been tested; the research is on ginseng.",
  },
  retisil: {
    lineage: "a lutein and zeaxanthin eye formula",
    sourceIds: ["pmid:23644932", "ref:nei-areds"],
    productNote:
      "Retisil itself hasn't been tested; lutein/zeaxanthin trials used specific formulas.",
  },
  olecap: {
    lineage: "a salmon and flaxseed oil omega-3 formula",
    sourceIds: ["ref:ods-omega3"],
    productNote:
      "Olecap itself hasn't been tested; omega-3 research is extensive but mixed for healthy people.",
  },
  "prime-peptide-collagen": {
    lineage:
      "a marine collagen formula built around the proprietary IPH AEN peptide",
    sourceIds: ["pmid:33742704", "pmid:30368550"],
    productNote:
      "The IPH peptide complex has no independent published trials; the research is on collagen in general.",
  },
};
