import { JOURNAL_ARTICLES, JOURNAL_CATEGORIES, JOURNAL_TAGS, type JournalCategory, type JournalTag, type LearnArticle } from "./learnArticles";

export const isCategory = (v: string | null | undefined): v is JournalCategory =>
  !!v && JOURNAL_CATEGORIES.some((c) => c.id === v);
export const isTag = (v: string | null | undefined): v is JournalTag => !!v && v in JOURNAL_TAGS;
export const categoryLabel = (id: JournalCategory) => JOURNAL_CATEGORIES.find((c) => c.id === id)!.label;

/**
 * Optional real page-view counts keyed by article href. Empty today: no view data is available to the
 * build (GA4 runs client-side only; no Vercel Web Analytics). When real data exists, populate this
 * (e.g. from a GA4 export at build time) and the sidebar can switch to a "Most read" list via mostRead().
 * Never fill it with estimates.
 */
export const ARTICLE_VIEWS: Partial<Record<string, number>> = {};

export const mostRead = (n = 5, views = ARTICLE_VIEWS): LearnArticle[] =>
  JOURNAL_ARTICLES.filter((a) => views[a.href] != null)
    .sort((a, b) => views[b.href]! - views[a.href]!)
    .slice(0, n);

/** Pinned reference posts, in LEARN_ARTICLES order with the glossary first. */
export const pinnedArticles = (): LearnArticle[] =>
  JOURNAL_ARTICLES.filter((a) => a.pinned).sort(
    (a, b) => Number(b.tags.includes("glossary")) - Number(a.tags.includes("glossary")),
  );

/** Curated "Start here" picks, one per category, in category order. */
export const startHereArticles = (): LearnArticle[] =>
  JOURNAL_CATEGORIES.flatMap((c) => JOURNAL_ARTICLES.filter((a) => a.category === c.id && a.startHere));
