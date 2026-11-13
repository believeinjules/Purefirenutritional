import KineticHeading from "@/components/kinetic/KineticHeading";
import { useKineticReveal } from "@/components/kinetic/useKineticReveal";
import { Helmet } from "react-helmet-async";
import PageSeo from "@/components/seo/PageSeo";
import { requirePageHead } from "@/lib/seo/publicHeads";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ORGANIZATION_REF, JULIA_PERSON_REF } from "@/lib/seo";

// Body text: pf-journal/registration-certificate-vs-certificate-of-analysis.html (Julia-approved, 2026-11-05), verbatim.
const PATH = "/learn/registration-certificate-vs-certificate-of-analysis";
const { title: TITLE, description: DESCRIPTION } = requirePageHead("/learn/registration-certificate-vs-certificate-of-analysis");
const HEADLINE = "Registration Certificate vs. Certificate of Analysis: What Each Shows";
const HERO_JPG = "/images/learn/registration-certificate-vs-certificate-of-analysis-hero.jpg";
const HERO_ALT = "Unbranded box with a holographic QR label and a magnifying glass over a hologram seal";
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "Registration Certificate vs. Certificate of Analysis: What Each Shows",
      "description": "What an EAEU registration certificate shows, how to read a certificate of analysis for a supplement lot, and what neither document tells you about results.",
      "mainEntityOfPage": "https://www.purefirenutritional.com/learn/registration-certificate-vs-certificate-of-analysis",
      "inLanguage": "en-US",
      "image": "https://www.purefirenutritional.com" + HERO_JPG,
      "author": JULIA_PERSON_REF,
      "publisher": ORGANIZATION_REF
    }
  ]
} as const;

const EAEU_THUMB = "/images/learn/example-eaeu-registration-certificate-thumb.png";
const EAEU_ALT = "Annotated sample of a real EAEU Certificate of State Registration (Prime Peptide Collagen, registration AM.01.01.01.003.R.000063.02.24), with numbered callouts for product name, registration number and date, manufacturer, and country of manufacture. Watermarked SAMPLE · Pure Fire Longevity Journal.";
const COA_THUMB = "/images/learn/example-coa-illustrative-thumb.png";
const COA_ALT = "Illustrative certificate of analysis with placeholder values only, annotated with callouts for lot number, date, lab, identity method, purity, microbial tests, heavy metals, and signature. Watermarked EXAMPLE.";

export default function ArticleRegistrationVsCoa() {
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

          <picture>
            <img
              src={HERO_JPG}
              alt={HERO_ALT}
              width={1600}
              height={900}
              className="w-full h-auto rounded-lg mb-10"
            />
          </picture>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">

            <p>Supplement companies increasingly publish documents alongside their products, and that is a good thing. But documents answer different questions, and it’s easy to read more into a certificate than it says. This explainer covers the two most common types, a state registration certificate and a certificate of analysis (COA), what each one shows, and what neither can tell you.</p>

            <h2 id="registration" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">EAEU Certificate of State Registration</h2>

            <p>Pure Fire’s <Link href="/authenticity" className="text-orange-600 hover:underline">documentation library</Link> shows Eurasian Economic Union (EAEU) Certificates of State Registration, with English translations. A registration certificate records that a product was registered with authorities in that region. It typically lists:</p>

            <ul className="list-disc pl-6 space-y-2"><li>the product name as registered;</li><li>a registration number and date;</li><li>the manufacturer and country of manufacture.</li></ul>


            <figure className="my-8">
              <img
                src={EAEU_THUMB}
                alt={EAEU_ALT}
                width={360}
                height={480}
                loading="lazy"
                className="w-full max-w-md mx-auto h-auto rounded-lg border border-gray-200"
              />
              <figcaption className="text-sm text-gray-500 mt-2 text-center">
                Sample EAEU Certificate of State Registration (annotated). Real certificate, watermarked SAMPLE.
              </figcaption>
            </figure>

            <p>What it shows: that the product exists as a registered item in that jurisdiction, made by the named manufacturer. That helps you trace where a product came from and compare the name on your package with the registered name.</p>

            <p>What it doesn’t show: it is not a test result for the specific batch you hold, and it is not evidence of any health effect. As Pure Fire’s own library puts it, a registration certificate is not a certificate of analysis.</p>

            <h2 id="coa" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">Certificate of analysis (COA)</h2>

            <p>A COA reports laboratory tests on a specific production lot. It answers a narrower, more practical question: did this batch meet its specifications when it was tested? When reading one, check each of the following:</p>

            <ul className="list-disc pl-6 space-y-2"><li><strong>Product and lot.</strong> The product name and lot (batch) number should match your package. A COA for a different lot tells you about that lot, not yours.</li><li><strong>Lab and date.</strong> Who tested it, and when? Note whether the lab is the manufacturer’s own or an independent one.</li><li><strong>Tests run.</strong> Common categories are identity (is it what it says?), purity or content, microbiology, and contaminants such as heavy metals.</li><li><strong>Specification and result.</strong> Each test should show the acceptance limit and the measured result, so you can see whether it passed and by how much.</li><li><strong>Methods.</strong> A named method lets you see how something was measured.</li><li><strong>Signature.</strong> A responsible person should sign or approve the report.</li></ul>


            <figure className="my-8">
              <img
                src={COA_THUMB}
                alt={COA_ALT}
                width={360}
                height={480}
                loading="lazy"
                className="w-full max-w-md mx-auto h-auto rounded-lg border border-gray-200"
              />
              <figcaption className="text-sm text-gray-500 mt-2 text-center">
                Illustrative COA with placeholder values only (not a real lab report). Watermarked EXAMPLE.
              </figcaption>
            </figure>

            <p>Watch for COAs with no lot number, no lab name, results stated only as “pass” with no specification, or dates that don’t fit the product’s manufacture date. Those don’t prove a problem, but they make the document much less informative.</p>

            <h2 id="neither" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">What neither document shows</h2>

            <p>Neither document shows that a product works. A registration certificate shows that a product is registered; a COA shows what a batch contained when tested. Neither is FDA approval. In the U.S., dietary supplements are not approved by the FDA before sale (<a href="https://www.fda.gov/food/dietary-supplements" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">FDA’s dietary supplements page</a>), and no peptide bioregulator is FDA-approved. Questions about whether a product does anything belong to the research literature, which we discuss in <Link href="/learn/khavinson-peptide-bioregulators-research-vs-fda-approval" className="text-orange-600 hover:underline">Research history vs. FDA approval</Link> and <Link href="/learn/bioregulator-organ-pairings-mechanism-vs-evidence" className="text-orange-600 hover:underline">Organ pairings: mechanism vs. evidence</Link>.</p>

            <h2 id="questions" className="text-2xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24">Questions to ask a seller</h2>

            <ul className="list-disc pl-6 space-y-2"><li>Is there a COA for the lot I received, and who performed the testing?</li><li>Does the registered product name match the label?</li><li>Where was the product manufactured, and by whom?</li></ul>

            <p>Related: <Link href="/learn/cytomaxes-cytogens-a-numbers-glossary" className="text-orange-600 hover:underline">Glossary</Link> · <Link href="/learn/oral-vs-injectable-peptide-bioregulators-digestion-delivery" className="text-orange-600 hover:underline">Oral vs. injectable delivery</Link>.</p>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
