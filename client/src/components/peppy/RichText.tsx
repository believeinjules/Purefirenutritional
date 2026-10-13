import { Fragment, type ReactNode } from "react";
import type { PeppyProduct } from "@shared/peppy/types";
import { ProductMention } from "./ProductPreview";

/** Names of the answer's (already hidden-filtered) products → link the first mention of each. */
interface Mentions {
  pattern: RegExp;
  byName: Map<string, PeppyProduct>;
  linked: Set<string>;
}

function buildMentions(products: readonly PeppyProduct[]): Mentions | null {
  const byName = new Map(products.map(p => [p.name.toLowerCase(), p]));
  if (!byName.size) return null;
  const names = Array.from(byName.keys())
    .sort((a, b) => b.length - a.length)
    .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return {
    pattern: new RegExp(`\\b(${names.join("|")})\\b`, "gi"),
    byName,
    linked: new Set(),
  };
}

function withMentions(
  text: string,
  m: Mentions | null,
  keyPrefix: string
): ReactNode {
  if (!m) return text;
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of Array.from(text.matchAll(m.pattern))) {
    const product = m.byName.get(match[0].toLowerCase());
    if (!product || m.linked.has(product.id)) continue;
    m.linked.add(product.id);
    out.push(text.slice(last, match.index));
    out.push(
      <ProductMention key={`${keyPrefix}-${match.index}`} product={product}>
        {match[0]}
      </ProductMention>
    );
    last = match.index! + match[0].length;
  }
  if (!out.length) return text;
  out.push(text.slice(last));
  return out;
}

/** Inline **bold** only — everything else is rendered as plain text (no HTML injection). */
function inline(text: string, m: Mentions | null = null): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-semibold text-gray-900">
        {withMentions(part.slice(2, -2), m, String(i))}
      </strong>
    ) : (
      <Fragment key={i}>{withMentions(part, m, String(i))}</Fragment>
    )
  );
}

/**
 * Markdown-light: blank-line paragraphs, "- " bullet lists, numbered lists, **bold**.
 * `products` (visible products only) turns their first mention into a preview link.
 */
export default function RichText({
  text,
  className = "",
  products = [],
}: {
  text: string;
  className?: string;
  products?: readonly PeppyProduct[];
}) {
  const mentions = buildMentions(products);
  const blocks = text
    .split(/\n{2,}/)
    .map(b => b.trim())
    .filter(Boolean);
  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block
          .split("\n")
          .map(l => l.trim())
          .filter(Boolean);
        if (lines.every(l => /^[-•*]\s+/.test(l))) {
          return (
            <ul
              key={bi}
              className="list-disc space-y-1 pl-5 marker:text-orange-400"
            >
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^[-•*]\s+/, ""), mentions)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every(l => /^\d+[.)]\s+/.test(l))) {
          return (
            <ol key={bi} className="list-decimal space-y-1 pl-5">
              {lines.map((l, li) => (
                <li key={li}>
                  {inline(l.replace(/^\d+[.)]\s+/, ""), mentions)}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, mentions)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
