import { Helmet } from "react-helmet-async";
import PageSeo from "@/components/seo/PageSeo";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { lazy, Suspense, useEffect } from "react";
import Section from "@/components/learn/Section";
import MoleculeChain from "@/components/learn/MoleculeChain";
import ComparisonTabs from "@/components/learn/ComparisonTabs";
import AskPepitaChip from "@/components/learn/AskPepitaChip";
import AskPepitaDock from "@/components/learn/AskPepitaDock";
import Cite from "@/components/learn/Cite";
import { pillClass } from "@/components/learn/Tabs";
import Deferred from "@/components/learn/Deferred";
import { ClaimTag } from "@/components/learn/EvidenceBadge";
import "@/components/learn/learn.css";

const BelowFold = lazy(() => import("@/components/learn/BelowFold"));

const DESCRIPTION =
  "An interactive guide to Khavinson peptide bioregulators: what short peptides are, how Cytomaxes and Cytogens differ, the product families, and the research — with study types and limitations.";

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
        <article className="mx-auto max-w-3xl px-4 pb-32 pt-12 sm:pt-16">
          <div className="mb-6">
            <Link href="/journal" className="text-sm text-orange-600 hover:underline">← Longevity Journal</Link>
          </div>

          <header data-learn-section="What Khavinson peptide bioregulators are">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#E06050]">Education · Interactive guide</span>
            <h1 className="mt-2 text-4xl leading-tight text-gray-900 sm:text-5xl">What Are Khavinson Peptide Bioregulators?</h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              Peptide bioregulators are short chains of amino acids studied as signals that help tissues keep up their normal regulatory function. Here's the idea in plain terms first — then, if you want, the science underneath.
            </p>
            <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-sm">
              {[
                ["basics", "The basics"],
                ["deeper", "Going deeper"],
                ["cytomaxes-vs-cytogens", "Cytomaxes vs Cytogens"],
                ["product-families", "Product families"],
                ["body-systems", "Body systems"],
                ["study-library", "Studies"],
              ].map(([id, label]) => (
                <a key={id} href={`#${id}`} className={pillClass(false)}>
                  {label}
                </a>
              ))}
            </nav>
          </header>

          <Section id="basics" eyebrow="Level 1 · The simple version" title="Small signals, matched to tissues" topic="What peptides and amino-acid chains are">
            <div className="grid gap-6 sm:grid-cols-[1fr_240px] sm:items-center">
              <ol className="space-y-4 text-gray-700">
                <li>
                  <p className="font-medium text-gray-900">1. Peptides are short chains of amino acids.</p>
                  <p className="text-sm">The bioregulator peptides in this research are usually 2–7 amino acids long — far shorter than a protein.<Cite id="pmid:34834147" /></p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">2. Each one is matched to a tissue.</p>
                  <p className="text-sm">A Cytomax is a peptide complex from one organ or tissue — pineal gland, thymus, blood vessels and so on.</p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">3. It comes from a long research program.</p>
                  <p className="text-sm">The products were developed over 40+ years of research at the St. Petersburg Institute of Bioregulation and Gerontology under Prof. Vladimir Khavinson.</p>
                </li>
              </ol>
              <MoleculeChain variant="chain" className="mx-auto w-full max-w-[260px]" />
            </div>
            <div className="mt-6">
              <AskPepitaChip question="Explain peptide bioregulators simply: what is a short peptide and how is it different from a protein?" />
            </div>
          </Section>

          <Section id="deeper" eyebrow="Level 2 · Going deeper" title="What's proposed, and what's been shown" topic="How peptide bioregulators are proposed to work">
            <p className="mb-5 text-gray-700">
              Science moves from ideas to evidence. Below, each statement is labelled: a <strong>proposed mechanism</strong> is a hypothesis researchers are testing; a <strong>research finding</strong> is what a specific study reported — with the kind of study it was.
            </p>
            <ul className="space-y-4 text-gray-700">
              <li className="rounded-xl border border-gray-200 p-4">
                <ClaimTag kind="proposed" />
                Di- and tripeptides can be carried into cells by PEPT1/PEPT2 and LAT transporters, which may be relevant to how oral short peptides are absorbed.<Cite id="pmid:35887081" />
              </li>
              <li className="rounded-xl border border-gray-200 p-4">
                <ClaimTag kind="proposed" />
                Short peptides are proposed to enter cell nuclei and influence gene expression.<Cite id="pmid:34834147" />
              </li>
              <li className="rounded-xl border border-gray-200 p-4">
                <ClaimTag kind="shown" />
                In a computer-modelling study, a small set of dipeptides could bind specific DNA sequences — this shows plausibility, not an effect in people.<Cite id="pmid:31598715" />
              </li>
              <li className="rounded-xl border border-gray-200 p-4">
                <ClaimTag kind="shown" />
                The pineal extract Epithalamin increased mean lifespan by 11–31% in fruit flies, some mouse strains and rats (no effect in one mouse strain).<Cite id="pmid:9701766" />
              </li>
              <li className="rounded-xl border border-gray-200 p-4">
                <ClaimTag kind="shown" />
                In 266 older adults followed for 6–8 years, groups given injectable Thymalin and/or Epithalamin had lower reported mortality than controls. The trial was small, by the developers, and used injectable extracts — not oral supplements.<Cite id="pmid:14523363" />
              </li>
            </ul>

            <details className="group mt-6 rounded-xl border border-gray-200 bg-gray-50 open:bg-white">
              <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050] [&::-webkit-details-marker]:hidden">
                Level 3 · Technical notes: named peptide sequences
                <span aria-hidden className="text-gray-400 transition-transform group-open:rotate-45">＋</span>
              </summary>
              <div className="space-y-3 px-4 pb-4 text-sm text-gray-700">
                <p><strong>AEDG</strong> (Ala-Glu-Asp-Gly, synthetic Epitalon) was identified inside the natural pineal polypeptide complex by mass spectrometry.<Cite id="pmid:29124531" /></p>
                <p><strong>EDR</strong> (Pinealon) has been studied mainly in cell and animal models of neurons.<Cite id="pmid:33396470" /></p>
                <p><strong>AED</strong> (Ala-Glu-Asp, T-31) is the tripeptide in Cartalax; it was studied in stem-cell cultures and rats.<Cite id="pmid:32399807" /><Cite id="pmid:18306703" /></p>
                <p><strong>KE and EW</strong> are dipeptides in the injectable drug Thymalin, studied in laboratory models.<Cite id="pmid:37686182" /></p>
                <p className="text-gray-500">A result for one named peptide applies to that peptide, at that dose, in that model. It does not show that a different peptide or formulation works.</p>
              </div>
            </details>
            <div className="mt-6">
              <AskPepitaChip question="Give me the technical version: how are short peptides proposed to regulate gene expression, and what is still unproven?" />
            </div>
          </Section>

          {/* Merged from the former /learn/cytomaxes-vs-cytogens article (301s here). */}
          <Section id="cytomaxes-vs-cytogens" eyebrow="Two families. One research tradition." title="Cytomaxes vs Cytogens" topic="The difference between Cytomaxes and Cytogens">
            <p className="mb-6 text-gray-700">
              Both lines come from the same research program. The difference is how the peptides are made: extracted as a natural complex, or synthesised as one defined sequence.
            </p>
            <ComparisonTabs />
            <div className="mt-8 rounded-2xl border border-gray-200 p-5">
              <h3 className="text-2xl text-gray-900">How people choose</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                There is no single right answer, and the lines aren't mutually exclusive. Cytomaxes are complexes matched to an organ. Cytogens are defined sequences and aren't animal-derived. Revilab formulas combine several peptide complexes with nutrients. If you're unsure where to begin, Pepita can walk you through the options, or you can browse the full <Link href="/products" className="text-orange-600 hover:underline">catalog</Link>.
              </p>
            </div>
          </Section>

          <Deferred eagerIds={["product-families", "body-systems", "study-library"]}>
            <Suspense fallback={<div style={{ minHeight: 600 }} aria-busy="true" />}>
              <BelowFold />
            </Suspense>
          </Deferred>

          <Section id="availability" title="Availability in the United States" topic="Buying Khavinson peptides in the U.S.">
            <p className="text-gray-700">
              Pure Fire Nutritional is an authorized US retailer of Khavinson peptide bioregulators, carrying Cytomaxes, Cytogens and the Revilab series. Read more in <Link href="/learn/buy-khavinson-peptides-usa" className="text-orange-600 hover:underline">Buying Khavinson Peptides in the U.S.</Link>
            </p>
          </Section>

          <div className="mt-6 border-t border-gray-100 pt-8">
            <p className="text-xs text-gray-400">
              This article is for educational purposes only. These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>
        </article>
      </main>
      <AskPepitaDock />
      <Footer />
    </div>
  );
}
