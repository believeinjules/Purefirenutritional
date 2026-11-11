import KineticHeading from "@/components/kinetic/KineticHeading";
import { useKineticReveal } from "@/components/kinetic/useKineticReveal";
import { Helmet } from "react-helmet-async";
import PageSeo from "@/components/seo/PageSeo";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
// Body text: Editorial final draft (final-nov11/vesugen-research-safety.md), 2026-11-11.
// PubMed IDs verified against NCBI esummary + efetch on 2026-11-11: 25051766, 22808515, 36611900, 26390612.
const PATH = "/learn/vesugen-research-safety";
const TITLE = "Vesugen Research and Safety: What the Evidence Shows";
const HEADLINE = "Vesugen (KED Peptide): What the Research Says About Safety and Effects";
const DESCRIPTION =
  "Vesugen is a short synthetic peptide (Lys-Glu-Asp) studied in blood vessel cells. What the laboratory and human research shows, and what it doesn't.";
const HERO_JPG = "/images/learn/vesugen-research-safety-hero.jpg";
const HERO_WEBP = "/images/learn/vesugen-research-safety-hero.webp";
const HERO_ALT = "Laboratory equipment beside a vessel tissue model, representing early-stage Vesugen research";
const CHECKS_WEBP = "/images/learn/vesugen-research-safety-study-checks.webp";
const CHECKS_JPG = "/images/learn/vesugen-research-safety-study-checks.jpg";
const CHECKS_ALT = "Three checks for evaluating a peptide study: people studied, outcomes measured, and safety reviewed";
const HOMEPAGE_WEBP = "/images/learn/pure-fire-nutritional-homepage.webp";
const HOMEPAGE_JPG = "/images/learn/pure-fire-nutritional-homepage.jpg";
const HOMEPAGE_ALT = "www.purefirenutritional.com";

const FAQS = [
  {
    q: "What is Vesugen?",
    a: "A short synthetic peptide, Lys-Glu-Asp (KED), from the Khavinson Cytogen line. It is described as a bioregulator matched to blood vessel tissue and is promoted to support normal vascular function.",
  },
  {
    q: "Is there good evidence that Vesugen works in people?",
    a: "Not yet. Most research is in cell cultures, and the human reports are small and lack the controls needed for firm conclusions.",
  },
  {
    q: "What are Vesugen's side effects?",
    a: "A reliable side-effect profile hasn't been established. According to the manufacturer's brochure, one small study reported no side effects. Another report described laboratory findings that its authors said need further study.",
  },
  {
    q: "How is Vesugen supposed to work?",
    a: "The Khavinson group proposes that ultra-short peptides help regulate gene activity in the tissue they're matched to. This is a hypothesis based mainly on cell studies and hasn't been confirmed in people.",
  },
  {
    q: "How can Pure Fire help me assess peptide information?",
    a: "We publish educational articles and offer product guidance through Pepita, our AI assistant. That support doesn't replace a clinician's advice or show that Vesugen has a specific health effect.",
  },
] as const;

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: HEADLINE,
      description: DESCRIPTION,
      mainEntityOfPage: "https://www.purefirenutritional.com" + PATH,
      inLanguage: "en-US",
      image: "https://www.purefirenutritional.com" + HERO_JPG,
      author: { "@type": "Organization", name: "Pure Fire Nutritional" },
      publisher: {
        "@type": "Organization",
        name: "Pure Fire Nutritional",
        url: "https://www.purefirenutritional.com/",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
} as const;

