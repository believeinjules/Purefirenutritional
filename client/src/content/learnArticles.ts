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
};

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    title: "Khavinson Peptides Explained: Benefits, Research & How They Work",
    navLabel: "What Are Khavinson Peptide Bioregulators?",
    href: "/learn/what-are-khavinson-peptide-bioregulators",
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
    date: "2026-10-14",
    description: "What the research does and doesn't show for oral Khavinson bioregulators in perimenopause, and how to check quality before you start.",
    cover: {
      jpg: "/images/learn/khavinson-bioregulators-perimenopause-oral-evidence-cover.jpg",
      webp: "/images/learn/khavinson-bioregulators-perimenopause-oral-evidence-cover.webp",
      alt: "A woman with short hair in a rust sweater reads printed research papers at a sunlit kitchen table, beside a mug and a bowl of oranges, with the title: Khavinson Peptides for Perimenopause: Injection Data Isn't Oral Proof",
    },
  },
];

/** /learn order: newest first by `date`; equal dates keep LEARN_ARTICLES order (stable sort). */
export const JOURNAL_ARTICLES: LearnArticle[] = [...LEARN_ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
