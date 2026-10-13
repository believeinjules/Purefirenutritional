/** Hand-written Learn articles (client/src/pages/learn/*), listed on the /articles index page. */
export type LearnArticle = {
  title: string;
  href: string;
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
    title: "Cytomaxes vs Cytogens",
    href: "/learn/cytomaxes-vs-cytogens",
    description: "The difference between natural Cytomaxes and synthetic Cytogens, and how to choose between them.",
  },
  {
    title: "Khavinson Peptides in the United States",
    href: "/learn/buy-khavinson-peptides-usa",
    description: "Why authentic Khavinson bioregulators are hard to find in the US, and how we source them.",
  },
  {
    title: "Peptides in Context: A Systems View",
    href: "/learn/peptides-in-context-systems-view",
    description: "Why we think about peptides as signals inside connected systems, and where Khavinson's model is still a hypothesis.",
    cover: {
      jpg: "/images/learn/peptides-in-context-systems-view-cover.jpg",
      webp: "/images/learn/peptides-in-context-systems-view-cover.webp",
      alt: "Peptides in Context: A Systems View of How the Body Regulates Itself",
    },
  },
];
