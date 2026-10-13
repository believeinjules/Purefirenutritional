import { useState } from "react";
import ProductLinks from "./ProductLinks";
import StudyReference from "./StudyReference";
import AskPepitaChip from "./AskPepitaChip";
import { BODY_SYSTEMS, learnStudy, productsForSystem } from "./learnData";
import type { Product } from "@/data/products";

/** Interactive body map: pick a system to see related products and the research behind them. */
export default function BodySystemExplorer({ catalog }: { catalog?: readonly Product[] }) {
  const [active, setActive] = useState(BODY_SYSTEMS[0].id);
  const sys = BODY_SYSTEMS.find((s) => s.id === active)!;
  const items = productsForSystem(sys, catalog);
  return (
    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
      <div className="flex gap-4 md:block">
        <svg viewBox="0 0 120 260" className="h-56 w-auto flex-shrink-0 md:h-auto md:w-full" aria-hidden="true">
          <g fill="#f3f4f6" stroke="#e5e7eb" strokeWidth={1.5}>
            <circle cx={60} cy={28} r={20} />
            <rect x={36} y={52} width={48} height={92} rx={18} />
            <rect x={18} y={56} width={14} height={80} rx={7} />
            <rect x={88} y={56} width={14} height={80} rx={7} />
            <rect x={38} y={140} width={18} height={110} rx={9} />
            <rect x={64} y={140} width={18} height={110} rx={9} />
          </g>
          {BODY_SYSTEMS.map((s) => (
            <circle
              key={s.id}
              cx={s.dot.x}
              cy={s.dot.y}
              r={s.id === active ? 7 : 5}
              fill={s.id === active ? "#E06050" : "#fff"}
              stroke="#E06050"
              strokeWidth={2}
              className="cursor-pointer transition-all"
              onClick={() => setActive(s.id)}
            />
          ))}
        </svg>
        <div role="group" aria-label="Body systems" className="flex flex-wrap content-start gap-2 md:mt-4 md:flex-col">
          {BODY_SYSTEMS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === active}
              onClick={() => setActive(s.id)}
              data-testid={`system-${s.id}`}
              className={`min-h-[36px] rounded-full px-3 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050] ${
                s.id === active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
      <div className="min-w-0" aria-live="polite" data-testid="system-panel">
        <h3 className="font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold text-gray-900">{sys.name}</h3>
        <p className="mt-1 text-sm text-gray-700">{sys.summary}</p>
        {items.length ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Related products</p>
            <ProductLinks items={items} />
          </div>
        ) : null}
        <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wider text-gray-400">Research</p>
        <p className="mb-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{sys.studiedNote}</p>
        <div className="space-y-2">
          {sys.studyIds.map((id) => (
            <StudyReference key={id} study={learnStudy(id)} />
          ))}
        </div>
        <div className="mt-4">
          <AskPepitaChip question={sys.ask} />
        </div>
      </div>
    </div>
  );
}
