import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import type { ProtocolGoal, ProtocolSex } from "@/data/protocols";

/** /ai-assistant?product=&goal=&sex= (goal/sex only when chosen). */
export function askPeppyHref(productId: string, goal?: ProtocolGoal, sex?: ProtocolSex): string {
  const params = new URLSearchParams({ product: productId });
  if (goal) params.set("goal", goal);
  if (sex) params.set("sex", sex);
  return `/ai-assistant?${params.toString()}`;
}

export default function AskPeppyButton({
  productId,
  goal,
  sex,
}: {
  productId: string;
  goal?: ProtocolGoal;
  sex?: ProtocolSex;
}) {
  return (
    <Link
      href={askPeppyHref(productId, goal, sex)}
      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:border-gray-400 transition-colors"
      data-testid="ask-peppy"
    >
      <span>
        <span className="font-medium text-gray-900">Not sure?</span> Ask Peppy about this product
      </span>
      <Sparkles className="w-4 h-4 text-orange-600 flex-shrink-0" aria-hidden />
    </Link>
  );
}
