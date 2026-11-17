/**
 * Cart / checkout pieces for a claimed Daily Fire code: "Code FIRE10-… applied"
 * with Remove, and the estimated discount line. Stripe computes the exact
 * discount; free shipping still uses the subtotal before the code.
 */
import { Tag, X } from "lucide-react";
import { estimateDiscountCents } from "@shared/daily-fire";
import { removeAppliedCode, useDailyFireCode } from "@/lib/dailyFire";

/** Estimated dollars off the merchandise subtotal for the applied code (0 when none). */
export function useAppliedDiscount(subtotalUSD: number) {
  const { applied } = useDailyFireCode();
  const cents = applied
    ? estimateDiscountCents(Math.round((Number.isFinite(subtotalUSD) ? subtotalUSD : 0) * 100), applied.percentOff)
    : 0;
  return { applied, discountUSD: cents / 100 };
}

export function AppliedCodeNotice({ className = "" }: { className?: string }) {
  const { applied } = useDailyFireCode();
  if (!applied) return null;
  return (
    <div
      className={`rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm ${className}`}
      data-testid="applied-code"
    >
      <p className="flex items-center gap-2 text-gray-800">
        <Tag className="h-4 w-4 shrink-0 text-orange-600" aria-hidden="true" />
        <span>
          Code <strong className="font-mono whitespace-nowrap">{applied.code}</strong> applied ({applied.percentOff}% off)
        </span>
      </p>
      <div className="mt-1 flex justify-end text-xs">
        <button
          type="button"
          onClick={removeAppliedCode}
          className="inline-flex shrink-0 items-center gap-1 rounded px-1 text-gray-600 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label={`Remove code ${applied.code}`}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Remove
        </button>
      </div>
    </div>
  );
}
