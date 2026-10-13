import EvidenceBadge from "./EvidenceBadge";
import { evidenceFor, learnStudy } from "./learnData";

/** Inline citation: evidence label + link to the source (registry only). */
export default function Cite({ id }: { id: string }) {
  const s = learnStudy(id).source;
  return (
    <span className="ml-1 inline-flex flex-wrap items-center gap-1 align-middle">
      <EvidenceBadge level={evidenceFor(s)} />
      <a
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        title={s.title}
        className="text-[11px] text-[#B8463A] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050]"
      >
        {s.pmid ? `PMID ${s.pmid}` : "Source"}
        <span className="sr-only">: {s.title} (opens in a new tab)</span>
      </a>
    </span>
  );
}
