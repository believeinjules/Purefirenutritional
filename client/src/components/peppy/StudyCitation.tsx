import { ExternalLink } from "lucide-react";
import type { PeppySourceCard } from "@shared/peppy/types";
import { plainStudySummary, SHORT_STUDY_TYPE } from "@/lib/pepitaPreview";
import InlinePreview from "./InlinePreview";

/** Small text research link ("Lab study ↗"); hover/focus/tap shows a plain summary. */
export default function StudyCitation({
  source,
  n,
}: {
  source: PeppySourceCard;
  n: number;
}) {
  const s = plainStudySummary(source);
  const meta = [s.kind, s.year, s.source].filter(Boolean).join(" · ");
  return (
    <InlinePreview
      label={`Source ${n} summary`}
      content={
        <div className="space-y-1.5 text-sm text-gray-700" data-testid="pepita-study-preview">
          <p className="text-[11px] font-medium uppercase tracking-wide text-orange-700">
            Source {n} · in plain words
          </p>
          <p>
            {s.found}
            {s.caveat && (
              <>
                {" "}
                <span className="text-gray-500">Keep in mind: {s.caveat}</span>
              </>
            )}
          </p>
          <p className="border-t border-gray-100 pt-1.5 text-xs leading-snug text-gray-900 [overflow-wrap:anywhere]">
            “{s.title}”
          </p>
          <p className="text-[11px] text-gray-500">{meta}</p>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            Read the study <ExternalLink className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      }
    >
      <a
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Source ${n}: ${s.title} (opens in a new tab)`}
        data-testid="pepita-citation"
        className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-orange-200 transition-colors hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        {SHORT_STUDY_TYPE[source.studyType] ?? SHORT_STUDY_TYPE.other}
        <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
    </InlinePreview>
  );
}
