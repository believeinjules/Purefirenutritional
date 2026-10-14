import { Link } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { JOURNAL_ARTICLES } from "@/content/learnArticles";

export const JOURNAL_TITLE = "Longevity Journal | Pure Fire Nutritional";
export const JOURNAL_DESCRIPTION =
  "Longevity Journal from Pure Fire Nutritional: what Khavinson peptide bioregulators are, Cytomaxes vs Cytogens, US sourcing, and a systems view of peptides.";

export default function Journal() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageSeo title={JOURNAL_TITLE} description={JOURNAL_DESCRIPTION} path="/journal" />
      <Navigation />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">Education</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-3 leading-tight">Longevity Journal</h1>
          <p className="text-gray-500 mb-12 max-w-2xl">
            Articles on peptide bioregulators and how we think about them.
          </p>

          <ul className="grid gap-8 sm:grid-cols-2">
            {JOURNAL_ARTICLES.map((a) => (
              <li key={a.href} className="min-w-0">
                <Link
                  href={a.href}
                  className="group block h-full overflow-hidden rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition"
                >
                  {a.cover ? (
                    <picture>
                      {a.cover.webp && <source srcSet={a.cover.webp} type="image/webp" />}
                      <img
                        src={a.cover.jpg}
                        alt={a.cover.alt}
                        width={1280}
                        height={720}
                        loading="lazy"
                        className="block w-full aspect-video object-cover"
                      />
                    </picture>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="w-full aspect-video flex items-end p-5"
                      style={{ background: "linear-gradient(135deg, rgb(120, 20, 50), rgb(70, 10, 30), rgb(25, 5, 12))" }}
                    >
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/60">Pure Fire Nutritional</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-xl font-semibold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {a.title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a.description}</p>
                    <span className="mt-3 inline-block text-sm text-orange-600 group-hover:underline">Read article →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