function Pmid({ id }: { id: string }) {
  return (
    <a
      href={`https://pubmed.ncbi.nlm.nih.gov/${id}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-orange-600 hover:underline"
    >
      PMID {id}
    </a>
  );
}

function ArticleImage({
  webp,
  jpg,
  alt,
  width,
  height,
  priority = false,
  className = "w-full h-auto rounded-lg",
}: {
  webp: string;
  jpg: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={jpg}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? undefined : "lazy"}
        className={className}
      />
    </picture>
  );
}

export default function ArticleVesugenResearchSafety() {
  useKineticReveal("main h2");
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageSeo
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        type="article"
        image={HERO_JPG}
        imageAlt={HERO_ALT}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(JSON_LD)}</script>
      </Helmet>
      <Navigation />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <div className="mb-6">
            <Link href="/learn" className="text-sm text-orange-600 hover:underline">← Longevity Journal</Link>
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">Science</span>
          <KineticHeading className="text-4xl font-bold text-gray-900 mt-2 mb-4 leading-tight" text={HEADLINE} />
          <p className="text-gray-400 text-sm mb-8">
            <em>By Julia Shulman, co-founder, Pure Fire Nutritional</em>
          </p>

          <div className="mb-10">
            <ArticleImage webp={HERO_WEBP} jpg={HERO_JPG} alt={HERO_ALT} width={1600} height={900} priority className="w-full h-auto rounded-lg" />
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">

            <p><strong>Summary:</strong> Vesugen is a short synthetic peptide, the three amino acids lysine, glutamic acid and aspartic acid (Lys-Glu-Asp, or KED), developed in the Khavinson research program as a bioregulator for blood vessel tissue. Most of the research on it is laboratory work on cells. Human evidence is limited to a few small studies without the controls needed for firm conclusions, and its safety in people has not been well characterized.</p>

            <p>Can a three-amino-acid peptide matter to blood vessel cells? That's the question behind Vesugen research. The laboratory findings are interesting, but they don't show what Vesugen does in people. If you're interested in this area more broadly, you can browse our <Link href="/products/system/heart-circulation" className="text-orange-600 hover:underline">heart and circulation</Link> category. Keep in mind that a product description is not clinical evidence.</p>

            <h2 id="what-is-vesugen" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">What is Vesugen?</h2>

            <p>Vesugen belongs to the Khavinson Cytogens, short peptides made by chemical synthesis rather than extracted from tissue. Researchers in the Khavinson program describe it as matched to the blood vessel wall, and it is promoted to support normal vascular function and circulation. Those are descriptions of intended use, not established effects in people.</p>

            <p>For background on the category, see our overview of <Link href="/learn/what-are-khavinson-peptide-bioregulators" className="text-orange-600 hover:underline">Khavinson peptide bioregulators</Link> and our <Link href="/learn/cytomaxes-cytogens-a-numbers-glossary" className="text-orange-600 hover:underline">glossary of Cytomaxes, Cytogens and A-numbers</Link>. A general explanation of the category doesn't confirm Vesugen's effects. Products sold under the same name aren't necessarily identical formulations either.</p>

            <h2 id="how-is-it-proposed-to-work" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">How is it proposed to work?</h2>

            <p>The Khavinson group's hypothesis is that ultra-short peptides like KED can enter cells, interact with DNA and help regulate which genes are switched on, particularly genes whose activity changes with age. This is a proposed mechanism. It comes mainly from cell-culture experiments and computer modelling by the same research group, and it hasn't been independently confirmed in people.</p>

            <h2 id="what-does-the-laboratory-research-show" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">What does the laboratory research show?</h2>

            <p>Most Vesugen research is cell-culture work from the St. Petersburg Institute of Bioregulation and Gerontology and its collaborators:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Blood vessel lining cells.</strong> In cultures of vascular endothelial cells (the cells lining blood vessels) from young and old animals, Vesugen increased Ki-67, a marker of cells preparing to divide, which falls with age. A computer docking model suggested the peptide could bind near the start of the gene that makes Ki-67 (<Pmid id="25051766" />).</li>
              <li><strong>Ageing cell cultures.</strong> In human fibroblast cultures, Vesugen raised markers of cell differentiation that had declined in older cultures (<Pmid id="22808515" />).</li>
              <li><strong>Review of vascular cell signalling.</strong> A 2022 review by the same group lists the KED tripeptide among peptides studied for their effects on signalling molecules in ageing cells of the heart and blood vessels (<Pmid id="36611900" />).</li>
            </ul>

            <p>These studies help researchers frame questions. They measure markers in cells, though, not outcomes that matter to people, such as a measured change in circulation or symptoms. Most come from a single research group, so independent replication is still needed.</p>

            <h2 id="what-do-the-human-reports-show" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">What do the human reports show?</h2>

            <p>Only a few small human reports exist.</p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>A small 2005–2006 study.</strong> According to the manufacturer's brochure (2011), a study ran from November 2005 to February 2006 and followed 40 adults: 25 took Vesugen alongside their usual medical care and 15 received usual care alone. The brochure reports favorable results and no side effects. It is not a peer-reviewed journal article, and it doesn't describe random allocation or blinding, so the results are preliminary at best.</li>
              <li><strong>A 2015 report in 32 adults.</strong> Adults aged 41 to 83 with several long-term health conditions took Vesugen together with another short peptide, Pinealon. The authors reported changes in a range of biological-age markers. They also reported a fall in circulating CD34-positive cells (blood-forming stem cells) and signs of prooxidant activity, findings they flagged for further study (<Pmid id="26390612" />, in Russian with an English abstract). Two peptides were given together and the report doesn't describe a comparison group, so it can't show what Vesugen alone does.</li>
            </ul>

            <p>These two reports involved different people, methods and measures. Neither provides the replicated, well-controlled human evidence needed to show that Vesugen supports vascular health in everyday use. A search of ClinicalTrials.gov, the U.S. registry of clinical studies, on November 11, 2026 found no registered trials of Vesugen.</p>

            <h2 id="what-is-known-about-vesugens-safety" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">What is known about Vesugen's safety?</h2>

            <p><strong>Human safety data are limited.</strong> According to the manufacturer's brochure, its small study found no side effects, but a study that small can't rule out uncommon effects. The 2015 report's CD34 and prooxidant findings don't show that anyone was harmed, but they don't support treating Vesugen as risk-free either.</p>

            <p>If you take medication, are pregnant or breastfeeding, or have a health condition, talk to a healthcare professional before taking any supplement. Stop taking a product and seek medical advice if you notice any adverse effect or allergic reaction.</p>

            <h2 id="how-can-you-judge-vesugen-claims" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">How can you judge Vesugen claims?</h2>

            <ArticleImage webp={CHECKS_WEBP} jpg={CHECKS_JPG} alt={CHECKS_ALT} width={1536} height={864} />

            <p>Ask three questions. Were people studied? What was measured? How was safety checked? A result in a cell culture is not a result in a person. A small report without clear methods can't tell you whether a change came from the peptide, other care, or chance.</p>

            <p>Our article on <Link href="/learn/bioregulator-organ-pairings-mechanism-vs-evidence" className="text-orange-600 hover:underline">bioregulator organ pairings: mechanism versus evidence</Link> explains why a biological rationale is not the same as a demonstrated health outcome.</p>

            <h2 id="the-bottom-line" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">The bottom line</h2>

            <p>Vesugen is a well-defined short peptide with a laboratory research history focused on blood vessel cells. Its proposed way of working is still a hypothesis, and human evidence is limited to small studies with important weaknesses. Treat any claimed benefit as unproven, check the exact product you're considering, and talk to a qualified clinician first.</p>

            <h2 id="continue-your-peptide-research" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">Continue your peptide research</h2>

            <p>Julia Shulman, our co-founder, leads education and product curation at Pure Fire Nutritional and has 20 years of experience in therapy and wellness education. Our educational resources and Pepita, our AI assistant, can help you find your way around product information. Neither replaces a clinician's advice, and neither shows that Vesugen has any particular effect.</p>

            <ArticleImage webp={HOMEPAGE_WEBP} jpg={HOMEPAGE_JPG} alt={HOMEPAGE_ALT} width={1440} height={810} />

            <p>To see the product this article relates to, <Link href="/products/vesugen" className="text-orange-600 hover:underline">view the Vesugen product page</Link>. Read the product details and talk to a clinician before you decide.</p>

            <h2 id="faq" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">Frequently Asked Questions</h2>

            {FAQS.map((item) => (
              <div key={item.q}>
                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-2">{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}

            <h2 id="references" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">References</h2>

            <ol className="list-decimal pl-6 space-y-2">
              <li>Khavinson VKh, Tarnovskaia SI, Lin'kova NS, et al. Epigenetic aspects of peptidergic regulation of vascular endothelial cell proliferation during aging. <em>Adv Gerontol.</em> 2014;27(1):108-14. [In Russian.] <Pmid id="25051766" /></li>
              <li>Khavinson VKh, Linkova NS, Polyakova VO, et al. Peptides tissue-specifically stimulate cell differentiation during their aging. <em>Bull Exp Biol Med.</em> 2012;153(1):148-51. <Pmid id="22808515" /></li>
              <li>Khavinson V, Linkova N, Dyatlova A, et al. Senescence-associated secretory phenotype of cardiovascular system cells and inflammaging: perspectives of peptide regulation. <em>Cells.</em> 2022;12(1):106. <Pmid id="36611900" /></li>
              <li>Meshchaninov VN, Tkachenko EL, Zharkov SV, et al. Effect of synthetic peptides on aging of patients with chronic polymorbidity and organic brain syndrome of the central nervous system in remission. <em>Adv Gerontol.</em> 2015;28(1):62-7. [In Russian.] <Pmid id="26390612" /></li>
            </ol>

            <p>Also described in plain text above, not linked: a 2011 manufacturer's brochure reporting the 2005–2006 study, and a ClinicalTrials.gov search for "Vesugen" (no registered studies, checked November 11, 2026).</p>

            <p><em>Educational content only. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. Not medical advice.</em></p>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
