import { EVIDENCE_LABEL, type EvidenceLevel } from "./learnData";

const STYLE: Record<EvidenceLevel, string> = {
  cell: "border-sky-200 bg-sky-50 text-sky-800",
  animal: "border-amber-200 bg-amber-50 text-amber-800",
  human: "border-emerald-200 bg-emerald-50 text-emerald-800",
  review: "border-gray-200 bg-gray-50 text-gray-700",
  insufficient: "border-gray-300 bg-white text-gray-500",
};

/** Evidence label. Deliberately has no "clinically proven" level. */
export default function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${STYLE[level]}`}
      data-evidence={level}
    >
      <span className="sr-only">Evidence level: </span>
      {EVIDENCE_LABEL[level]}
    </span>
  );
}

/** "Proposed mechanism" vs "Shown in …" marker for claims. */
export function ClaimTag({ kind }: { kind: "proposed" | "shown" }) {
  return kind === "proposed" ? (
    <span className="mr-1.5 inline-block rounded border border-dashed border-[#E06050] px-1.5 text-[10px] font-medium uppercase tracking-wider text-[#B8463A]">
      Proposed mechanism
    </span>
  ) : (
    <span className="mr-1.5 inline-block rounded bg-gray-900 px-1.5 text-[10px] font-medium uppercase tracking-wider text-white">
      Research finding
    </span>
  );
}
