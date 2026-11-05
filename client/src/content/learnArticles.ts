/** Hand-written Learn articles (client/src/pages/learn/*), listed in the Science nav dropdown and on the /learn index page. */
export type LearnArticle = {
  title: string;
  href: string;
  /** Shorter label for the Science nav dropdown (defaults to title). */
  navLabel?: string;
  /** Listed on /learn only, not in the Science nav dropdown. */
  hideFromNav?: boolean;
  /** One-line summary shown on the /articles index. */
  description: string;
  /** Publish date (YYYY-MM-DD). /learn lists newest first; ties keep array order. */
  date: string;
  /** Optional cover image (site paths). */
  cover?: { jpg: string; webp?: string; alt: string };
  /** Primary /learn category (one per article). */
  category: JournalCategory;
  /** 2–4 topic tags (slugs from JOURNAL_TAGS); clicking one filters /learn by ?tag=. */
  tags: JournalTag[];
  /** Curated "Start here" pick for its category (editorial, not view data). */
  startHere?: boolean;
  /** Pinned in the /learn "Reference" sidebar. */
  pinned?: boolean;
};

export const JOURNAL_CATEGORIES = [
  { id: "basics", label: "Basics" },
  { id: "science", label: "Science & Evidence" },
  { id: "buying", label: "Buying & Authenticity" },
] as const;
export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number]["id"];

export const JOURNAL_TAGS = {
  "khavinson": "Khavinson",
  "regulation": "US regulation",
  "glossary": "Glossary",
  "oral-delivery": "Oral delivery",
  "mechanism": "Mechanism",
  "evidence": "Evidence limits",
  "womens-health": "Women's health",
  "sourcing": "Sourcing",
  "documentation": "Certificates & COAs",
  "authenticity": "Authenticity",
  "systems": "Systems view",
} as const;
export type JournalTag = keyof typeof JOURNAL_TAGS;

/** URL of "Same Name. Same Peptides. So Why Buy From Us?" — change here to switch slug
 * (also update the literal <Route path> in App.tsx and llms.txt; seo.test.ts checks they match). */
export const WHY_BUY_PATH = "/learn/why-buy-khavinson-peptides-from-pure-fire";
export const BUY_KHAVINSON_USA_PATH = "/learn/buy-khavinson-peptides-usa";

