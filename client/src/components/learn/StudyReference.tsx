import { ExternalLink } from "lucide-react";
import EvidenceBadge from "./EvidenceBadge";
import { evidenceFor, STUDY_TYPE_LABEL, type LearnStudy } from "./learnData";

/** Expandable study card: type, what was tested, who, findings, limitations, source link. */
export default function StudyReference({ study, defaultOpen = false }: { study: LearnStudy; defaultOpen?: boolean }) {
  const s = study.source;
  return (
    <details
      className="group rounded-xl border border-gray-200 bg-white open:border-gray-300 open:shadow-sm"
      open={defaultOpen}
      data-testid="study-reference"
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <EvidenceBadge level={evidenceFor(s)} />
            <span className="text-[11px] text-gray-400">
              {STUDY_TYPE_LABEL[s.studyType] ?? s.studyType}
              {s.year ? ` · ${s.year}` : ""}
            </span>
          </span>
          <span className="block break-words text-sm font-medium leading-snug text-gray-900">{s.title}</span>
        </span>
        <span aria-hidden className="mt-1 text-gray-400 transition-transform group-open:rotate-45">＋</span>
      </summary>
      <dl className="grid gap-3 border-t border-gray-100 px-4 pb-4 pt-3 text-sm text-gray-700 sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-400">What was tested</dt>
          <dd className="mt-0.5">{study.tested}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Who / what was studied</dt>
          <dd className="mt-0.5">{study.population}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Main finding</dt>
          <dd className="mt-0.5">{s.finding}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Limitations</dt>
          <dd className="mt-0.5">{s.limitation}</dd>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-gray-500">
            {s.authors ? `${s.authors}. ` : ""}
            {s.journal ? <em>{s.journal}</em> : null}
            {s.year ? `, ${s.year}` : ""}
          </p>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-[#B8463A] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050]"
          >
            {s.pmid ? `View on PubMed (PMID ${s.pmid})` : "View source"}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </dl>
    </details>
  );
}
