import { useId, useState } from "react";
import { AlertTriangle, ChevronDown, FileText } from "lucide-react";
import type { ProtocolItem, ProtocolTimeline } from "@shared/peppy/types";
import { productPath } from "@/lib/seo";

/** Small provenance label: keeps manufacturer protocol, research and Pepita's own notes visually apart. */
export function KindLabel({ kind }: { kind: "protocol" | "research" | "pepita" }) {
  const map = {
    protocol: ["Manufacturer protocol", "bg-orange-50 text-orange-800 ring-orange-200"],
    research: ["Research", "bg-blue-50 text-blue-800 ring-blue-200"],
    pepita: ["Pepita's check", "bg-gray-100 text-gray-700 ring-gray-200"],
  } as const;
  const [text, cls] = map[kind];
  return <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ${cls}`} data-testid={`pepita-kind-${kind}`}>{text}</span>;
}

function Differs({ text }: { text: string }) {
  return (
    <div className="mt-1 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-900 ring-1 ring-amber-200" data-testid="pepita-protocol-discrepancy">
      <p className="flex items-center gap-1 font-medium">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Differs from the published source
      </p>
      <p className="mt-0.5">{text}</p>
    </div>
  );
}

function Name({ name, productId, sold }: { name: string; productId: string | null; sold?: boolean }) {
  return sold && productId ? (
    <a href={productPath(productId)} className="font-medium text-orange-700 underline underline-offset-2">{name}</a>
  ) : (
    <span className="font-medium text-gray-900">
      {name} <span className="text-[11px] font-normal text-gray-500" data-testid="pepita-protocol-unsold">(not sold by Pure Fire)</span>
    </span>
  );
}

function Item({ it }: { it: ProtocolItem }) {
  return (
    <li className="min-w-0 break-words py-1 text-gray-700" data-testid="pepita-protocol-item">
      <p>
        <Name name={it.name} productId={it.productId} sold={it.sold} />
        {it.orWith?.map(o => (
          <span key={o.name}>
            {" "}<span className="rounded bg-gray-200 px-1 text-[10px] font-semibold uppercase text-gray-700" data-testid="pepita-protocol-or">or</span>{" "}
            <Name name={o.name} productId={o.productId} sold={o.sold} />
          </span>
        ))}
      </p>
      {it.labelDirections && <p className="text-xs text-gray-600"><span className="font-medium text-gray-800">Label:</span> {it.labelDirections}</p>}
      {it.sourceDirections && <p className="text-xs text-gray-600"><span className="font-medium text-gray-800">In the course document:</span> {it.sourceDirections}</p>}
      {it.substitution && <p className="text-xs text-gray-600"><span className="font-medium text-gray-800">Substitution:</span> {it.substitution}</p>}
      {it.discrepancy && <Differs text={it.discrepancy} />}
    </li>
  );
}

/**
 * Manufacturer course (L2/L3): a brief overview box (goal, length, includes, source), then collapsed
 * month accordions ("Month 2 · 4 items"); only one month is open at a time, none by default.
 * Items in a month are taken together; "or" marks source-stated alternatives (take one).
 */
export default function PepitaProtocol({ protocol }: { protocol: ProtocolTimeline }) {
  const [phase, setPhase] = useState<number | null>(null);
  const base = useId();
  return (
    <section className="space-y-1.5 text-sm" data-testid="pepita-protocol" aria-label={protocol.name}>
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2" data-testid="pepita-protocol-overview">
        <p className="flex items-center gap-1.5 font-semibold text-gray-900">
          <FileText className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" /> {protocol.name}
        </p>
        <div className="mt-1"><KindLabel kind="protocol" /></div>
        <ul className="mt-1 space-y-0.5 text-xs text-gray-700">
          <li><span className="font-medium text-gray-900">Goal:</span> {protocol.goal}</li>
          <li><span className="font-medium text-gray-900">Length:</span> {protocol.duration}</li>
          <li><span className="font-medium text-gray-900">Includes:</span> {protocol.includes.join(", ")}</li>
          <li><span className="font-medium text-gray-900">Source:</span> {protocol.source}</li>
        </ul>
        <p className="mt-1 text-[11px] leading-snug text-gray-500" data-testid="pepita-protocol-note">{protocol.note} Products listed in a month are taken together; “or” means take one of them.</p>
      </div>
      <ol className="space-y-1.5">
        {protocol.phases.map((ph, i) => {
          const isOpen = phase === i;
          return (
            <li key={ph.label} className="rounded-xl border border-gray-200 bg-white" data-testid="pepita-protocol-phase">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${base}-p${i}`}
                onClick={() => setPhase(isOpen ? null : i)}
                data-testid="pepita-protocol-phase-toggle"
                className="flex min-h-[44px] w-full items-center justify-between gap-2 px-3 py-2 text-left font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                <span>
                  {ph.label} <span className="font-normal text-gray-500">· {ph.items.length} {ph.items.length === 1 ? "item" : "items"}</span>
                  {(ph.discrepancy || ph.items.some(x => x.discrepancy)) && <AlertTriangle className="ml-1.5 inline h-3.5 w-3.5 text-amber-600" aria-label="differs from the published source" />}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {isOpen && (
                <div id={`${base}-p${i}`} className="border-t border-gray-100 px-3 pb-2 pt-1" data-testid="pepita-protocol-items">
                  <ul className="divide-y divide-gray-100">
                    {ph.items.map(it => <Item key={it.name} it={it} />)}
                  </ul>
                  {ph.discrepancy && (
                    <div className="mt-1">
                      <KindLabel kind="pepita" />
                      <Differs text={ph.discrepancy} />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
