import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { DSHEA_DISCLAIMER } from "@/content/categoryCopy";
import type { Crumb } from "@/lib/seo/category";

/** Renders "[text](/path)" links inside Editorial copy; everything else is plain text. */
export function CopyText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!m) return <span key={i}>{part}</span>;
        return (
          <Link key={i} href={m[2]} className="text-orange-600 hover:underline">
            {m[1]}
          </Link>
        );
      })}
    </>
  );
}

export function Intro({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="max-w-3xl space-y-4 text-gray-600 leading-relaxed" data-testid="category-intro">
      {paragraphs.map((p, i) => (
        <p key={i}>
          <CopyText text={p} />
        </p>
      ))}
      <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">{DSHEA_DISCLAIMER}</p>
    </div>
  );
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((c, i) => (
          <li key={c.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-gray-300" aria-hidden />}
            {i === crumbs.length - 1 ? (
              <span className="text-gray-900" aria-current="page">{c.name}</span>
            ) : (
              <Link href={c.path} className="hover:text-gray-900">{c.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
