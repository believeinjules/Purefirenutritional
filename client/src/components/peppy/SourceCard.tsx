import { useId, useRef, useState, type PointerEvent } from "react";
import { BookOpen, ChevronDown, Landmark } from "lucide-react";
import type { PeppySourceCard, StudyType } from "@shared/peppy/types";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  STUDY_TYPE_LABEL as TYPE_LABEL,
  citationSummary,
} from "@/lib/pepitaPreview";
import { StudyDialog, StudySummary } from "./StudyPreview";

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
  const summary = citationSummary(source);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const lastPointer = useRef<string>("mouse");
  const panelId = useId();
  const titleRef = useRef<HTMLButtonElement>(null);
  // Touch has no hover: first tap expands the summary inline, the panel's button opens the study.
  const onTitleClick = () => {
    if (lastPointer.current === "touch") setExpanded(e => !e);
    else setDialogOpen(true);
  };
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
      <HoverCard
        openDelay={250}
        closeDelay={100}
        open={hoverOpen}
        // Touch focus would open the hover card too; touch uses the inline summary instead.
        onOpenChange={o => setHoverOpen(o && lastPointer.current !== "touch")}
      >
        <HoverCardTrigger asChild>
          <button
            ref={titleRef}
            type="button"
            onPointerDown={(e: PointerEvent) => {
              lastPointer.current = e.pointerType;
              if (e.pointerType === "touch") setHoverOpen(false);
            }}
            onKeyDown={() => {
              lastPointer.current = "keyboard";
            }}
            onClick={onTitleClick}
            aria-haspopup="dialog"
            aria-expanded={expanded || undefined}
            aria-controls={expanded ? panelId : undefined}
            aria-label={`Study: ${source.title}. Show summary and source`}
            className="group inline text-left text-sm font-medium leading-snug text-gray-900 underline decoration-gray-300 decoration-dotted underline-offset-2 hover:decoration-gray-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 [overflow-wrap:anywhere]"
            data-testid="pepita-citation"
          >
            {source.title}
            <ChevronDown
              className={`ml-1 inline h-3 w-3 align-baseline text-gray-400 transition-transform [@media(hover:hover)]:hidden ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          align="start"
          className="w-80 max-w-[calc(100vw-2rem)] border-sky-100 bg-white"
          data-testid="pepita-citation-tooltip"
        >
          <StudySummary summary={summary} />
          <p className="mt-2 text-[11px] text-gray-400">
            Click or press Enter to open the study
          </p>
        </HoverCardContent>
      </HoverCard>
      {meta && (
        <p className="mt-0.5 text-xs text-gray-500 [overflow-wrap:anywhere]">
          {meta}
        </p>
      )}
      {expanded && (
        <div
          id={panelId}
          className="mt-2 rounded-md border border-sky-100 bg-white p-2.5"
          data-testid="pepita-citation-expanded"
        >
          <StudySummary summary={summary} showTitle={false} />
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-2 text-xs font-medium text-sky-700 underline underline-offset-2"
          >
            Open study
          </button>
        </div>
      )}
      <StudyDialog
        summary={summary}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        returnFocusTo={titleRef}
      />
      {!expanded && (
        <>
          <p className="mt-2 text-sm text-gray-700">
            <span className="font-medium text-gray-900">Finding: </span>
            {source.finding}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            <span className="font-medium text-gray-700">Limitation: </span>
            {source.limitation}
          </p>
        </>
      )}
    </li>
  );
}
