import { Helmet } from "react-helmet-async";
import PageSeo from "@/components/seo/PageSeo";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import TwoTypes from "@/components/learn/TwoTypes";
import BodySystemNav from "@/components/learn/BodySystemNav";
import AskPepitaDock from "@/components/learn/AskPepitaDock";
import "@/components/learn/learn.css";

const DESCRIPTION =
  "Khavinson peptide bioregulators are short peptides and peptide complexes studied for how they may influence cellular activity and tissue function. Learn the two types: Cytogens and Cytomaxes.";

/** Copy: Julia, 2026-10-13 — verbatim. Her copy drives the order; visuals only support it. */
export default function ArticleKhavinsonPeptides() {
  // Old links (/learn/cytomaxes-vs-cytogens 301, FAQ) land on #cytomaxes-vs-cytogens; the
  // browser's own fragment scroll can run before the SPA has rendered, so scroll once mounted.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-white">
      <PageSeo
        title="What Are Khavinson Peptide Bioregulators? | Pure Fire Nutritional"
        description={DESCRIPTION}
        path="/learn/what-are-khavinson-peptide-bioregulators"
        type="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "What Are Khavinson Peptide Bioregulators?",
          "description": DESCRIPTION,
          "datePublished": "2026-05-14",
          "dateModified": "2026-10-13",
          "publisher": { "@type": "Organization", "name": "Pure Fire Nutritional", "url": "https://www.purefirenutritional.com" },
          "url": "https://www.purefirenutritional.com/learn/what-are-khavinson-peptide-bioregulators"
        })}</script>
      </Helmet>
      <Navigation />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 pb-28 pt-12 sm:pt-16">
          <header id="intro" data-pepita-topic="intro">
            <h1 className="text-4xl leading-tight text-gray-900 sm:text-5xl">What Are Khavinson Peptide Bioregulators?</h1>
            <p className="mt-3 text-xl text-gray-600">A different approach to peptide science.</p>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-gray-700">
              <p>Peptides are tiny chains of amino acids—the same building blocks that make up proteins. Some peptides naturally help cells communicate and regulate biological processes.</p>
              <p>Khavinson peptide bioregulators are a group of short peptides and peptide complexes studied for how they may influence cellular activity and tissue function.</p>
              <p>Researchers have investigated their potential roles in healthy aging and normal physiological regulation. It’s a developing area of research, and evidence for specific benefits varies by peptide.</p>
            </div>
          </header>

          {/* Anchor kept for the old /learn/cytomaxes-vs-cytogens 301 and the FAQ link. */}
          <section id="cytomaxes-vs-cytogens" data-pepita-topic="types" aria-labelledby="two-types-h" className="scroll-mt-28 pt-14">
            <h2 id="two-types-h" className="text-3xl leading-tight text-gray-900 sm:text-4xl">Two Types You’ll Find at Pure Fire</h2>
            <dl className="mt-5 space-y-3 text-gray-700">
              <div>
                <dt className="inline font-medium text-gray-900">Cytogens — Defined short peptides: </dt>
                <dd className="inline">Made in a laboratory using specific amino-acid sequences.</dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-900">Cytomaxes — Natural peptide complexes: </dt>
                <dd className="inline">Mixtures of peptides extracted from animal tissues.</dd>
              </div>
            </dl>
            <p className="mt-4 text-gray-700">Both come from the Khavinson research tradition, but their compositions and manufacturing methods differ.</p>
            <TwoTypes />
          </section>

          <section id="body-systems" data-pepita-topic="systems" aria-labelledby="explore-h" className="scroll-mt-28 pt-14">
            <h2 id="explore-h" className="text-3xl leading-tight text-gray-900 sm:text-4xl">Explore What Interests You</h2>
            <div className="mt-4 space-y-3 text-gray-700">
              <p>Curious about the research associated with a particular part of the body?</p>
              <p>Browse our products by body system to see the ingredients, formulations, and available evidence.</p>
            </div>
            <BodySystemNav />
          </section>

          <p className="mt-14 text-sm text-gray-700">
            Want the deeper science? Visit The Short Peptide for detailed explanations and research.{" "}
            <a
              href="https://theshortpeptide.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B8463A] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050]"
            >
              Explore the research →<span className="sr-only"> (opens The Short Peptide in a new tab)</span>
            </a>
          </p>

          <div className="mt-10 border-t border-gray-100 pt-8">
            <p className="text-xs text-gray-400">
              This article is for educational purposes only. These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.
            </p>
            <Link href="/journal" className="mt-4 inline-block text-sm text-orange-600 hover:underline">← Longevity Journal</Link>
          </div>
        </article>
      </main>
      <AskPepitaDock />
      <Footer />
    </div>
  );
}
