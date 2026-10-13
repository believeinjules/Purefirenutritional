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
import ResearchList from "@/components/learn/ResearchList";
import { Dna, GitCompareArrows, Pill, Shrink, Waypoints } from "lucide-react";
import { pillClass } from "@/components/learn/Tabs";
import Deferred from "@/components/learn/Deferred";
import "@/components/learn/learn.css";

const BelowFold = lazy(() => import("@/components/learn/BelowFold"));

/** Science cards: final copy from Research (2026-10-13), verbatim. "Proposed" on cards 2 and 4 only. */
const BEATS: { Icon: typeof Dna; title: string; text: string; note?: string }[] = [
  { Icon: Dna, title: "Your genes take direction", text: "Every cell carries the same DNA, but each tissue switches on only the genes it needs. Small signals inside the cell help decide which genes are active and when." },
  { Icon: Waypoints, title: "Bioregulators are tiny signals", note: "Proposed", text: "Bioregulators are very short peptides, just 2 to 7 amino acids long. Researchers propose that they reach the cell's nucleus and help guide which genes switch on, the way the body's own signals do." },
  { Icon: Shrink, title: "Small is different from big", text: "Large proteins, like insulin, get broken down by digestion, which is why many of them have to be injected. The gut has natural carriers built to absorb very short peptides, so tiny peptides are a different story." },
  { Icon: Pill, title: "Made to be taken by mouth", note: "Proposed", text: "That's why bioregulators are made as capsules and under-the-tongue forms rather than shots. Scientists are still studying exactly how each one is absorbed." },
  { Icon: GitCompareArrows, title: "Cytomax vs Cytogen", text: "Cytomaxes are natural peptide complexes taken from young animal tissue, matched to one organ or system. Cytogens are single, lab-made peptide sequences, a precise copy of one signal." },
];

const DESCRIPTION =
  "A short, interactive introduction to Khavinson peptide bioregulators: what short peptides are, how they are thought to work, how Cytomaxes and Cytogens differ, and the product families.";

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
              Peptide bioregulators are short chains of amino acids studied as signals that help tissues keep up their normal regulatory function. Here's the basic idea, in plain terms.
            </p>
            <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-sm">
              {[
                ["basics", "The basics"],
                ["deeper", "How it may work"],
                ["cytomaxes-vs-cytogens", "Cytomaxes vs Cytogens"],
                ["product-families", "Product families"],
                ["body-systems", "Body systems"],
              ].map(([id, label]) => (
                <a key={id} href={`#${id}`} className={pillClass(false)}>
                  {label}
                </a>
              ))}
            </nav>
          </header>

          <Section id="basics" eyebrow="The basics" title="Small signals, matched to tissues" topic="What peptides and amino-acid chains are">
            <div className="grid gap-6 sm:grid-cols-[1fr_240px] sm:items-center">
              <ol className="space-y-4 text-gray-700">
                <li>
                  <p className="font-medium text-gray-900">1. Peptides are short chains of amino acids.</p>
                  <p className="text-sm">Usually 2–7 amino acids long — far shorter than a protein.</p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">2. Each one is matched to a tissue.</p>
                  <p className="text-sm">A Cytomax is a peptide complex from one organ or tissue — pineal gland, thymus, blood vessels and so on.</p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">3. It comes from a long research program.</p>
                  <p className="text-sm">The products build on decades of research at the St. Petersburg Institute of Bioregulation and Gerontology under Prof. Vladimir Khavinson.</p>
                </li>
              </ol>
              <MoleculeChain variant="chain" className="mx-auto w-full max-w-[260px]" />
            </div>
            <div className="mt-6">
              <AskPepitaChip question="Explain peptide bioregulators simply: what is a short peptide and how is it different from a protein?" />
            </div>
          </Section>

          <Section id="deeper" eyebrow="How it may work" title="The science, in plain terms" topic="How peptide bioregulators are proposed to work">
            <ol className="grid gap-3 sm:grid-cols-2">
              {BEATS.map(({ Icon, title, text, note }, i) => (
                <li key={i} className="flex gap-3 rounded-2xl border border-gray-200 p-4">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FBE7E4] text-[#E06050]" aria-hidden>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg leading-snug text-gray-900">{title}</h3>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-700">{text}</span>
                    {note ? <span className="mt-1.5 inline-block text-[11px] uppercase tracking-wider text-gray-500">{note}</span> : null}
                  </div>
                </li>
              ))}
            </ol>
            <ResearchList />
            <div className="mt-6">
              <AskPepitaChip question="Explain in simple terms how peptide bioregulators are thought to work, and what is still unproven." />
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
                There is no single right answer, and the lines aren't mutually exclusive. Cytomaxes are complexes derived from young animal tissue and matched to an organ. Cytogens are defined sequences and aren't animal-derived. Revilab formulas combine several peptide complexes with nutrients. If you're unsure where to begin, Pepita can walk you through the options, or you can browse the full <Link href="/products" className="text-orange-600 hover:underline">catalog</Link>.
              </p>
            </div>
          </Section>

          <Deferred eagerIds={["product-families", "body-systems"]}>
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
