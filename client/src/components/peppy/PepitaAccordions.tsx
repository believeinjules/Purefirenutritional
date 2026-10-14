import { useId, useState } from "react";
import { BookOpen, ChevronDown, CircleHelp, FileText, Info, ShieldCheck, Stethoscope } from "lucide-react";
import type { AnswerAccordion, PeppySourceCard } from "@shared/peppy/types";
import { EVIDENCE_CATEGORY } from "@/lib/pepitaPreview";
import { KindLabel } from "./PepitaProtocol";

const ICONS = { info: Info, book: BookOpen, shield: ShieldCheck, help: CircleHelp, doctor: Stethoscope } as const;

/** Icon-led accordions (mockups): one open at a time, none by default; "References (n)" last. */
export default function PepitaAccordions({ items, research = [] }: { items: AnswerAccordion[]; research?: PeppySourceCard[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  const all = [
    ...items.map(a => ({ ...a, kind: "text" as const })),
    ...(research.length ? [{ icon: "refs" as const, title: `References (${research.length})`, body: "", kind: "refs" as const }] : []),
  ];
  if (!all.length) return null;
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white" data-testid="pepita-accordions">
      {all.map((a, i) => {
        const Icon = a.icon === "refs" ? FileText : ICONS[a.icon];
        const isOpen = open === i;
        return (
          <div key={a.title} data-testid="pepita-accordion">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${base}-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              data-testid="pepita-accordion-toggle"
              className="flex min-h-[48px] w-full items-center gap-3 px-3 py-2 text-left text-sm text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400"
            >
              <Icon className="h-5 w-5 shrink-0 text-gray-700" aria-hidden="true" />
              <span className="flex-1">{a.title}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {isOpen && (
              <div id={`${base}-${i}`} className="px-3 pb-3 pl-11 text-sm text-gray-700" data-testid="pepita-accordion-body">
                {a.kind === "refs" ? (
                  <ul className="space-y-2">
                    <li><KindLabel kind="research" /></li>
                    {research.map(s => (
                      <li key={s.id}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-orange-700 underline underline-offset-2" data-testid="pepita-reference">
                          {s.title}<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        <span className="block text-xs text-gray-500">{EVIDENCE_CATEGORY[s.studyType] ?? EVIDENCE_CATEGORY.other}{s.year ? ` · ${s.year}` : ""}{s.finding ? ` · ${s.finding}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{a.body}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
