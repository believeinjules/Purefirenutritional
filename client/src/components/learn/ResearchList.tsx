import { ExternalLink } from "lucide-react";
import { researchList } from "./learnData";

/** Collapsed "Read the research" list: verbatim titles + PubMed links, nothing else. */
export default function ResearchList() {
  const items = researchList();
  return (
    <details className="group mt-5 rounded-xl border border-gray-200" data-testid="research-list">
      <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050] [&::-webkit-details-marker]:hidden">
        Read the research ({items.length})
        <span aria-hidden className="text-gray-400 transition-transform group-open:rotate-45">＋</span>
      </summary>
      <ul className="space-y-3 border-t border-gray-100 px-4 pb-4 pt-3">
        {items.map((s) => (
          <li key={s.id} className="text-sm" data-pmid={s.pmid}>
            <span className="block break-words text-gray-800">{s.title}</span>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#B8463A] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050]"
            >
              PubMed {s.pmid}
              <ExternalLink className="h-3 w-3" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
