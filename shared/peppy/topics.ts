/**
 * Peppy curated knowledge: topics → direct answer, research, products, follow-ups.
 *
 * Writing rules (enforced by tests):
 *  - Answer the question first, specifically. Products are secondary.
 *  - Product `why` / `evidenceNote` lines are structure/function only (claims.ts).
 *  - Prose never ties a product name to a disease or to treat/cure/prevent language.
 *  - sourceIds must exist in research-registry.ts; product ids must exist in the catalog.
 *  - Product mappings follow each SKU's actual ingredients (e.g. Revilab ML 07 is the men's
 *    formula, ML 03 is brain/retina) — the old keyword map got several of these wrong.
 */
import type { AnswerSection, SafetyNotice } from "./types.js";

export interface TopicProduct {
  id: string;
  why: string;
  evidenceNote: string;
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
}

export const TOPICS: Topic[] = [
  {
    id: "fatigue",
    label: "Energy and tiredness",
    patterns: [
      /\b(tired\w*|fatigu\w*|exhaust\w*|low energy|no energy|lack of energy|more energy|energy levels?|energy|sluggish|drained|wiped out|afternoon (?:slump|crash|dip)|crash(?:ing)? in the afternoon|run down|worn out|lethargic)\b/i,
    ],
    summary:
      "Tiredness is usually driven by everyday factors — short or broken sleep, a heavy refined-carb meal, caffeine timing, dehydration, stress or too little movement — and a mild early-afternoon dip is normal body-clock behaviour. If you feel tired most days for more than 2–3 weeks, check common fixable causes (sleep quality, iron, B12, thyroid) with your clinician before reaching for supplements.",
    sections: [
      {
        heading: "What usually drives it",
        body: "- **Sleep debt or poor-quality sleep** — including snoring or waking unrefreshed, which can signal sleep apnea.\n- **A big, refined-carb lunch** — a lunch built on protein, fibre and vegetables, in a moderate portion, blunts the slump.\n- **Caffeine timing** — a mid-morning coffee can wear off by 2–3 pm, and caffeine after early afternoon can disturb that night's sleep and feed the cycle.\n- **Sitting still and dehydration** — a 10-minute walk outdoors after lunch and a glass of water are simple, reliable fixes.\n- **Medical causes** — low iron stores (especially with heavy periods or a plant-based diet), low B12, thyroid problems, low mood, and some medicines (antihistamines, beta-blockers, some antidepressants).",
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
    sourceIds: [
      "pmid:22777991",
      "pmid:29624410",
      "pmid:24389208",
      "ref:medlineplus-fatigue",
      "ref:ods-iron",
    ],
    evidenceNote:
      "Strongest evidence: iron when stores are low (randomised trial). Ginseng and CoQ10 evidence for everyday tiredness is modest.",
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
    ],
    productPolicy: "symptom",
    followUps: [
      "How long has the tiredness been going on, and is it mainly in the afternoon or all day?",
      "How are you sleeping — roughly how many hours, and do you snore or wake up unrefreshed?",
      "Do you have heavy periods, follow a plant-based diet, or take any regular medicines?",
    ],
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
      "The biggest, best-proven levers for sleep are behavioural: a fixed wake-up time, bright light in the morning, no caffeine after early afternoon, and a cool, dark, quiet bedroom. For ongoing trouble sleeping (3+ nights a week for 3+ months), CBT-I — a structured sleep programme — is the first-line approach and works better long-term than pills. Supplements play a smaller supporting role.",
    sections: [
      {
        heading: "Practical steps that work",
        body: "- Get up at the same time every day, even after a bad night.\n- Get 10–30 minutes of outdoor light soon after waking.\n- Stop caffeine about 8 hours before bed; alcohol fragments the second half of the night.\n- Give yourself a dim, screen-light wind-down hour. If you're awake for more than ~20 minutes, get up and do something calm until sleepy.\n- Keep naps short (under 20 minutes) and before mid-afternoon.",
      },
      {
        heading: "What the research says about supplements",
        body: "Melatonin has the best supplement evidence, but the effect is modest: a meta-analysis of 19 trials found people fell asleep about 7 minutes faster and slept about 8 minutes longer. It's most useful for shifting your body clock (jet lag, a late sleep schedule). Pineal peptide preparations were studied by Khavinson's group mainly for raising night-time melatonin in older adults — small Russian studies that measured hormone levels, not sleep quality.",
      },
      {
        heading: "When to get checked",
        body: "Loud snoring, gasping at night, or daytime sleepiness despite enough time in bed can point to sleep apnea — that needs a sleep study, not a supplement. Ongoing low mood, pain or medicines can also drive poor sleep.",
      },
    ],
    sourceIds: [
      "pmid:23691095",
      "pmid:17969590",
      "pmid:28849889",
      "pmid:11524632",
      "ref:nccih-melatonin",
      "ref:medlineplus-sleep",
    ],
    evidenceNote:
      "Melatonin: meta-analysis, modest benefit. Pineal peptides: small human and animal studies of melatonin levels, not sleep outcomes.",
    products: [
      {
        id: "endoluten",
        why: "A pineal gland peptide complex (A-8) — the gland that makes melatonin — which the catalog describes for healthy melatonin rhythm.",
        evidenceNote:
          "Pineal peptide research is mostly small Russian studies of injectable extracts measuring melatonin; Endoluten itself has no published sleep trial.",
      },
      {
        id: "pinalex-tab",
        why: "A pineal-support tablet the catalog positions for the sleep–wake rhythm and healthy melatonin production.",
        evidenceNote:
          "No published trials of this formula, and its full ingredient list isn't on our product page yet — ask us before buying if you need it.",
      },
    ],
    productPolicy: "symptom",
    followUps: [
      "Is the main problem falling asleep, staying asleep, or waking too early?",
      "Roughly how long has it been going on?",
      "Do you snore, or take any sleep, mood or blood-thinning medicines?",
    ],
    suggestions: [
      "Can I take Endoluten with melatonin?",
      "What is Epitalon?",
      "Tell me about Endoluten",
      "Why am I tired in the afternoon?",
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
      "Most everyday joint aches come from load — more activity, or a new kind of activity, than the joint and the muscles around it are used to — or from gradual age-related wear. The best-supported steps are adjusting the activity, strengthening the surrounding muscles, staying active and managing weight; supplements have modest evidence at best.",
    sections: [
      {
        heading: "What helps most",
        body: "- Ease off whatever aggravates it for 1–2 weeks, then build back gradually (runners often cap weekly increases at about 10%).\n- Strength work 2–3 times a week for the muscles around the joint — quads, glutes, hips and calves take load off knees and hips.\n- Keep moving: low-impact activity such as walking, cycling or swimming usually eases stiffness better than rest.\n- If you run or walk a lot, mix surfaces and check shoe wear (often replaced every 500–800 km).\n- If you carry extra weight, losing even a few kilograms noticeably reduces knee load.\n- Use ice or heat for comfort.",
      },
      {
        heading: "What the research says",
        body: "Collagen has the best supplement data: a meta-analysis of placebo-controlled trials found a modest improvement in overall joint symptom scores and stiffness, but not in pain alone. In the large GAIT trial, glucosamine and chondroitin did no better than placebo for knee pain overall. Short cartilage peptides (such as the AED tripeptide) have only cell and animal studies so far.",
      },
      {
        heading: "See a clinician or physio if",
        body: "the joint swells, locks or gives way, looks red or feels hot, hurts at night or at rest, or the pain persists after 2–3 weeks of easing off.",
      },
    ],
    sourceIds: [
      "pmid:30368550",
      "pmid:16495392",
      "pmid:32399807",
      "pmid:18306703",
      "ref:niams-oa",
      "ref:nccih-glucosamine",
    ],
    evidenceNote:
      "Collagen: meta-analysis, modest effect. Glucosamine/chondroitin: large trial, no overall benefit. Cartilage peptides: lab and animal studies only.",
    products: [
      {
        id: "cartalax",
        why: "A synthesized cartilage tripeptide (Ala-Glu-Asp) that the catalog describes for healthy cartilage and connective-tissue metabolism.",
        evidenceNote:
          "Research on this peptide is cell and animal work; Cartalax as a finished product has no published human trials.",
      },
      {
        id: "prime-peptide-collagen",
        why: "Contains marine collagen — the supplement ingredient with the most trial data for joint comfort — plus vitamin C.",
        evidenceNote:
          "Collagen trials used various products and amounts; this formula itself hasn't been tested.",
      },
      {
        id: "revilab-ml-09",
        why: "Pairs cartilage and vascular-wall peptide complexes with chondroitin sulfate and omega-3s for joint and connective-tissue support.",
        evidenceNote:
          "Chondroitin has mixed trial results; the full formula hasn't been studied in published trials.",
      },
    ],
    productPolicy: "symptom",
    followUps: [
      "Which joint is it — knee, hip, ankle — and one side or both?",
      "Any swelling, clicking or locking, or pain at rest or at night?",
      "Did anything change recently — more activity, a new sport or shoes, or a knock or twist?",
    ],
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
      "Epitalon (also spelled Epithalon; sequence Ala-Glu-Asp-Gly, or AEDG) is a synthetic four-amino-acid peptide modelled on Epithalamin, a peptide extract of the pineal gland developed by Prof. Vladimir Khavinson's group in St. Petersburg. It's studied mainly for melatonin rhythm and the biology of ageing. The evidence is intriguing but early: mostly cell and animal studies plus small human studies from the same research network.",
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
    sourceIds: [
      "pmid:12937682",
      "pmid:14501183",
      "pmid:17969590",
      "pmid:17426848",
      "pmid:29124531",
      "pmid:9701766",
    ],
    evidenceNote:
      "Mostly cell and animal research plus small, single-network human studies; no large independent trials.",
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
      /\b(thymus|thymic|thymalin|thymogen|vilon|immune|immunity|immune system|t[- ]cells?|catch(?:ing)? (?:every )?colds?|get sick (?:often|a lot))\b/i,
    ],
    summary:
      "The thymus is a small gland behind the breastbone where T cells — a key part of the immune system — mature. It shrinks steadily from adolescence, so older adults produce fewer new T cells. 'Thymus peptides' are short peptides or extracts from the thymus (such as the Russian drug Thymalin) that Khavinson's group studied for supporting immune function with age.",
    sections: [
      {
        heading: "What the research shows",
        body: "- **Humans:** in a 6–8-year study of 266 older adults, injectable Thymalin (alone or with Epithalamin) was linked to fewer respiratory illnesses and lower mortality — but the trial is small, old and run by the developers.\n- **Lab:** Thymalin and its active dipeptides (KE and EW) shift immune-cell maturation markers and inflammatory signalling in cell cultures.\n- Thymalin has also been used as an add-on in Russian hospital care; those small studies don't tell us what oral supplements do.",
      },
      {
        heading: "What's uncertain",
        body: "The human studies used injected pharmaceutical extracts. Whether oral thymus peptide products change immune function in healthy people hasn't been tested in independent trials.",
      },
      {
        heading: "Immune basics with strong evidence",
        body: "7–9 hours of sleep, staying up to date on vaccines, regular physical activity, not smoking, enough protein, and correcting vitamin D if a test shows it's low.",
      },
    ],
    sourceIds: [
      "pmid:14523363",
      "pmid:33237528",
      "pmid:35408963",
      "pmid:37686182",
      "pmid:33575961",
    ],
    evidenceNote:
      "One small, older human trial of injectable extracts plus lab studies; no trials of oral products.",
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
    id: "khavinson-evidence",
    label: "Do Khavinson peptides work?",
    patterns: [
      /\b(khavinson|bioregulators?|peptides?|cytomax\w*|cytogens?)\b.*\b(work|works|working|effective|evidence|proof|proven|legit|scam|real|science|studies|research|trials?)\b/i,
      /\b(work|works|effective|evidence|proof|legit|scam)\b.*\b(khavinson|bioregulators?|cytomax\w*|cytogens?)\b/i,
    ],
    summary:
      "Honest answer: there is some human evidence, but it's limited and not convincing by modern standards. Most studies come from Khavinson's own network in Russia and Ukraine, were small, often weren't properly blinded, and used injectable pharmaceutical extracts rather than oral supplements. Large independent randomised trials haven't been done.",
    sections: [
      {
        heading: "What's been reported in humans",
        body: "- 266 older adults followed for 6–8 years: groups given injectable Thymalin and/or Epithalamin had lower reported mortality.\n- A 12-year randomised study of Epithalamin in older adults with heart disease reported lower mortality and better exercise tolerance.\n- Small studies of pineal peptides reported higher night-time melatonin in older people.",
      },
      {
        heading: "Why scientists stay cautious",
        body: "- One research network, rarely replicated independently.\n- Small samples and unclear randomisation or blinding; many papers are in Russian with limited methods detail.\n- Injectable drugs aren't oral capsules. Oral absorption is plausible (gut transporters carry di- and tripeptides) but unproven for these products.\n- The proposed mechanism — peptides regulating genes — comes mainly from cell and computer-modelling studies.",
      },
      {
        heading: "How to read product claims",
        body: "Treat lifespan or telomere numbers in marketing as early research, not proof. If you try a bioregulator, treat it as a personal experiment with your clinician's knowledge, track something you can measure, and stop if you notice side effects.",
      },
    ],
    sourceIds: [
      "pmid:14523363",
      "pmid:17426848",
      "pmid:34834147",
      "pmid:19830585",
      "pmid:35887081",
      "pmid:24003726",
    ],
    evidenceNote:
      "Small, single-network human trials of injectable extracts; mechanism mostly lab-based; no independent large trials.",
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
      "Peptide bioregulators are very short chains of amino acids (usually 2–4) that Khavinson's group proposes act as tissue-specific signals: they're thought to enter cells and influence which genes are switched on. Cytomaxes are natural peptide complexes extracted from young animal organs; Cytogens are synthesized copies of key short peptides; Revilab formulas blend several with vitamins and plant extracts.",
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
      "For everyday eye health, the best-supported habits are not smoking, eating plenty of leafy greens and colourful vegetables, wearing UV-blocking sunglasses, getting regular eye exams, and the 20-20-20 rule for screen strain (every 20 minutes, look about 20 feet away for 20 seconds). Lutein and zeaxanthin are the most-studied eye nutrients; the AREDS2 formula is specifically for people already diagnosed with intermediate macular degeneration.",
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
    sourceIds: [
      "pmid:23644932",
      "ref:nei-areds",
      "pmid:12195242",
      "pmid:11521426",
      "pmid:30859383",
    ],
    evidenceNote:
      "Lutein/zeaxanthin: large randomised trial in people at risk of AMD. Retinal peptides: small Russian studies of injectable drugs.",
    products: [
      {
        id: "retisil",
        why: "Built on lutein and zeaxanthin, the carotenoids concentrated in the macula and the best-studied eye nutrients.",
        evidenceNote:
          "Lutein/zeaxanthin evidence comes from trials of specific formulas; Retisil itself hasn't been tested.",
      },
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
    ],
    productPolicy: "symptom",
    followUps: [
      "Is this about general eye health, screen strain, or an eye condition you've been diagnosed with?",
      "Have you noticed any recent change in your vision?",
    ],
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
      "The strongest levers for heart and blood-vessel health are well established: regular aerobic activity (about 150 minutes a week), not smoking, good sleep, a Mediterranean-style diet, and knowing — and managing with your doctor — your blood pressure, cholesterol and blood sugar. Supplements are a minor add-on at best.",
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
    sourceIds: [
      "pmid:36611900",
      "pmid:25408528",
      "pmid:27383168",
      "pmid:17426848",
      "ref:ods-omega3",
    ],
    evidenceNote:
      "Vascular peptides: cell and animal studies. Omega-3s: extensive but mixed evidence for healthy people.",
    products: [
      {
        id: "ventfort",
        why: "A natural blood-vessel peptide complex (A-3) the catalog describes for healthy blood vessels and circulation.",
        evidenceNote:
          "Vascular peptide evidence comes from cell and animal studies; Ventfort itself has no published human trials.",
      },
      {
        id: "olecap",
        why: "Salmon and flaxseed oil providing omega-3s (EPA, DHA and ALA), which support normal heart function.",
        evidenceNote:
          "Omega-3 research is extensive but mixed for healthy people; Olecap as a formula hasn't been studied.",
      },
      {
        id: "chelohart",
        why: "A natural heart-muscle peptide complex (A-14) the catalog describes for heart muscle cell support.",
        evidenceNote:
          "Evidence is limited to related lab research; Chelohart itself has no published human trials.",
      },
    ],
    productPolicy: "symptom",
    followUps: [
      "Is this about general heart health, or has your doctor flagged blood pressure, cholesterol or heart rhythm?",
      "Do you take any heart or blood-thinning medicines?",
    ],
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
      "The best-evidenced ways to protect memory and focus are sleep, regular exercise (it improves attention and memory at any age), managing blood pressure, treating hearing loss, staying socially and mentally active, and limiting alcohol. 'Brain fog' often traces back to poor sleep, stress, low iron or B12, thyroid problems or medicines.",
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
    sourceIds: [
      "pmid:39518916",
      "pmid:33396470",
      "pmid:24909721",
      "pmid:21978084",
    ],
    evidenceNote:
      "Brain peptides: cell and animal studies plus a review by the originating group; little human data.",
    products: [
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
    ],
    productPolicy: "symptom",
    followUps: [
      "Is this about day-to-day focus, or memory changes you or others have noticed?",
      "How are your sleep and stress levels lately?",
    ],
    suggestions: [
      "How can I sleep better?",
      "Tell me about Prime Peptide Brain",
      "Do Khavinson peptides actually work in humans?",
      "Why am I tired in the afternoon?",
    ],
  },
  {
    id: "digestion",
    label: "Liver and digestion",
    patterns: [
      /\b(liver|digest\w*|gut|bloat\w*|stomach|detox\w*|bile|gallbladder|indigestion|reflux|heartburn|constipat\w*|bowel)\b/i,
    ],
    summary:
      "Your liver doesn't need a 'detox' product — it clears substances continuously. What measurably helps liver health is limiting alcohol, keeping a healthy weight, staying active, and not taking unnecessary supplements or painkillers that strain the liver. For digestion, fibre, fluids, regular meals and identifying trigger foods help most.",
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
    sourceIds: ["ref:nccih-supplements-wisely"],
    evidenceNote:
      "Little human evidence for liver or digestive peptide products.",
    products: [
      {
        id: "revilab-ml-06",
        why: "Combines liver, pancreas and stomach-wall peptide complexes with omega-3s, licorice root and artichoke extract for digestive support.",
        evidenceNote:
          "No published trials of this formula; evidence for the individual ingredients is limited.",
      },
      {
        id: "digemax",
        why: "A digestive-enzyme support complex the catalog describes for comfortable digestion and nutrient absorption.",
        evidenceNote:
          "Its ingredient details are limited on our page and there are no published trials of the formula.",
      },
    ],
    productPolicy: "symptom",
    followUps: [
      "Is this about digestive symptoms (bloating, reflux, irregularity) or liver health specifically?",
      "How much alcohol do you drink in a typical week, and do you take any regular medicines?",
    ],
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
      "Kidney health mostly comes down to blood pressure, blood sugar, staying hydrated, and avoiding regular use of NSAID painkillers (ibuprofen, naproxen) and unnecessary supplements. If you have any kidney condition, check every supplement with your doctor first — the kidneys clear many of them.",
    sections: [
      {
        heading: "What the research says",
        body: "Kidney peptide research (a kidney polypeptide complex and the AED peptide) consists of cell-culture and rat studies from Khavinson's group. There are no human trials of oral kidney peptide products.",
      },
    ],
    sourceIds: ["pmid:24958378", "pmid:26515176"],
    evidenceNote: "Cell and rat studies only.",
    products: [
      {
        id: "pielotax",
        why: "A natural kidney peptide complex (A-9) the catalog describes for healthy kidney function.",
        evidenceNote:
          "Research is cell and rat work only; Pielotax itself has no published human trials.",
      },
    ],
    productPolicy: "symptom",
    followUps: [
      "Is this about general kidney health, or has a doctor mentioned your kidney function (eGFR)?",
    ],
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
      "There isn't one stack every man over 40 should take. The things with the strongest evidence in midlife aren't supplements: blood pressure, cholesterol and blood-sugar checks, colorectal cancer screening, strength training at least twice a week, 7–9 hours of sleep, and limiting alcohol. Supplements make sense to fill a measured gap (for example vitamin D or B12 when a test shows you're low) or to support a specific goal.",
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
    sourceIds: ["pmid:14523363", "pmid:17426848", "pmid:19830585"],
    evidenceNote:
      "Foundation-pairing evidence: small studies of injectable extracts in older adults.",
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
    ],
    productPolicy: "symptom",
    followUps: [
      "What's your main goal — energy, sleep, joints, heart, focus, or prostate/urinary comfort?",
      "Do you take any prescription medicines?",
      "Have you had routine blood work in the last year?",
    ],
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
      "Testosterone declines slowly with age (roughly 1% a year from about 40). Symptoms such as low libido, fatigue or loss of muscle are worth an early-morning blood test before trying anything, because many other things cause them. Sleep, strength training, a healthy weight and limiting alcohol have the best evidence for supporting normal levels. New urinary symptoms (getting up at night, a weak stream) should be checked by a doctor.",
    sections: [
      {
        heading: "What the research says",
        body: "We couldn't find PubMed-indexed trials of testicular or prostate peptide supplements. The only indexed human studies in this line are 1991 Russian reports on an injectable prostate extract, which tell us little about today's oral products.",
      },
    ],
    sourceIds: [],
    evidenceNote:
      "No indexed human trials for testicular or prostate peptide products.",
    products: [
      {
        id: "testoluten",
        why: "A natural testicular peptide complex (A-13) the catalog describes for male reproductive function and hormonal balance.",
        evidenceNote:
          "There are no published human trials of testicular peptide products, including Testoluten.",
      },
      {
        id: "revilab-sl-09",
        why: "A sublingual blend of pineal, testes, bladder and prostate peptide complexes with plant extracts for male urogenital support.",
        evidenceNote: "No published trials of this formula.",
      },
    ],
    productPolicy: "symptom",
    followUps: [
      "Have you had a morning testosterone test or a PSA discussion with your doctor?",
      "Is your main concern energy and libido, or urinary symptoms?",
    ],
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
      "Menopause symptoms such as hot flushes, poor sleep and mood changes vary widely. The best-evidenced options are lifestyle steps (layered clothing, a cooler bedroom, limiting alcohol and caffeine, regular exercise) and, for many women, hormone therapy or non-hormonal prescriptions discussed with a clinician. Most herbal and peptide products have limited evidence.",
    sections: [
      {
        heading: "What the research says",
        body: "We don't have strong trials of peptide or herbal formulas for menopause comfort to point you to; some herbs (such as hops) have small, mixed studies.",
      },
    ],
    sourceIds: [],
    evidenceNote: "Limited evidence for peptide or herbal formulas.",
    products: [
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
    productPolicy: "symptom",
    followUps: [
      "Are you perimenopausal, post-menopausal, or asking about cycle-related symptoms?",
      "Are you on hormone therapy or any other medicines?",
    ],
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
      "Daily broad-spectrum sunscreen, not smoking, and a topical retinoid are the best-proven ways to keep skin looking younger. Among supplements, hydrolysed collagen has the most trial data for skin hydration and elasticity.",
    sections: [
      {
        heading: "What the research says",
        body: "A meta-analysis of 19 trials (1,125 mostly female participants) found hydrolysed collagen improved skin hydration, elasticity and wrinkles versus placebo over about 90 days — though many trials were short and industry-funded.",
      },
    ],
    sourceIds: ["pmid:33742704"],
    evidenceNote:
      "Collagen: meta-analysis of randomised trials, modest effects.",
    products: [
      {
        id: "prime-peptide-collagen",
        why: "Contains marine collagen plus vitamin C, copper and biotin — nutrients involved in collagen formation and skin, hair and nail structure.",
        evidenceNote:
          "Collagen trials tested various products; this formula itself hasn't been studied.",
      },
      {
        id: "anti-wrinkle-serum-7",
        why: "A topical peptide serum for skin firmness and hydration.",
        evidenceNote: "No published trials of this serum.",
      },
    ],
    productPolicy: "symptom",
    followUps: [],
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
      "Muscle strength and recovery are driven mainly by progressive resistance training, enough protein (about 1.2–1.6 g per kg of body weight a day for active adults, spread across meals), sleep, and adequate total calories. Creatine monohydrate is the best-studied supplement for strength — Pure Fire doesn't sell it.",
    sections: [
      {
        heading: "What the research says about muscle peptides",
        body: "The muscle peptide complex line isn't indexed in PubMed; the athlete reports in its marketing are not published trials.",
      },
    ],
    sourceIds: [],
    pubmedQuery: "creatine supplementation resistance training muscle strength",
    evidenceNote:
      "No published trials for muscle peptide products; protein and training have strong evidence.",
    products: [
      {
        id: "reviform-cocktail",
        why: "A protein, vitamin and mineral shake that can help you reach a daily protein target.",
        evidenceNote:
          "Protein intake has strong evidence; this shake is simply one convenient way to get it.",
      },
      {
        id: "gotratix",
        why: "A natural muscle-tissue peptide complex (A-18) the catalog describes for muscle strength, endurance and recovery.",
        evidenceNote:
          "Gotratix isn't indexed in PubMed and has no published human trials.",
      },
    ],
    productPolicy: "symptom",
    followUps: [
      "What does your training look like now, and roughly how much protein do you eat a day?",
    ],
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
      "Thyroid hormone affects energy, weight, temperature and mood. If you suspect a thyroid problem, the first step is a blood test (TSH, often with free T4) — symptoms such as tiredness overlap with many other causes. Iodine and selenium matter for the thyroid, but extra iodine can backfire, so don't self-supplement without testing.",
    sections: [
      {
        heading: "What the research says",
        body: "A controlled Russian study tested a thyroid peptide bioregulator in older adults with reduced thyroid function in a low-iodine region; the published details are limited.",
      },
    ],
    sourceIds: ["pmid:16075681"],
    evidenceNote: "One small Russian controlled study with limited detail.",
    products: [
      {
        id: "thyreogen",
        why: "A natural thyroid-gland peptide complex (A-2) the catalog describes for thyroid support.",
        evidenceNote:
          "Thyroid peptide evidence is one small Russian study; Thyreogen itself hasn't been tested, and it is not a substitute for thyroid medicine.",
      },
    ],
    productPolicy: "symptom",
    followUps: [
      "Have you had your TSH checked, and do you take thyroid medicine?",
    ],
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
      "For everyday stress, the best-proven tools are regular exercise, consistent sleep, time outdoors, limiting alcohol and caffeine, and structured techniques such as slow breathing or CBT-based skills. Adaptogens like ginseng have modest evidence. If low mood or worry has affected your sleep, appetite or work for more than two weeks, talk to a clinician — effective help exists.",
    sections: [
      {
        heading: "What the research says",
        body: "Ginseng has modest, mixed evidence for fatigue and wellbeing in small studies; it can interact with some medicines.",
      },
    ],
    sourceIds: ["pmid:29624410", "ref:nccih-ginseng"],
    evidenceNote: "Adaptogens: modest, mixed evidence.",
    products: [
      {
        id: "panaxod",
        why: "Built on Panax ginseng, an adaptogen traditionally used for stress resilience and energy.",
        evidenceNote:
          "Ginseng evidence is modest; the finished formula hasn't been tested.",
      },
    ],
    productPolicy: "symptom",
    followUps: [
      "Is this day-to-day stress, or has low mood or worry been affecting your sleep, appetite or work for weeks?",
    ],
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
      "The interventions with the strongest evidence for healthy ageing are unglamorous: regular exercise (especially strength plus cardio), not smoking, good sleep, a mostly whole-food diet, social connection, and managing blood pressure, cholesterol and blood sugar. No supplement has been shown in robust human trials to slow ageing.",
    sections: [
      {
        heading: "Where peptide bioregulators fit",
        body: "Peptide bioregulators were developed in Russia as 'geroprotectors'. The best-known human data — small studies of injectable pineal and thymus extracts in older adults — reported lower mortality, but they haven't been independently replicated, and oral products haven't been tested in comparable trials.",
      },
    ],
    sourceIds: [
      "pmid:14523363",
      "pmid:17426848",
      "pmid:19830585",
      "pmid:34834147",
    ],
    evidenceNote:
      "Small, single-network human studies of injectable extracts; no independent trials of oral products.",
    products: [
      {
        id: "endoluten",
        why: "The catalog's foundational pineal peptide complex, commonly paired with Vladonix in healthy-ageing protocols.",
        evidenceNote:
          "Evidence is from related injectable pineal extracts; Endoluten itself hasn't been tested in published trials.",
      },
      {
        id: "vladonix",
        why: "The catalog's foundational thymus peptide complex, commonly paired with Endoluten.",
        evidenceNote:
          "Evidence is from the injectable extract Thymalin; Vladonix itself hasn't been tested in published trials.",
      },
    ],
    productPolicy: "symptom",
    followUps: [
      "Is there a specific area you care most about — energy, sleep, joints, heart, focus or skin?",
    ],
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
