import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  getPublicProtocol,
  goalsWithData,
  hasSexSpecific,
  scheduleFor,
  type ProductProtocol,
  type ProtocolGoal,
  type ProtocolSex,
} from "@/data/protocols";

const GOAL_LABEL: Record<ProtocolGoal, { title: string; sub: string }> = {
  preventive: { title: "Preventive", sub: "maintenance" },
  restorative: { title: "Restorative", sub: "regenerative" },
};

export type ProtocolSelection = { goal?: ProtocolGoal; sex?: ProtocolSex };

/**
 * Preventive | Restorative schedule tabs from client/src/data/protocols.ts.
 * Renders NOTHING unless the product has schedule data AND protocolReviewed is
 * true. The Men's/Women's toggle appears only for distinct sex-specific data.
 */
export default function ProtocolTabs({
  productId,
  onSelectionChange,
  protocol: protocolOverride,
}: {
  productId: string;
  onSelectionChange?: (s: ProtocolSelection) => void;
  /** For previews/tests; defaults to the public (reviewed) protocol. */
  protocol?: ProductProtocol | null;
}) {
  const protocol = protocolOverride !== undefined ? protocolOverride : getPublicProtocol(productId);
  const goals = goalsWithData(protocol ?? undefined);
  const [goal, setGoal] = useState<ProtocolGoal | undefined>(goals[0]);
  const [sex, setSex] = useState<ProtocolSex>("women");

  const sexSpecific = protocol && goal ? hasSexSpecific(protocol, goal) : false;

  useEffect(() => {
    setGoal(goals[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    onSelectionChange?.({ goal, sex: sexSpecific ? sex : undefined });
  }, [goal, sex, sexSpecific, onSelectionChange]);

  if (!protocol || !goal || goals.length === 0) return null;
  const schedule = scheduleFor(protocol, goal, sexSpecific ? sex : undefined);

  return (
    <section className="rounded-xl border border-gray-100 p-6" aria-label="Protocol schedules" data-testid="protocol-tabs">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Manufacturer protocol</h2>
      <div className="flex flex-wrap items-center gap-2 mb-4" role="tablist">
        {goals.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={goal === g}
            onClick={() => setGoal(g)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              goal === g ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
            )}
          >
            {GOAL_LABEL[g].title} <span className="opacity-70">({GOAL_LABEL[g].sub})</span>
          </button>
        ))}
        {sexSpecific && (
          <div className="ml-auto flex rounded-full border border-gray-200 p-0.5" role="group" aria-label="Schedule for">
            {(["women", "men"] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sex === s}
                onClick={() => setSex(s)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs",
                  sex === s ? "bg-orange-50 text-orange-800" : "text-gray-500"
                )}
              >
                {s === "women" ? "Women's" : "Men's"}
              </button>
            ))}
          </div>
        )}
      </div>
      {schedule && (
        <div role="tabpanel">
          <dl className="divide-y divide-gray-100 text-sm">
            {schedule.rows
              .filter((r) => r.label.trim() && r.value.trim())
              .map((r) => (
                <div key={r.label} className="flex justify-between gap-4 py-2">
                  <dt className="text-gray-500">{r.label}</dt>
                  <dd className="text-gray-900 text-right">{r.value}</dd>
                </div>
              ))}
          </dl>
          {schedule.note && <p className="mt-3 text-xs text-gray-500">{schedule.note}</p>}
        </div>
      )}
    </section>
  );
}
