import { createElement, type ReactNode } from "react";
import "./kinetic.css";

/** Split text into words; whitespace is collapsed, nothing else changes. */
export function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

type Props = {
  as?: "h1" | "h2" | "h3" | "p";
  text: string;
  className?: string;
  id?: string;
  /** Delay (ms) before the first word, e.g. to follow a heading. */
  delay?: number;
};

/**
 * Word-by-word reveal (mobile only, see kinetic.css). The full text is in the
 * static HTML and stays visible without JS / with reduced motion; the animation
 * only runs once JS adds `kinetic-ready` to <html>. Spans are aria-hidden and
 * the element carries aria-label so assistive tech reads the plain sentence.
 */
export default function KineticHeading({ as = "h1", text, className, id, delay = 0 }: Props) {
  const words = splitWords(text);
  const children: ReactNode[] = [];
  words.forEach((w, i) => {
    if (i > 0) children.push(" ");
    children.push(
      <span key={i} className="kt-word" aria-hidden="true" style={{ animationDelay: `${delay + i * 50}ms` }}>
        {w}
      </span>,
    );
  });
  return createElement(as, { id, className, "aria-label": text }, children);
}
