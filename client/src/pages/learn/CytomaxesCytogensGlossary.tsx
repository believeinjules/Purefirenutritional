import KineticHeading from "@/components/kinetic/KineticHeading";
import { useKineticReveal } from "@/components/kinetic/useKineticReveal";
import { Helmet } from "react-helmet-async";
import PageSeo from "@/components/seo/PageSeo";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Body text: pf-journal/cytomaxes-cytogens-a-numbers-glossary.html (Julia-approved, 2026-11-05), verbatim.
const PATH = "/learn/cytomaxes-cytogens-a-numbers-glossary";
const TITLE = "Cytomaxes, Cytogens & A-Numbers: Glossary | Pure Fire";
const HEADLINE = "Cytomaxes, Cytogens and A-Numbers: A Glossary";
const DESCRIPTION = "Plain definitions of peptide bioregulator terms: cytamins, cytomedins, cytogens, Pure Fire's Cytomaxes and Cytogens collections, A-numbers and US status.";
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "Cytomaxes, Cytogens and A-Numbers: A Glossary",
      "description": "Plain definitions of peptide bioregulator terms: cytamins, cytomedins, cytogens, Pure Fire's Cytomaxes and Cytogens collections, A-numbers and US status.",
      "mainEntityOfPage": "https://www.purefirenutritional.com/learn/cytomaxes-cytogens-a-numbers-glossary",
      "inLanguage": "en-US",
      "author": {
        "@type": "Organization",
        "name": "Pure Fire Nutritional"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Pure Fire Nutritional",
        "url": "https://www.purefirenutritional.com/"
      }
    }
  ]
} as const;

