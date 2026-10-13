import { AlertTriangle, Info, Siren } from "lucide-react";
import type { SafetyNotice } from "@shared/peppy/types";
import RichText from "./RichText";

const STYLE: Record<
  SafetyNotice["level"],
  { box: string; icon: typeof Info; iconClass: string }
> = {
  urgent: {
    box: "border-red-300 bg-red-50 text-red-900",
    icon: Siren,
    iconClass: "text-red-600",
  },
  caution: {
    box: "border-amber-200 bg-amber-50 text-amber-900",
    icon: AlertTriangle,
    iconClass: "text-amber-600",
  },
  info: {
    box: "border-sky-200 bg-sky-50 text-sky-900",
    icon: Info,
    iconClass: "text-sky-600",
  },
};

export default function SafetyCallout({ notice }: { notice: SafetyNotice }) {
  const s = STYLE[notice.level];
  const Icon = s.icon;
  return (
    <div
      className={`flex gap-2.5 rounded-lg border p-3 text-sm ${s.box}`}
      role={notice.level === "urgent" ? "alert" : undefined}
    >
      <Icon
        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${s.iconClass}`}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="font-semibold">{notice.title}</p>
        <RichText text={notice.body} className="mt-0.5" />
      </div>
    </div>
  );
}
