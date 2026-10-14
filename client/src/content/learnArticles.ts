/** Hand-written Learn articles (client/src/pages/learn/*), listed in the Science nav dropdown and on the /journal index page. */
export type LearnArticle = {
  title: string;
  href: string;
  /** Shorter label for the Science nav dropdown (defaults to title). */
  navLabel?: string;
  /** Listed on /journal only, not in the Science nav dropdown. */
  hideFromNav?: boolean;
  /** One-line summary shown on the /articles index. */
  description: string;
  /** Optional cover image (site paths). */
  cover?: { jpg: string; webp?: string; alt: string };
};

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    title: "What Are Khavinson Peptide Bioregulators?",
    href: "/learn/what-are-khavinson-peptide-bioregulators",
    description: "What peptide bioregulators are, who Professor Vladimir Khavinson is, and the research behind Cytomaxes and Cytogens.",
  },
  {
    title: "Khavinson Peptides in the United States",
    navLabel: "Buying Khavinson Peptides in the U.S.",
    href: "/learn/buy-khavinson-peptides-usa",
    description: "Why authentic Khavinson bioregulators are hard to find in the US, and how we source them.",
  },
  {
    title: "Peptides in Context: A Systems View",
    navLabel: "Peptides in Context",
    hideFromNav: true,
    href: "/learn/peptides-in-context-systems-view",
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
    description: "What the research does and doesn't show for oral Khavinson bioregulators in perimenopause, and how to check quality before you start.",
    // TODO(cover): no approved cover yet; Journal index shows its neutral placeholder block.
  },
];