export default function ArticleCytomaxesCytogensGlossary() {
  useKineticReveal("main h2");
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageSeo
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        type="article"
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

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">

            <p>Peptide bioregulator writing uses a mix of Russian research terms, product-collection names and regulatory language, and the same word can mean different things in different places. This glossary collects the terms used across the Pure Fire Longevity Journal and explains each in plain language. Definitions describe naming and classification, not effects. Where a term rests on a hypothesis rather than established biology, we say so.</p>

            <h2 id="research-terms" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">Research terms</h2>

            <dl><dt className="font-semibold text-gray-900 mt-4">Peptide</dt><dd className="ml-0 mt-1 mb-3">A short chain of amino acids joined by peptide bonds. Peptides are a normal part of biology: some act as hormones or signaling molecules, and many are produced when the body digests dietary protein.</dd><dt className="font-semibold text-gray-900 mt-4">Peptide bioregulator</dt><dd className="ml-0 mt-1 mb-3">Vladimir Khavinson’s umbrella term for short peptides or peptide complexes proposed to regulate tissue-specific function. “Proposed” matters: tissue-specific action is a hypothesis from the originating research group. See <Link href="/learn/bioregulator-organ-pairings-mechanism-vs-evidence" className="text-orange-600 hover:underline">organ pairings: mechanism vs. evidence</Link>.</dd><dt className="font-semibold text-gray-900 mt-4">Cytamins / cytomedins</dt><dd className="ml-0 mt-1 mb-3">Research terms for peptide extracts derived from animal organs or tissues: the first generation of Khavinson’s work. Sold as Cytomaxes.</dd><dt className="font-semibold text-gray-900 mt-4">Cytogens</dt><dd className="ml-0 mt-1 mb-3">Synthetic short peptides, typically two to four amino acids, designed around the organ-derived extracts: the second generation. The manufacturer’s press kit describes each as a synthesized copy of the working part of the most active section of the extract’s peptide. Thymogen, for example, is L-Glu-L-Trp (<a href="https://pubmed.ncbi.nlm.nih.gov/9637345/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">PubMed 9637345</a>).</dd><dt className="font-semibold text-gray-900 mt-4">Tissue specificity</dt><dd className="ml-0 mt-1 mb-3">The hypothesis that a peptide derived from or designed around a tissue acts preferentially in that tissue. It has not been established by independent research.</dd><dt className="font-semibold text-gray-900 mt-4">Gene expression</dt><dd className="ml-0 mt-1 mb-3">The process by which a cell uses a gene to make a protein. Khavinson’s group proposes that short peptides can influence it (<a href="https://pubmed.ncbi.nlm.nih.gov/22708439/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Khavinson et al., 2012</a>); that proposal is a hypothesis.</dd><dt className="font-semibold text-gray-900 mt-4">Telomerase</dt><dd className="ml-0 mt-1 mb-3">An enzyme that maintains the ends of chromosomes (telomeres). A 2003 cell study reported telomerase activity in cultured human cells exposed to Epithalon (<a href="https://pubmed.ncbi.nlm.nih.gov/12937682/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Khavinson et al., 2003</a>), a laboratory finding, not a human outcome.</dd><dt className="font-semibold text-gray-900 mt-4">PEPT1</dt><dd className="ml-0 mt-1 mb-3">A transporter in the small intestine that absorbs many di- and tripeptides from food. Its role in absorbing ordinary dietary peptides is established; its role for any specific bioregulator product is not. See <Link href="/learn/oral-vs-injectable-peptide-bioregulators-digestion-delivery" className="text-orange-600 hover:underline">Oral vs. injectable delivery</Link>.</dd></dl>

            <h2 id="pf-terms" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">Pure Fire collection names</h2>

            <dl><dt className="font-semibold text-gray-900 mt-4">Cytomaxes</dt><dd className="ml-0 mt-1 mb-3">Pure Fire’s <Link href="/products/collection/khavinson-cytomaxes" className="text-orange-600 hover:underline">collection</Link> of organ-derived peptide complexes in oral capsules. “Cytomax” is the product-family name; the research literature more often says cytamins or cytomedins. The manufacturer’s press kit describes Cytomaxes as made by a multi-month extraction of peptide fractions.</dd><dt className="font-semibold text-gray-900 mt-4">Cytogens (collection)</dt><dd className="ml-0 mt-1 mb-3">Pure Fire’s <Link href="/products/collection/khavinson-cytogens" className="text-orange-600 hover:underline">collection</Link> of synthetic short-peptide capsules.</dd><dt className="font-semibold text-gray-900 mt-4">A-number</dt><dd className="ml-0 mt-1 mb-3">The complex code printed for a Cytomax. Examples from Pure Fire’s product pages: Endoluten A-8 (pineal gland; the code also appears on the packaging shown in the manufacturer’s press kit), Cerluten A-5 (brain), Thyreogen A-2 (thyroid), Chelohart A-14 (heart), Gotratix A-18 (muscle). An A-number identifies a product; it is not a dose or a strength. See the <Link href="/khavinson-peptides-list" className="text-orange-600 hover:underline">Khavinson peptides list</Link>.</dd><dt className="font-semibold text-gray-900 mt-4">Organ pairing</dt><dd className="ml-0 mt-1 mb-3">The tissue a product is identified with: its source or intended focus. A pairing is not evidence that the product acts on that organ.</dd></dl>

            <h2 id="delivery-terms" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">Delivery terms</h2>

            <dl><dt className="font-semibold text-gray-900 mt-4">Oral</dt><dd className="ml-0 mt-1 mb-3">Taken by mouth as capsules or tablets; the product passes through digestion.</dd><dt className="font-semibold text-gray-900 mt-4">Sublingual</dt><dd className="ml-0 mt-1 mb-3">Held under the tongue. Some human studies used sublingual forms, and the manufacturer’s press kit notes that sublingual Cytomaxes and Cytogens exist.</dd><dt className="font-semibold text-gray-900 mt-4">Injectable</dt><dd className="ml-0 mt-1 mb-3">Delivered by injection, bypassing digestion. Thymalin, Epithalamin, Cortexin and Retinalamin are injectable drugs registered in Russia. Results from injected and oral forms should not be pooled.</dd></dl>

            <h2 id="regulatory-terms" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">Regulatory and documentation terms</h2>

            <dl><dt className="font-semibold text-gray-900 mt-4">Dietary supplement</dt><dd className="ml-0 mt-1 mb-3">The US category these products are sold under. Supplements are not approved by the FDA before sale (<a href="https://www.fda.gov/food/dietary-supplements" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">FDA’s dietary supplements page</a>).</dd><dt className="font-semibold text-gray-900 mt-4">FDA-approved</dt><dd className="ml-0 mt-1 mb-3">A status for drugs that have gone through FDA review for a specific use. No peptide bioregulator is FDA-approved.</dd><dt className="font-semibold text-gray-900 mt-4">EAEU registration certificate</dt><dd className="ml-0 mt-1 mb-3">A state registration document issued in the Eurasian Economic Union. It is not a test result or evidence of effect.</dd><dt className="font-semibold text-gray-900 mt-4">Certificate of analysis (COA)</dt><dd className="ml-0 mt-1 mb-3">A lab report on a specific production lot. See <Link href="/learn/registration-certificate-vs-certificate-of-analysis" className="text-orange-600 hover:underline">our explainer</Link>.</dd></dl>

            <p>Further reading: <Link href="/learn/khavinson-peptide-bioregulators-research-vs-fda-approval" className="text-orange-600 hover:underline">Research history vs. FDA approval</Link> · <Link href="/learn/oral-vs-injectable-peptide-bioregulators-digestion-delivery" className="text-orange-600 hover:underline">Oral vs. injectable delivery</Link> · <Link href="/learn/bioregulator-organ-pairings-mechanism-vs-evidence" className="text-orange-600 hover:underline">Organ pairings: mechanism vs. evidence</Link>.</p>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
