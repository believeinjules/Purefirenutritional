import { BookOpen, ExternalLink, Landmark } from "lucide-react";
import type { PeppySourceCard, StudyType } from "@shared/peppy/types";

const TYPE_LABEL: Record<StudyType, string> = {
  "systematic-review": "Systematic review",
  rct: "Randomised trial",
  clinical: "Clinical study",
  observational: "Observational",
  review: "Review",
  animal: "Animal study",
  "in-vitro": "Lab study",
  guidance: "NIH / FDA guidance",
  other: "Study",
};

/** Human-evidence types get a stronger badge than animal/lab/review work. */
const TYPE_STYLE: Record<StudyType, string> = {
  "systematic-review": "bg-emerald-50 text-emerald-800 border-emerald-200",
  rct: "bg-emerald-50 text-emerald-800 border-emerald-200",
  clinical: "bg-sky-50 text-sky-800 border-sky-200",
  observational: "bg-sky-50 text-sky-800 border-sky-200",
  review: "bg-gray-50 text-gray-700 border-gray-200",
  animal: "bg-amber-50 text-amber-800 border-amber-200",
  "in-vitro": "bg-amber-50 text-amber-800 border-amber-200",
  guidance: "bg-slate-50 text-slate-700 border-slate-200",
  other: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function SourceCard({ source }: { source: PeppySourceCard }) {
  const Icon = source.kind === "authority" ? Landmark : BookOpen;
  const meta = [
    source.journal,
    source.year,
    source.pmid ? `PMID ${source.pmid}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <li
      className="rounded-lg border border-gray-200 bg-gray-50/60 p-3"
      data-testid="peppy-source"
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${TYPE_STYLE[source.studyType]}`}
        >
          <Icon className="h-3 w-3" aria-hidden="true" />
          {TYPE_LABEL[source.studyType]}
        </span>
        {source.origin === "pubmed-live" && (
          <span className="text-[11px] text-gray-500">Live PubMed result</span>
        )}
      </div>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline text-sm font-medium leading-snug text-gray-900 underline-offset-2 hover:underline focus-visible:underline [overflow-wrap:anywhere]"
      >
        {source.title}
        <ExternalLink
          className="ml-1 inline h-3 w-3 align-baseline text-gray-400 group-hover:text-gray-600"
          aria-hidden="true"
        />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      {meta && (
        <p className="mt-0.5 text-xs text-gray-500 [overflow-wrap:anywhere]">
          {meta}
        </p>
      )}
      <p className="mt-2 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Finding: </span>
        {source.finding}
      </p>
      <p className="mt-1 text-xs text-gray-600">
        <span className="font-medium text-gray-700">Limitation: </span>
        {source.limitation}
      </p>
    </li>
  );
}
