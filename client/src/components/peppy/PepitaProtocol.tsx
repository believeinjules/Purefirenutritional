import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ProtocolTimeline } from "@shared/peppy/types";
import { productPath } from "@/lib/seo";

/**
 * Manufacturer course (L2/L3): a collapsed summary card; tapping opens the month-by-month timeline,
 * where each month expands on tap and only one month is open at a time (never all expanded).
 */
export default function PepitaProtocol({ protocol }: { protocol: ProtocolTimeline }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<number | null>(null);
  const base = useId();
  return (
    <section className="rounded-xl border border-gray-200 bg-white text-sm" data-testid="pepita-protocol" aria-label={protocol.name}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${base}-body`}
        onClick={() => setOpen(o => !o)}
        data-testid="pepita-protocol-toggle"
        className="flex min-h-[44px] w-full items-center justify-between gap-2 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      >
        <span className="min-w-0">
          <span className="block font-medium text-gray-900">{protocol.name}</span>
          <span className="block text-xs text-gray-600">{protocol.duration} · {protocol.goal}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div id={`${base}-body`} className="space-y-2 border-t border-gray-100 px-3 pb-3 pt-2" data-testid="pepita-protocol-body">
          <p className="text-xs text-gray-600">
            <span className="font-medium text-gray-800">Source:</span> {protocol.source}
          </p>
          <ol className="space-y-1.5">
            {protocol.phases.map((ph, i) => {
              const isOpen = phase === i;
              return (
                <li key={ph.label} className="rounded-lg bg-gray-50" data-testid="pepita-protocol-phase">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${base}-p${i}`}
                    onClick={() => setPhase(isOpen ? null : i)}
                    data-testid="pepita-protocol-phase-toggle"
                    className="flex min-h-[44px] w-full items-center justify-between gap-2 px-3 py-2 text-left font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                  >
                    <span>
                      {ph.label} <span className="font-normal text-gray-500">· {ph.items.length} items</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                  {isOpen && (
                    <ul id={`${base}-p${i}`} className="space-y-1 px-3 pb-2" data-testid="pepita-protocol-items">
                      {ph.items.map(it => (
                        <li key={it.name} className="min-w-0 break-words text-gray-700">
                          {it.sold && it.productId ? (
                            <a href={productPath(it.productId)} className="font-medium text-orange-700 underline underline-offset-2">{it.name}</a>
                          ) : (
                            <span className="font-medium text-gray-900">{it.name}</span>
                          )}
                          {!it.sold && <span className="ml-1 text-[11px] text-gray-500">(not sold by Pure Fire)</span>}
                          <span className="block text-xs text-gray-600">{it.directions}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="text-[11px] leading-snug text-gray-500" data-testid="pepita-protocol-note">{protocol.note}</p>
        </div>
      )}
    </section>
  );
}
