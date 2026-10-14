import type { RefObject } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { studyOpenMode, type CitationSummary } from "@/lib/pepitaPreview";

/** Year · study type, then finding and limitation (tooltip, inline expand, modal). */
export function StudySummary({
  summary,
  showTitle = true,
}: {
  summary: CitationSummary;
  showTitle?: boolean;
}) {
  return (
    <div className="space-y-1.5 text-sm text-gray-700">
      {showTitle && (
        <p className="font-medium leading-snug text-gray-900 [overflow-wrap:anywhere]">
          {summary.title}
        </p>
      )}
      <p className="text-xs text-gray-500">
        {[summary.year, summary.studyType].filter(Boolean).join(" · ")}
      </p>
      <p>
        <span className="font-medium text-gray-900">Finding: </span>
        {summary.finding}
      </p>
      <p className="text-xs text-gray-600">
        <span className="font-medium text-gray-700">Limitation: </span>
        {summary.limitation}
      </p>
    </div>
  );
}

/** Opens a study: inline iframe only for allowlisted hosts, otherwise an honest new-tab fallback. */
export function StudyDialog({
  summary,
  open,
  onOpenChange,
  returnFocusTo,
}: {
  summary: CitationSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Element to refocus when the dialog closes (the citation that opened it). */
  returnFocusTo?: RefObject<HTMLElement | null>;
}) {
  const target = studyOpenMode(summary.url);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto ${target?.mode === "embed" ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
        data-testid="pepita-study-dialog"
        onCloseAutoFocus={e => {
          if (!returnFocusTo?.current) return;
          e.preventDefault();
          returnFocusTo.current.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="pr-6 text-base leading-snug [overflow-wrap:anywhere]">
            {summary.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Study summary and link to the published source
          </DialogDescription>
        </DialogHeader>
        <StudySummary summary={summary} showTitle={false} />
        {target?.mode === "embed" && (
          <iframe
            src={target.url}
            title={`Study page: ${summary.title}`}
            className="h-[60vh] w-full rounded-lg border border-gray-200"
            sandbox="allow-scripts allow-same-origin allow-popups"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        )}
        {target?.mode === "new-tab" && (
          <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            {target.reason === "pdf"
              ? "This study is a PDF, so it opens in a new tab rather than here."
              : "The publisher doesn't allow its page to be shown inside other sites, so it opens in a new tab."}
          </p>
        )}
        {target && (
          <div className="flex justify-end">
            <Button
              asChild
              size="sm"
              className="bg-gray-900 text-white hover:bg-orange-600"
            >
              <a href={target.url} target="_blank" rel="noopener noreferrer">
                Open study in new tab
                <ExternalLink
                  className="ml-1.5 h-3.5 w-3.5"
                  aria-hidden="true"
                />
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
