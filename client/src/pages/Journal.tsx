import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  JOURNAL_ARTICLES,
  JOURNAL_CATEGORIES,
  JOURNAL_TAGS,
  type JournalCategory,
  type JournalTag,
  type LearnArticle,
} from "@/content/learnArticles";
import {
  categoryLabel,
  isCategory,
  isTag,
  pinnedArticles,
  startHereArticles,
} from "@/content/journalListing";

export const JOURNAL_TITLE = "Longevity Journal | Pure Fire Nutritional";
export const JOURNAL_DESCRIPTION =
  "Longevity Journal from Pure Fire Nutritional: what Khavinson peptide bioregulators are, Cytomaxes vs Cytogens, US sourcing, and a systems view of peptides.";

const formatDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

const chipBase = "inline-block rounded-full border px-3 py-1 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";
const chip = (active: boolean) =>
  `${chipBase} ${active ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"}`;
const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded";

function Cover({ a, eager }: { a: LearnArticle; eager?: boolean }) {
  return a.cover ? (
    <picture>
      {a.cover.webp && <source srcSet={a.cover.webp} type="image/webp" />}
      <img
        src={a.cover.jpg}
        alt=""
        width={1280}
        height={720}
        loading={eager ? "eager" : "lazy"}
        className="block w-full aspect-video object-cover"
      />
    </picture>
  ) : (
    <div
      aria-hidden="true"
      className="w-full aspect-video flex items-end p-5"
      style={{ background: "linear-gradient(135deg, #faf8f5, #f6f3ee)" }}
    >
      <span className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Pure Fire Nutritional</span>
    </div>
  );
}

function TagChips({ tags, activeTag }: { tags: JournalTag[]; activeTag?: string }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
      {tags.map((t) => (
        <li key={t}>
          <Link
            href={`/learn?tag=${t}`}
            aria-current={activeTag === t ? "true" : undefined}
            className={`inline-block rounded-full px-2 py-0.5 text-xs transition ${focusRing} ${
              activeTag === t ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            {JOURNAL_TAGS[t]}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Card: the cover + title are the article link; tag chips are separate filter links (no nested anchors). */
function ArticleCard({ a, activeTag, eager }: { a: LearnArticle; activeTag?: string; eager?: boolean }) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition">
      <Link href={a.href} tabIndex={-1} aria-hidden="true">
        <Cover a={a} eager={eager} />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-gray-500">
          {categoryLabel(a.category)} · <time dateTime={a.date}>{formatDate(a.date)}</time>
        </p>
        <h3 className="mt-1 text-lg font-semibold text-gray-900 leading-snug">
          <Link href={a.href} className={`hover:text-orange-600 group-hover:text-orange-600 transition-colors ${focusRing}`}>
            {a.title}
          </Link>
        </h3>
        <p className={`mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3`}>{a.description}</p>
        <TagChips tags={a.tags} activeTag={activeTag} />
      </div>
    </article>
  );
}

function SidebarList({ title, note, items }: { title: string; note?: string; items: LearnArticle[] }) {
  return (
    <section aria-labelledby={`side-${title}`} className="rounded-lg border border-gray-200 p-5">
      <h2 id={`side-${title}`} className="text-xs font-semibold uppercase tracking-widest text-orange-500">
        {title}
      </h2>
      {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
      <ol className="mt-3 divide-y divide-gray-100">
        {items.map((a) => (
          <li key={a.href} className="py-3 first:pt-1 last:pb-0">
            <span className="block text-[11px] uppercase tracking-wider text-gray-500">{categoryLabel(a.category)}</span>
            <Link href={a.href} className={`text-sm font-medium text-gray-900 hover:text-orange-600 ${focusRing}`}>
              {a.navLabel ?? a.title}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Journal() {
  // Prerender has no query string; read it only after mount so hydration matches the static HTML.
  const search = useSearch();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const params = new URLSearchParams(mounted ? search : "");
  const rawCat = params.get("category");
  const rawTag = params.get("tag");
  const category: JournalCategory | undefined = isCategory(rawCat) ? rawCat : undefined;
  const tag: JournalTag | undefined = !category && isTag(rawTag) ? rawTag : undefined;
  const filtered = category
    ? JOURNAL_ARTICLES.filter((a) => a.category === category)
    : tag
      ? JOURNAL_ARTICLES.filter((a) => a.tags.includes(tag))
      : null;

  const list = filtered ?? JOURNAL_ARTICLES;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageSeo title={JOURNAL_TITLE} description={JOURNAL_DESCRIPTION} path="/learn" />
      <Navigation />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">Education</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-3 leading-tight">Longevity Journal</h1>
          <p className="text-gray-500 mb-8 max-w-2xl">Discover a different way of thinking about health and longevity through Pure Fire Nutritional.</p>

          <nav aria-label="Journal categories" className="mb-10">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link href="/learn" aria-current={!filtered ? "page" : undefined} className={chip(!filtered)}>
                  All articles
                </Link>
              </li>
              {JOURNAL_CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={`/learn?category=${c.id}`} aria-current={category === c.id ? "page" : undefined} className={chip(category === c.id)}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* DOM order = mobile order: the article grid first, then the sidebar. */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section aria-labelledby="grid-heading" className="min-w-0">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="grid-heading" className="text-2xl font-semibold text-gray-900">
                  {category ? categoryLabel(category) : tag ? `Tagged “${JOURNAL_TAGS[tag]}”` : "All articles"}
                  <span className="ml-2 text-base font-normal text-gray-500">({list.length})</span>
                </h2>
                {filtered && (
                  <Link href="/learn" className={`text-sm text-orange-600 hover:underline ${focusRing}`}>
                    ← All articles
                  </Link>
                )}
              </div>
              <ul className="grid gap-6 sm:grid-cols-2">
                {list.map((a, i) => (
                  <li key={a.href} className="min-w-0">
                    <ArticleCard a={a} activeTag={tag} eager={i < 2} />
                  </li>
                ))}
              </ul>
            </section>

            <aside aria-label="Reference and start here" className="space-y-6">
              <SidebarList title="Reference" items={pinnedArticles()} />
              <SidebarList title="Start here" note="Editor's picks: one foundational read per topic." items={startHereArticles()} />
            </aside>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