export const LEARN_ARTICLES: LearnArticle[] = [
  // Newest Longevity Journal batch (2026-11-05). Order here = /learn order among equal dates.
  {
    title: "Khavinson Peptide Bioregulators: Research History vs. FDA Approval",
    navLabel: "Research vs FDA Approval",
    hideFromNav: true,
    href: "/learn/khavinson-peptide-bioregulators-research-vs-fda-approval",
    category: "basics",
    tags: ["khavinson", "regulation", "evidence"],
    date: "2026-11-05",
    description: "Explore Khavinson peptide bioregulators, their proposed uses, safety, evidence, and US legal status—and learn why research history alone is not FDA approval.",
    cover: {
      jpg: "/images/learn/khavinson-peptide-bioregulators-research-vs-fda-approval-hero.jpg",
      alt: "Capsules beside a document stamped Not FDA approved, with a peptide chain and a St. Petersburg cathedral",
    },
  },
  {
    title: "Oral vs. Injectable Peptide Bioregulators: Digestion and Delivery",
    navLabel: "Oral vs Injectable Delivery",
    hideFromNav: true,
    href: "/learn/oral-vs-injectable-peptide-bioregulators-digestion-delivery",
    category: "science",
    tags: ["oral-delivery", "mechanism", "evidence"],
    date: "2026-11-05",
    description: "Explore oral peptide bioregulators, their proposed role, digestion and delivery, and Khavinson's research on tissue specificity and its evidence limits.",
    cover: {
      jpg: "/images/learn/oral-vs-injectable-peptide-bioregulators-digestion-delivery-hero.jpg",
      alt: "Two capsules and a sublingual tablet on linen, with a syringe out of focus in the background",
    },
  },
  {
    title: "Bioregulator Organ Pairings: Proposed Mechanism vs. Measured Evidence",
    navLabel: "Organ Pairings: Mechanism vs Evidence",
    hideFromNav: true,
    href: "/learn/bioregulator-organ-pairings-mechanism-vs-evidence",
    category: "science",
    tags: ["mechanism", "evidence", "oral-delivery"],
    date: "2026-11-05",
    description: "Explore Khavinson bioregulator supplements, organ pairings, proposed mechanisms, and how digestion and absorption may alter oral peptide uptake, availability.",
  },
  {
    title: "Cytomaxes, Cytogens and A-Numbers: A Glossary",
    navLabel: "Cytomaxes, Cytogens & A-Numbers",
    hideFromNav: true,
    href: "/learn/cytomaxes-cytogens-a-numbers-glossary",
    category: "basics",
    tags: ["glossary", "khavinson", "regulation"],
    pinned: true,
    date: "2026-11-05",
    description: "Plain definitions of peptide bioregulator terms: cytamins, cytomedins, cytogens, Pure Fire's Cytomaxes and Cytogens collections, A-numbers and US status.",
  },
  {
    title: "Registration Certificate vs. Certificate of Analysis: What Each Shows",
    navLabel: "Registration Certificate vs COA",
    hideFromNav: true,
    href: "/learn/registration-certificate-vs-certificate-of-analysis",
    category: "buying",
    tags: ["documentation", "authenticity"],
    pinned: true,
    date: "2026-11-05",
    description: "What an EAEU registration certificate shows, how to read a certificate of analysis for a supplement lot, and what neither document tells you about results.",
    cover: {
      jpg: "/images/learn/registration-certificate-vs-certificate-of-analysis-hero.jpg",
      alt: "Unbranded box with a holographic QR label and a magnifying glass over a hologram seal",
    },
  },
  {
    title: "Khavinson Peptides Explained: Benefits, Research & How They Work",
    navLabel: "What Are Khavinson Peptide Bioregulators?",
    href: "/learn/what-are-khavinson-peptide-bioregulators",
    category: "basics",
    tags: ["khavinson", "mechanism"],
    startHere: true, pinned: true,
    date: "2026-05-14",
    description: "What peptide bioregulators are, who Professor Vladimir Khavinson is, and the research behind Cytomaxes and Cytogens.",
    cover: {
      jpg: "/images/learn/what-are-khavinson-peptide-bioregulators-banner.jpg",
      webp: "/images/learn/what-are-khavinson-peptide-bioregulators-banner.webp",
      alt: "A sunlit lab bench with a microscope, flask and a book labeled Peptide Bioregulators, with the title: Khavinson Peptides Explained: Benefits, Research & How They Work",
    },
  },
  {
    title: "Where to Buy Authentic Khavinson Peptides in the USA: A Complete Guide",
    navLabel: "Buying Khavinson Peptides in the U.S.",
    href: "/learn/buy-khavinson-peptides-usa",
    category: "buying",
    tags: ["sourcing", "authenticity", "regulation"],
    startHere: true,
    date: "2026-05-14",
    description: "Why authentic Khavinson bioregulators are hard to find in the US, how to check any seller, and how we source them.",
    cover: {
      jpg: "/images/learn/buy-khavinson-peptides-usa-banner.jpg",
      webp: "/images/learn/buy-khavinson-peptides-usa-banner.webp",
      alt: "Supplement boxes, a passport and customs paperwork beside a globe and a city skyline, with the title: Where to Buy Authentic Khavinson Peptides in the USA: A Complete Guide",
    },
  },
  {
    title: "Peptides in Context: A Systems View",
    navLabel: "Peptides in Context",
    hideFromNav: true,
    href: "/learn/peptides-in-context-systems-view",
    category: "science",
    tags: ["systems", "mechanism", "evidence"],
    startHere: true,
    date: "2026-10-13",
    description: "Why we think about peptides as signals inside connected systems, and where Khavinson's model is still a hypothesis.",
    cover: {
      jpg: "/images/learn/peptides-in-context-systems-view-cover.jpg",
      webp: "/images/learn/peptides-in-context-systems-view-cover.webp",
      alt: "Peptides in Context: A Systems View of How the Body Regulates Itself",
    },
  },
  {
    title: "Oral Khavinson Bioregulators in Perimenopause: What the Research Does (and Doesn't) Show",
    navLabel: "Perimenopause: Oral Evidence",
    hideFromNav: true,
    href: "/learn/khavinson-bioregulators-perimenopause-oral-evidence",
    category: "science",
    tags: ["womens-health", "oral-delivery", "evidence"],
    date: "2026-10-14",
    description: "What the research does and doesn't show for oral Khavinson bioregulators in perimenopause, and how to check quality before you start.",
    cover: {
      jpg: "/images/learn/khavinson-bioregulators-perimenopause-oral-evidence-cover.jpg",
      webp: "/images/learn/khavinson-bioregulators-perimenopause-oral-evidence-cover.webp",
      alt: "A woman with short hair in a rust sweater reads printed research papers at a sunlit kitchen table, beside a mug and a bowl of oranges, with the title: Khavinson Peptides for Perimenopause: Injection Data Isn't Oral Proof",
    },
  },
  {
    title: "Same Name. Same Peptides. So Why Buy From Us?",
    navLabel: "Why Buy From Pure Fire",
    hideFromNav: true,
    href: WHY_BUY_PATH,
    category: "buying",
    tags: ["sourcing", "authenticity", "documentation"],
    date: "2026-10-23",
    description: "Same peptide name, very different prices. What a sequence can't tell you, why the manufacturer and paperwork matter, and what to ask before you buy.",
    cover: {
      jpg: "/images/learn/why-buy-khavinson-peptides-from-pure-fire-cover.jpg",
      webp: "/images/learn/why-buy-khavinson-peptides-from-pure-fire-cover.webp",
      alt: "Two plain product boxes and folded paperwork on a dark lab bench under glowing molecule models, with the title: Same Name. Same Peptides. So Why Buy From Us?",
    },
  },
];

/** /learn order: newest first by `date`; equal dates keep LEARN_ARTICLES order (stable sort). */
export const JOURNAL_ARTICLES: LearnArticle[] = [...LEARN_ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
