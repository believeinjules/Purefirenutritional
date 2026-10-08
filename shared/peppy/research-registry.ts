/**
 * Peppy curated research registry.
 * PubMed titles, authors, journals and years were copied verbatim from NCBI esummary (do not
 * paraphrase them; `node scripts/peppy-verify-registry.mjs` re-checks them against PubMed).
 * Findings/limitations are short human-written summaries of each abstract.
 * Every PMID here was checked to resolve to the paper described. The /science page PMIDs that
 * point at unrelated papers are deliberately NOT included (see SCIENCE_PAGE_PMIDS_EXCLUDED).
 */
import type { ResearchSource } from "./types.js";

export const RESEARCH_REGISTRY: ResearchSource[] = [
  {
    id: "pmid:34834147",
    kind: "pubmed",
    title: "Peptide Regulation of Gene Expression: A Systematic Review.",
    authors: "Khavinson VK, Popovich IG, Linkova NS, et al.",
    journal: "Molecules (Basel, Switzerland)",
    year: "2021",
    pmid: "34834147",
    url: "https://pubmed.ncbi.nlm.nih.gov/34834147/",
    studyType: "systematic-review",
    finding:
      "Summarises cell, animal and some human work proposing that 2–7 amino-acid peptides enter cell nuclei and influence gene expression.",
    limitation:
      "Written by the Khavinson group about its own field; mostly mechanistic evidence, not clinical outcomes.",
    doi: "10.3390/molecules26227053",
    origin: "curated",
  },
  {
    id: "pmid:19830585",
    kind: "pubmed",
    title: "Peptide bioregulation of aging: results and prospects.",
    authors: "Anisimov VN, Khavinson VKh",
    journal: "Biogerontology",
    year: "2010",
    pmid: "19830585",
    url: "https://pubmed.ncbi.nlm.nih.gov/19830585/",
    studyType: "review",
    finding:
      "Overview of the Khavinson–Anisimov program: longer lifespan in rodents given peptide preparations and 6–12 years of clinical use reported.",
    limitation:
      "Narrative review by the program's own authors; lifespan data are from rodents.",
    doi: "10.1007/s10522-009-9249-8",
    origin: "curated",
  },
  {
    id: "pmid:12374906",
    kind: "pubmed",
    title: "Peptides and Ageing.",
    authors: "Khavinson VKh",
    journal: "Neuro endocrinology letters",
    year: "2002",
    pmid: "12374906",
    url: "https://pubmed.ncbi.nlm.nih.gov/12374906/",
    studyType: "review",
    finding:
      "Monograph-length review of tissue-extract peptides (e.g. Epithalamin) covering cell, animal and early clinical work.",
    limitation:
      "Single research group; much of the underlying data is Russian-language and not independently replicated.",
    origin: "curated",
  },
  {
    id: "pmid:24003726",
    kind: "pubmed",
    title:
      "[Peptide bioregulators: the new class of geroprotectors. Message 2. Clinical studies results].",
    authors: "Khavinson VKh, Kuznik BI, Ryzhak GA",
    journal: "Advances in gerontology = Uspekhi gerontologii",
    year: "2013",
    pmid: "24003726",
    url: "https://pubmed.ncbi.nlm.nih.gov/24003726/",
    studyType: "review",
    finding:
      "Summarises the group's clinical studies with injectable peptide drugs (Thymalin, Epithalamin, Cortexin, Retinalamin and others).",
    limitation:
      "Russian-language review by the original investigators; covers injectable drugs, not oral capsules.",
    origin: "curated",
  },
  {
    id: "pmid:14523363",
    kind: "pubmed",
    title: "Peptides of pineal gland and thymus prolong human life.",
    authors: "Khavinson VKh, Morozov VG",
    journal: "Neuro endocrinology letters",
    year: "2003",
    pmid: "14523363",
    url: "https://pubmed.ncbi.nlm.nih.gov/14523363/",
    studyType: "rct",
    finding:
      "266 older adults followed 6–8 years: groups given injectable Thymalin and/or Epithalamin had lower reported mortality than controls.",
    limitation:
      "Small, older trial from the developers; randomisation and blinding are poorly described; injectable extracts, not oral supplements.",
    origin: "curated",
  },
  {
    id: "pmid:31598715",
    kind: "pubmed",
    title:
      "Systematic search for structural motifs of peptide binding to double-stranded DNA.",
    authors: "Kolchina N, Khavinson V, Linkova N, et al.",
    journal: "Nucleic acids research",
    year: "2019",
    pmid: "31598715",
    url: "https://pubmed.ncbi.nlm.nih.gov/31598715/",
    studyType: "in-vitro",
    finding:
      "Computer modelling found a small set of dipeptides that could bind specific DNA sequences.",
    limitation:
      "Molecular docking only; shows plausibility, not an effect in people.",
    doi: "10.1093/nar/gkz850",
    origin: "curated",
  },
  {
    id: "pmid:35887081",
    kind: "pubmed",
    title:
      "Transport of Biologically Active Ultrashort Peptides Using POT and LAT Carriers.",
    authors: "Khavinson V, Linkova N, Kozhevnikova E, et al.",
    journal: "International journal of molecular sciences",
    year: "2022",
    pmid: "35887081",
    url: "https://pubmed.ncbi.nlm.nih.gov/35887081/",
    studyType: "review",
    finding:
      "Reviews how di- and tripeptides can be carried into cells by PEPT1/PEPT2 and LAT transporters — relevant to whether oral short peptides are absorbed.",
    limitation:
      "Mechanistic review; does not measure absorption of any specific product.",
    doi: "10.3390/ijms23147733",
    origin: "curated",
  },
  {
    id: "pmid:11524632",
    kind: "pubmed",
    title:
      "Synthetic tetrapeptide epitalon restores disturbed neuroendocrine regulation in senescent monkeys.",
    authors: "Khavinson V, Goncharova N, Lapin B",
    journal: "Neuro endocrinology letters",
    year: "2001",
    pmid: "11524632",
    url: "https://pubmed.ncbi.nlm.nih.gov/11524632/",
    studyType: "animal",
    finding:
      "Synthetic Epitalon raised evening melatonin and normalised cortisol rhythm in old rhesus monkeys.",
    limitation:
      "Animal study with very few monkeys; injected peptide, not an oral capsule.",
    origin: "curated",
  },
  {
    id: "pmid:17969590",
    kind: "pubmed",
    title:
      "[Normalizing effect of the pineal gland peptides on the daily melatonin rhythm in old monkeys and elderly people].",
    authors: "Korkushko OV, Lapin BA, Goncharova ND, et al.",
    journal: "Advances in gerontology = Uspekhi gerontologii",
    year: "2007",
    pmid: "17969590",
    url: "https://pubmed.ncbi.nlm.nih.gov/17969590/",
    studyType: "clinical",
    finding:
      "Pineal peptide preparations (Epithalamin, Epitalon) restored night-time melatonin release in old monkeys and older adults.",
    limitation:
      "Small, Russian-language study; melatonin levels were measured, not sleep quality.",
    origin: "curated",
  },
  {
    id: "pmid:17426848",
    kind: "pubmed",
    title:
      "Geroprotective effect of epithalamine (pineal gland peptide preparation) in elderly subjects with accelerated aging.",
    authors: "Korkushko OV, Khavinson VKh, Shatilo VB, et al.",
    journal: "Bulletin of experimental biology and medicine",
    year: "2006",
    pmid: "17426848",
    url: "https://pubmed.ncbi.nlm.nih.gov/17426848/",
    studyType: "rct",
    finding:
      "12-year randomised study in older adults with coronary disease: the Epithalamin group had lower mortality and better exercise tolerance.",
    limitation:
      "Single-centre trial by the developers; injectable extract, not oral capsules; not independently replicated.",
    doi: "10.1007/s10517-006-0365-z",
    origin: "curated",
  },
  {
    id: "pmid:14501183",
    kind: "pubmed",
    title:
      "Effect of Epitalon on biomarkers of aging, life span and spontaneous tumor incidence in female Swiss-derived SHR mice.",
    authors: "Anisimov VN, Khavinson VKh, Popovich IG, et al.",
    journal: "Biogerontology",
    year: "2003",
    pmid: "14501183",
    url: "https://pubmed.ncbi.nlm.nih.gov/14501183/",
    studyType: "animal",
    finding:
      "Epitalon did not change mean lifespan in mice but modestly increased maximum lifespan and lowered chromosome aberrations.",
    limitation:
      "Mouse study (54 per group), injected peptide; effects on mean lifespan were null.",
    doi: "10.1023/a:1025114230714",
    origin: "curated",
  },
  {
    id: "pmid:12937682",
    kind: "pubmed",
    title:
      "Epithalon peptide induces telomerase activity and telomere elongation in human somatic cells.",
    authors: "Khavinson VKh, Bondarev IE, Butyugov AA",
    journal: "Bulletin of experimental biology and medicine",
    year: "2003",
    pmid: "12937682",
    url: "https://pubmed.ncbi.nlm.nih.gov/12937682/",
    studyType: "in-vitro",
    finding:
      "Adding Epitalon to human fetal fibroblasts in culture switched on telomerase and lengthened telomeres.",
    limitation:
      "Cell-culture result only; it does not show telomere changes in people taking a supplement.",
    doi: "10.1023/a:1025493705728",
    origin: "curated",
  },
  {
    id: "pmid:29124531",
    kind: "pubmed",
    title:
      "Identification of Peptide AEDG in the Polypeptide Complex of the Pineal Gland.",
    authors: "Khavinson VK, Kopylov AT, Vaskovsky BV, et al.",
    journal: "Bulletin of experimental biology and medicine",
    year: "2017",
    pmid: "29124531",
    url: "https://pubmed.ncbi.nlm.nih.gov/29124531/",
    studyType: "in-vitro",
    finding:
      "Mass spectrometry detected the AEDG tetrapeptide (Epitalon's sequence) inside the pineal polypeptide complex.",
    limitation: "Chemistry/identification study; no clinical outcome.",
    doi: "10.1007/s10517-017-3922-8",
    origin: "curated",
  },
  {
    id: "pmid:28849889",
    kind: "pubmed",
    title: "[Pineamin increased pineal melatonin synthesis in elderly people].",
    authors: "Trofimova SV, Linkova NS, Klimenko AA, et al.",
    journal: "Advances in gerontology = Uspekhi gerontologii",
    year: "2017",
    pmid: "28849889",
    url: "https://pubmed.ncbi.nlm.nih.gov/28849889/",
    studyType: "clinical",
    finding:
      "In 55 older adults with low melatonin output, the pineal extract Pineamin raised night-time melatonin metabolite excretion about 1.9-fold.",
    limitation:
      "Small, Russian-language study of an injectable drug; measured a urine marker, not sleep.",
    origin: "curated",
  },
  {
    id: "pmid:9701766",
    kind: "pubmed",
    title:
      "Pineal peptide preparation epithalamin increases the lifespan of fruit flies, mice and rats.",
    authors: "Anisimov VN, Mylnikov SV, Khavinson VK",
    journal: "Mechanisms of ageing and development",
    year: "1998",
    pmid: "9701766",
    url: "https://pubmed.ncbi.nlm.nih.gov/9701766/",
    studyType: "animal",
    finding:
      "The pineal extract Epithalamin increased mean lifespan by 11–31% in fruit flies, some mouse strains and rats.",
    limitation:
      "Animal data; no effect in one mouse strain; not a human outcome.",
    doi: "10.1016/s0047-6374(98)00034-7",
    origin: "curated",
  },
  {
    id: "pmid:23691095",
    kind: "pubmed",
    title:
      "Meta-analysis: melatonin for the treatment of primary sleep disorders.",
    authors: "Ferracioli-Oda E, Qawasmi A, Bloch MH",
    journal: "PloS one",
    year: "2013",
    pmid: "23691095",
    url: "https://pubmed.ncbi.nlm.nih.gov/23691095/",
    studyType: "systematic-review",
    finding:
      "Meta-analysis of 19 placebo-controlled trials (1,683 people): melatonin cut time to fall asleep by about 7 minutes and added about 8 minutes of sleep.",
    limitation:
      "Benefits are modest; trials were in diagnosed primary sleep disorders and varied in dose.",
    doi: "10.1371/journal.pone.0063773",
    origin: "curated",
  },
  {
    id: "pmid:33575961",
    kind: "pubmed",
    title:
      "Results and Prospects of Using Activator of Hematopoietic Stem Cell Differentiation in Complex Therapy for Patients with COVID-19.",
    authors: "Khavinson VK, Kuznik BI, Trofimova SV, et al.",
    journal: "Stem cell reviews and reports",
    year: "2021",
    pmid: "33575961",
    url: "https://pubmed.ncbi.nlm.nih.gov/33575961/",
    studyType: "clinical",
    finding:
      "Adding injectable Thymalin to standard hospital care was associated with faster falls in inflammation markers.",
    limitation:
      "Small, non-blinded study by the developers; hospital patients, injectable drug — says nothing about oral supplements.",
    doi: "10.1007/s12015-020-10087-6",
    origin: "curated",
  },
  {
    id: "pmid:35408963",
    kind: "pubmed",
    title:
      "Peptides Regulating Proliferative Activity and Inflammatory Pathways in the Monocyte/Macrophage THP-1 Cell Line.",
    authors: "Avolio F, Martinotti S, Khavinson VK, et al.",
    journal: "International journal of molecular sciences",
    year: "2022",
    pmid: "35408963",
    url: "https://pubmed.ncbi.nlm.nih.gov/35408963/",
    studyType: "in-vitro",
    finding:
      "Five Khavinson peptides (including Epitalon and Thymalin) changed proliferation and inflammatory signalling in a human immune cell line.",
    limitation: "Cell-line study; no clinical endpoint.",
    doi: "10.3390/ijms23073607",
    origin: "curated",
  },
  {
    id: "pmid:37686182",
    kind: "pubmed",
    title:
      "The Influence of KE and EW Dipeptides in the Composition of the Thymalin Drug on Gene Expression and Protein Synthesis Involved in the Pathogenesis of COVID-19.",
    authors: "Linkova N, Khavinson V, Diatlova A, et al.",
    journal: "International journal of molecular sciences",
    year: "2023",
    pmid: "37686182",
    url: "https://pubmed.ncbi.nlm.nih.gov/37686182/",
    studyType: "in-vitro",
    finding:
      "Modelling and cell work on the KE and EW dipeptides in Thymalin and immune/inflammatory gene activity.",
    limitation: "Laboratory study; not tested as a supplement in people.",
    doi: "10.3390/ijms241713377",
    origin: "curated",
  },
  {
    id: "pmid:33237528",
    kind: "pubmed",
    title:
      "Thymalin: Activation of Differentiation of Human Hematopoietic Stem Cells.",
    authors: "Khavinson VK, Linkova NS, Kvetnoy IM, et al.",
    journal: "Bulletin of experimental biology and medicine",
    year: "2020",
    pmid: "33237528",
    url: "https://pubmed.ncbi.nlm.nih.gov/33237528/",
    studyType: "in-vitro",
    finding:
      "Thymalin pushed human blood stem cells toward mature T-cell markers in culture.",
    limitation: "Cell-culture study; no clinical outcome.",
    doi: "10.1007/s10517-020-05016-z",
    origin: "curated",
  },
  {
    id: "pmid:33396470",
    kind: "pubmed",
    title:
      "EDR Peptide: Possible Mechanism of Gene Expression and Protein Synthesis Regulation Involved in the Pathogenesis of Alzheimer's Disease.",
    authors: "Khavinson V, Linkova N, Kozhevnikova E, et al.",
    journal: "Molecules (Basel, Switzerland)",
    year: "2020",
    pmid: "33396470",
    url: "https://pubmed.ncbi.nlm.nih.gov/33396470/",
    studyType: "review",
    finding:
      "Reviews cell and animal work suggesting the EDR peptide (Pinealon) supports neurons, plus limited reports in older adults.",
    limitation: "Review by the originating group; human evidence is thin.",
    doi: "10.3390/molecules26010159",
    origin: "curated",
  },
  {
    id: "pmid:39518916",
    kind: "pubmed",
    title:
      "Short Peptides Protect Fibroblast-Derived Induced Neurons from Age-Related Changes.",
    authors: "Kraskovskaya N, Linkova N, Sakhenberg E, et al.",
    journal: "International journal of molecular sciences",
    year: "2024",
    pmid: "39518916",
    url: "https://pubmed.ncbi.nlm.nih.gov/39518916/",
    studyType: "in-vitro",
    finding:
      "EDR, KED and AEDG peptides reduced age-related changes in neurons made from older donors' skin cells.",
    limitation: "Cell-model study; no human cognitive outcome.",
    doi: "10.3390/ijms252111363",
    origin: "curated",
  },
  {
    id: "pmid:21978084",
    kind: "pubmed",
    title:
      "Pinealon increases cell viability by suppression of free radical levels and activating proliferative processes.",
    authors: "Khavinson V, Ribakova Y, Kulebiakin K, et al.",
    journal: "Rejuvenation research",
    year: "2011",
    pmid: "21978084",
    url: "https://pubmed.ncbi.nlm.nih.gov/21978084/",
    studyType: "in-vitro",
    finding:
      "Pinealon limited oxidative stress and cell death in several cell types.",
    limitation: "Cell-culture study only.",
    doi: "10.1089/rej.2011.1172",
    origin: "curated",
  },
  {
    id: "pmid:24909721",
    kind: "pubmed",
    title:
      "Short peptides stimulate serotonin expression in cells of brain cortex.",
    authors: "Khavinson VKh, Lin'kova NS, Tarnovskaya SI, et al.",
    journal: "Bulletin of experimental biology and medicine",
    year: "2014",
    pmid: "24909721",
    url: "https://pubmed.ncbi.nlm.nih.gov/24909721/",
    studyType: "in-vitro",
    finding:
      "EDR and KED peptides increased serotonin-related protein expression in ageing brain-cell cultures.",
    limitation: "Cell-culture and docking study; no human data.",
    doi: "10.1007/s10517-014-2496-y",
    origin: "curated",
  },
  {
    id: "pmid:12195242",
    kind: "pubmed",
    title:
      "Pineal-regulating tetrapeptide epitalon improves eye retina condition in retinitis pigmentosa.",
    authors: "Khavinson V, Razumovsky M, Trofimova S, et al.",
    journal: "Neuro endocrinology letters",
    year: "2002",
    pmid: "12195242",
    url: "https://pubmed.ncbi.nlm.nih.gov/12195242/",
    studyType: "clinical",
    finding:
      "Epitalon improved retinal function in rats with inherited retinal degeneration and a clinical effect was reported in most treated patients.",
    limitation:
      "Small, older controlled study by the developers; outcome reporting is limited.",
    origin: "curated",
  },
  {
    id: "pmid:11521426",
    kind: "pubmed",
    title:
      "[Effectiveness of bio-regulators in the treatment of diabetic retinopathy].",
    authors: "Trofimova SV, Khavinson VKh",
    journal: "Vestnik oftalmologii",
    year: "2001",
    pmid: "11521426",
    url: "https://pubmed.ncbi.nlm.nih.gov/11521426/",
    studyType: "clinical",
    finding:
      "104 patients given retinal, pineal and brain peptide drugs versus 42 controls: improvements in vision and retinal blood flow reported.",
    limitation:
      "Russian-language, non-randomised comparison of injectable drugs; not an oral supplement.",
    origin: "curated",
  },
  {
    id: "pmid:30859383",
    kind: "pubmed",
    title:
      "Molecular-Physiological Aspects of Regulatory Effect of Peptide Retinoprotectors.",
    authors: "Khavinson V, Trofimova S, Trofimov A, et al.",
    journal: "Stem cell reviews and reports",
    year: "2019",
    pmid: "30859383",
    url: "https://pubmed.ncbi.nlm.nih.gov/30859383/",
    studyType: "review",
    finding:
      "Short overview of how peptide 'retinoprotectors' are proposed to act on retinal gene expression.",
    limitation: "Brief review by the developers; mechanistic.",
    doi: "10.1007/s12015-019-09882-7",
    origin: "curated",
  },
  {
    id: "pmid:23644932",
    kind: "pubmed",
    title:
      "Lutein + zeaxanthin and omega-3 fatty acids for age-related macular degeneration: the Age-Related Eye Disease Study 2 (AREDS2) randomized clinical trial.",
    authors: "",
    journal: "JAMA",
    year: "2013",
    pmid: "23644932",
    url: "https://pubmed.ncbi.nlm.nih.gov/23644932/",
    studyType: "rct",
    finding:
      "AREDS2 (4,203 people at risk of advanced AMD): adding lutein + zeaxanthin or omega-3 to the AREDS formula did not further reduce progression overall.",
    limitation:
      "People already at high risk of AMD; lutein + zeaxanthin replaced beta-carotene because of lung-cancer risk in former smokers.",
    doi: "10.1001/jama.2013.4997",
    origin: "curated",
  },
  {
    id: "pmid:36611900",
    kind: "pubmed",
    title:
      "Senescence-Associated Secretory Phenotype of Cardiovascular System Cells and Inflammaging: Perspectives of Peptide Regulation.",
    authors: "Khavinson V, Linkova N, Dyatlova A, et al.",
    journal: "Cells",
    year: "2022",
    pmid: "36611900",
    url: "https://pubmed.ncbi.nlm.nih.gov/36611900/",
    studyType: "review",
    finding:
      "Reviews ageing-related inflammation in heart and vessel cells and where vascular peptides might act.",
    limitation: "Mechanistic review; no clinical trial of a peptide product.",
    doi: "10.3390/cells12010106",
    origin: "curated",
  },
  {
    id: "pmid:25408528",
    kind: "pubmed",
    title:
      "Molecular aspects of anti-atherosclerotic effects of short peptides.",
    authors: "Khavinson VKh, Lin'kova NS, Evlashkina EV, et al.",
    journal: "Bulletin of experimental biology and medicine",
    year: "2014",
    pmid: "25408528",
    url: "https://pubmed.ncbi.nlm.nih.gov/25408528/",
    studyType: "in-vitro",
    finding:
      "Two short vascular peptides increased cell-renewal markers and lowered an adhesion molecule in ageing vascular cell cultures.",
    limitation: "Cell-culture study only.",
    doi: "10.1007/s10517-014-2713-8",
    origin: "curated",
  },
  {
    id: "pmid:27383168",
    kind: "pubmed",
    title:
      "Effects of Vascular Peptide Bioregulator on the Density of Microvascular Network in the Brain Cortex of Aged Rats.",
    authors: "Sokolova IB, Ryzhak GA, Mel'nikova NN, et al.",
    journal: "Bulletin of experimental biology and medicine",
    year: "2016",
    pmid: "27383168",
    url: "https://pubmed.ncbi.nlm.nih.gov/27383168/",
    studyType: "animal",
    finding:
      "A vascular peptide preparation increased microvessel density in the brain cortex of old rats.",
    limitation:
      "Rat study; a different preparation from any finished supplement.",
    doi: "10.1007/s10517-016-3400-8",
    origin: "curated",
  },
  {
    id: "pmid:32399807",
    kind: "pubmed",
    title:
      "Gene expression in human mesenchymal stem cell aging cultures: modulation by short peptides.",
    authors: "Ashapkin V, Khavinson V, Shilovsky G, et al.",
    journal: "Molecular biology reports",
    year: "2020",
    pmid: "32399807",
    url: "https://pubmed.ncbi.nlm.nih.gov/32399807/",
    studyType: "in-vitro",
    finding:
      "AED, KED and KE peptides changed expression of ageing-related genes in human bone-marrow stem cells.",
    limitation: "Cell-culture study; no joint or bone outcome in people.",
    doi: "10.1007/s11033-020-05506-3",
    origin: "curated",
  },
  {
    id: "pmid:18306703",
    kind: "pubmed",
    title:
      "[Effect of peptide regulators on the structural and functional status of bone tissue in ageing rats].",
    authors: "Povorozniuk VV, Khavinson VKh, Makogonchuk AV, et al.",
    journal: "Advances in gerontology = Uspekhi gerontologii",
    year: "2007",
    pmid: "18306703",
    url: "https://pubmed.ncbi.nlm.nih.gov/18306703/",
    studyType: "animal",
    finding:
      "A cartilage extract and the T-31 (AED) peptide limited bone-density loss in rats after ovary removal.",
    limitation: "Rat model, Russian-language report; not a human outcome.",
    origin: "curated",
  },
  {
    id: "pmid:37176122",
    kind: "pubmed",
    title: "Peptide Regulation of Chondrogenic Stem Cell Differentiation.",
    authors: "Linkova N, Khavinson V, Diatlova A, et al.",
    journal: "International journal of molecular sciences",
    year: "2023",
    pmid: "37176122",
    url: "https://pubmed.ncbi.nlm.nih.gov/37176122/",
    studyType: "review",
    finding:
      "Reviews peptides that steer stem cells toward cartilage cells (mostly growth-factor and matrix-derived peptides).",
    limitation:
      "Laboratory-stage research; few of these peptides are in supplements.",
    doi: "10.3390/ijms24098415",
    origin: "curated",
  },
  {
    id: "pmid:30368550",
    kind: "pubmed",
    title:
      "Effect of collagen supplementation on osteoarthritis symptoms: a meta-analysis of randomized placebo-controlled trials.",
    authors: "García-Coronado JM, Martínez-Olvera L, Elizondo-Omaña RE, et al.",
    journal: "International orthopaedics",
    year: "2019",
    pmid: "30368550",
    url: "https://pubmed.ncbi.nlm.nih.gov/30368550/",
    studyType: "systematic-review",
    finding:
      "Meta-analysis of placebo-controlled trials: oral collagen modestly improved overall osteoarthritis symptom scores and stiffness.",
    limitation:
      "Small, heterogeneous trials; pain and function subscores did not differ from placebo.",
    doi: "10.1007/s00264-018-4211-5",
    origin: "curated",
  },
  {
    id: "pmid:16495392",
    kind: "pubmed",
    title:
      "Glucosamine, chondroitin sulfate, and the two in combination for painful knee osteoarthritis.",
    authors: "Clegg DO, Reda DJ, Harris CL, et al.",
    journal: "The New England journal of medicine",
    year: "2006",
    pmid: "16495392",
    url: "https://pubmed.ncbi.nlm.nih.gov/16495392/",
    studyType: "rct",
    finding:
      "GAIT trial (1,583 people with knee osteoarthritis): glucosamine and chondroitin were not better than placebo for pain overall.",
    limitation:
      "A possible benefit in moderate-to-severe pain was exploratory only.",
    doi: "10.1056/NEJMoa052771",
    origin: "curated",
  },
  {
    id: "pmid:22448364",
    kind: "pubmed",
    title:
      "Prospects of using pancragen for correction of metabolic disorders in elderly people.",
    authors: "Korkushko OV, Khavinson VKh, Shatilo VB, et al.",
    journal: "Bulletin of experimental biology and medicine",
    year: "2011",
    pmid: "22448364",
    url: "https://pubmed.ncbi.nlm.nih.gov/22448364/",
    studyType: "clinical",
    finding:
      "In older adults with type 2 diabetes, the pancreatic tetrapeptide Pancragen lowered fasting glucose and insulin resistance.",
    limitation:
      "Small study without a placebo group, by the developers; Pancragen is not a Pure Fire product.",
    doi: "10.1007/s10517-011-1354-4",
    origin: "curated",
  },
  {
    id: "pmid:24958378",
    kind: "pubmed",
    title:
      "Peptides regulate expression of signaling molecules in kidney cell cultures during in vitro aging.",
    authors: "Khavinson VKh, Lin'kova NS, Polyakova VO, et al.",
    journal: "Bulletin of experimental biology and medicine",
    year: "2014",
    pmid: "24958378",
    url: "https://pubmed.ncbi.nlm.nih.gov/24958378/",
    studyType: "in-vitro",
    finding:
      "A kidney polypeptide complex and the AED peptide activated cell-renewal markers in ageing kidney-cell cultures.",
    limitation: "Cell-culture study only.",
    doi: "10.1007/s10517-014-2540-y",
    origin: "curated",
  },
  {
    id: "pmid:26515176",
    kind: "pubmed",
    title:
      "Peptides Restore Functional State of the Kidneys During Cisplatin-Induced Acute Renal Failure.",
    authors: "Zamorskii II, Shchudrova TS, Lin'kova NS, et al.",
    journal: "Bulletin of experimental biology and medicine",
    year: "2015",
    pmid: "26515176",
    url: "https://pubmed.ncbi.nlm.nih.gov/26515176/",
    studyType: "animal",
    finding:
      "Kidney peptides improved kidney function markers in rats with drug-induced kidney injury.",
    limitation: "Rat injury model; not evidence for people.",
    doi: "10.1007/s10517-015-3062-y",
    origin: "curated",
  },
  {
    id: "pmid:29624410",
    kind: "pubmed",
    title: "Ginseng as a Treatment for Fatigue: A Systematic Review.",
    authors: "Arring NM, Millstine D, Marks LA, et al.",
    journal:
      "Journal of alternative and complementary medicine (New York, N.Y.)",
    year: "2018",
    pmid: "29624410",
    url: "https://pubmed.ncbi.nlm.nih.gov/29624410/",
    studyType: "systematic-review",
    finding:
      "Systematic review of 10 studies: ginseng showed modest evidence for reducing fatigue with low risk of side effects.",
    limitation:
      "Studies were small and mostly in people with chronic illness; authors call for stronger trials.",
    doi: "10.1089/acm.2017.0361",
    origin: "curated",
  },
  {
    id: "pmid:22777991",
    kind: "pubmed",
    title:
      "Effect of iron supplementation on fatigue in nonanemic menstruating women with low ferritin: a randomized controlled trial.",
    authors: "Vaucher P, Druais PL, Waldvogel S, et al.",
    journal:
      "CMAJ : Canadian Medical Association journal = journal de l'Association medicale canadienne",
    year: "2012",
    pmid: "22777991",
    url: "https://pubmed.ncbi.nlm.nih.gov/22777991/",
    studyType: "rct",
    finding:
      "198 non-anaemic women with fatigue and ferritin under 50 µg/L: 12 weeks of iron reduced fatigue more than placebo.",
    limitation: "Only helps if iron stores are low; women aged 18–53 only.",
    doi: "10.1503/cmaj.110950",
    origin: "curated",
  },
  {
    id: "pmid:24389208",
    kind: "pubmed",
    title: "Clinical applications of coenzyme Q10.",
    authors: "Garrido-Maraver J, Cordero MD, Oropesa-Avila M, et al.",
    journal: "Frontiers in bioscience (Landmark edition)",
    year: "2014",
    pmid: "24389208",
    url: "https://pubmed.ncbi.nlm.nih.gov/24389208/",
    studyType: "review",
    finding:
      "Reviews CoQ10's role in cellular energy production and the conditions in which supplementation has been studied.",
    limitation:
      "Narrative review; benefits are clearest in true CoQ10 deficiency.",
    doi: "10.2741/4231",
    origin: "curated",
  },
  {
    id: "pmid:16075681",
    kind: "pubmed",
    title:
      "[Peptide bioregulator efficacy in the correction of reduced thyroid gland function in the residents of Magadan Region].",
    authors: "Gorbachev AL, Lugovaia EA, Ryzhak GA, et al.",
    journal: "Advances in gerontology = Uspekhi gerontologii",
    year: "2005",
    pmid: "16075681",
    url: "https://pubmed.ncbi.nlm.nih.gov/16075681/",
    studyType: "clinical",
    finding:
      "Controlled study of a thyroid peptide bioregulator in older residents of the Magadan region with reduced thyroid function.",
    limitation:
      "Russian-language report with limited detail; not a substitute for thyroid care.",
    origin: "curated",
  },
  {
    id: "pmid:33742704",
    kind: "pubmed",
    title:
      "Effects of hydrolyzed collagen supplementation on skin aging: a systematic review and meta-analysis.",
    authors: "de Miranda RB, Weimer P, Rossi RC",
    journal: "International journal of dermatology",
    year: "2021",
    pmid: "33742704",
    url: "https://pubmed.ncbi.nlm.nih.gov/33742704/",
    studyType: "systematic-review",
    finding:
      "Meta-analysis of 19 trials (1,125 people, mostly women): hydrolysed collagen improved skin hydration, elasticity and wrinkles versus placebo.",
    limitation:
      "Many trials were industry-funded and short; peptide-specific products were not tested.",
    doi: "10.1111/ijd.15518",
    origin: "curated",
  },
  {
    id: "ref:nccih-melatonin",
    kind: "authority",
    title: "Melatonin: What You Need To Know",
    journal: "NCCIH (NIH)",
    url: "https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know",
    studyType: "guidance",
    finding:
      "Short-term melatonin use appears safe for most people; people on blood thinners or with epilepsy should use it under medical supervision.",
    limitation: "General guidance; long-term safety data are limited.",
    origin: "curated",
  },
  {
    id: "ref:ods-omega3",
    kind: "authority",
    title: "Omega-3 Fatty Acids — Fact Sheet for Health Professionals",
    journal: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/",
    studyType: "guidance",
    finding:
      "Fish oil can have antiplatelet effects at high doses and may raise INR with warfarin, though most studies of 3–6 g/day show no significant effect.",
    limitation: "Reference summary, not a trial.",
    origin: "curated",
  },
  {
    id: "ref:nccih-ginseng",
    kind: "authority",
    title: "Asian Ginseng: Usefulness and Safety",
    journal: "NCCIH (NIH)",
    url: "https://www.nccih.nih.gov/health/asian-ginseng",
    studyType: "guidance",
    finding:
      "Ginseng may affect blood sugar and blood clotting and can interact with medicines; insomnia is its most common side effect.",
    limitation: "General guidance summarising mixed evidence.",
    origin: "curated",
  },
  {
    id: "ref:nccih-supplements-wisely",
    kind: "authority",
    title: "Using Dietary Supplements Wisely",
    journal: "NCCIH (NIH)",
    url: "https://www.nccih.nih.gov/health/using-dietary-supplements-wisely",
    studyType: "guidance",
    finding:
      "Supplements can interact with medicines and aren't approved by FDA for safety or effectiveness before sale; tell your clinicians what you take.",
    limitation: "General guidance.",
    origin: "curated",
  },
  {
    id: "ref:fda-supplements-qa",
    kind: "authority",
    title: "Questions and Answers on Dietary Supplements",
    journal: "U.S. FDA",
    url: "https://www.fda.gov/food/information-consumers-using-dietary-supplements/questions-and-answers-dietary-supplements",
    studyType: "guidance",
    finding:
      "Explains how FDA regulates supplements: manufacturers are responsible for safety and labeling, and products are not approved before sale.",
    limitation: "Regulatory background, not health evidence.",
    origin: "curated",
  },
  {
    id: "ref:medlineplus-fatigue",
    kind: "authority",
    title: "Fatigue",
    journal: "MedlinePlus (NIH)",
    url: "https://medlineplus.gov/ency/article/003088.htm",
    studyType: "guidance",
    finding:
      "Lists common causes of fatigue (sleep, anaemia, thyroid, depression, medicines) and when to see a provider.",
    limitation: "Patient-education overview.",
    origin: "curated",
  },
  {
    id: "ref:ods-iron",
    kind: "authority",
    title: "Iron — Fact Sheet for Consumers",
    journal: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/Iron-Consumer/",
    studyType: "guidance",
    finding:
      "Explains who is at risk of low iron, symptoms such as tiredness, and why too much iron can be harmful.",
    limitation: "Reference summary.",
    origin: "curated",
  },
  {
    id: "ref:medlineplus-pregnancy-medicines",
    kind: "authority",
    title: "Pregnancy and Medicines",
    journal: "MedlinePlus (NIH)",
    url: "https://medlineplus.gov/pregnancyandmedicines.html",
    studyType: "guidance",
    finding:
      "Advises talking with your provider before taking any medicine or supplement during pregnancy or breastfeeding.",
    limitation: "General guidance.",
    origin: "curated",
  },
  {
    id: "ref:medlineplus-blood-thinners",
    kind: "authority",
    title: "Blood Thinners",
    journal: "MedlinePlus (NIH)",
    url: "https://medlineplus.gov/bloodthinners.html",
    studyType: "guidance",
    finding:
      "Explains how blood thinners work and why other medicines, foods and supplements can change their effect.",
    limitation: "Patient-education overview.",
    origin: "curated",
  },
  {
    id: "ref:nei-areds",
    kind: "authority",
    title: "Age-Related Eye Disease Studies (AREDS/AREDS2)",
    journal: "National Eye Institute (NIH)",
    url: "https://www.nei.nih.gov/research/clinical-trials/age-related-eye-disease-studies-aredsareds2",
    studyType: "guidance",
    finding:
      "Summarises the AREDS/AREDS2 trials and who the AREDS2 supplement formula is meant for.",
    limitation:
      "Applies to people with intermediate or late AMD in one eye, not general eye health.",
    origin: "curated",
  },
  {
    id: "ref:nccih-glucosamine",
    kind: "authority",
    title: "Glucosamine and Chondroitin for Osteoarthritis",
    journal: "NCCIH (NIH)",
    url: "https://www.nccih.nih.gov/health/glucosamine-and-chondroitin-for-osteoarthritis",
    studyType: "guidance",
    finding:
      "Summarises mixed trial results for glucosamine and chondroitin and notes possible interactions (e.g. with warfarin).",
    limitation: "General guidance.",
    origin: "curated",
  },
  {
    id: "ref:niams-oa",
    kind: "authority",
    title: "Osteoarthritis",
    journal: "NIAMS (NIH)",
    url: "https://www.niams.nih.gov/health-topics/osteoarthritis",
    studyType: "guidance",
    finding:
      "Covers symptoms, when to see a doctor, and first-line measures such as exercise and weight management.",
    limitation: "Patient-education overview.",
    origin: "curated",
  },
  {
    id: "ref:medlineplus-sleep",
    kind: "authority",
    title: "Sleep Disorders",
    journal: "MedlinePlus (NIH)",
    url: "https://medlineplus.gov/sleepdisorders.html",
    studyType: "guidance",
    finding:
      "Overview of common sleep problems and when ongoing poor sleep should be checked by a provider.",
    limitation: "Patient-education overview.",
    origin: "curated",
  },
];

/** /science page PMIDs whose PubMed record is an unrelated paper (verified 2026-10-08). */
export const SCIENCE_PAGE_PMIDS_EXCLUDED = [
  "31489893",
  "32093678",
  "29432159",
  "27411589",
  "12618089",
  "16883309",
  "28853107",
  "31560178",
  "24657283",
];
