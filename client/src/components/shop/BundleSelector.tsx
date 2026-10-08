import { cn } from "@/lib/utils";
import { getBundleOffers, type BundleOverrideFields } from "@shared/bundle-pricing";
import type { ProductFacts } from "@/lib/productFacts";

export type BundleChoice = 1 | 2 | 3;

function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Single bottle / 2-bottle / 3-bottle choice. Prices are DISPLAY ONLY and use
 * the same math as checkout (shared/bundle-pricing.ts); the server recomputes
 * the price from the bundle size. Renders nothing if no bundle is offered.
 */
export default function BundleSelector({
  product,
  singlePriceUSD,
  facts,
  value,
  onChange,
}: {
  product: BundleOverrideFields;
  singlePriceUSD: number | undefined;
  facts?: ProductFacts;
  value: BundleChoice;
  onChange: (choice: BundleChoice) => void;
}) {
  if (typeof singlePriceUSD !== "number" || !Number.isFinite(singlePriceUSD)) return null;
  const offers = getBundleOffers(product, singlePriceUSD);
  if (offers.length === 0) return null;

  const singleCents = Math.round(singlePriceUSD * 100);

  /** Coverage note only when dosing data exists. */
  const coverage = (bottles: number): string | undefined => {
    if (!facts?.daysPerBottle) return undefined;
    if (facts.bottlesPerCycle && facts.bottlesPerCycle > 1 && bottles === facts.bottlesPerCycle && facts.cycleDays) {
      return `Full ${facts.cycleDays}-day cycle`;
    }
    return `Covers ${facts.daysPerBottle * bottles} days`;
  };

  const options: Array<{
    bottles: BundleChoice;
    title: string;
    total: number;
    perBottle?: number;
    savings?: number;
  }> = [
    { bottles: 1, title: "1 bottle", total: singleCents },
    ...offers.map((o) => ({
      bottles: o.bottles as BundleChoice,
      title: `${o.bottles} bottles`,
      total: o.bundleCents,
      perBottle: o.bottleCents,
      savings: o.savingsCents,
    })),
  ];

  return (
    <fieldset className="space-y-2" data-testid="bundle-selector">
      <legend className="text-sm font-medium text-gray-700 mb-2">Cycle bundles</legend>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup">
        {options.map((opt) => {
          const selected = value === opt.bottles;
          const note = coverage(opt.bottles);
          return (
            <button
              key={opt.bottles}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.bottles)}
              className={cn(
                "rounded-lg border-2 p-3 text-left transition-all",
                selected ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="text-sm font-medium text-gray-900">{opt.title}</div>
              <div className="text-base font-bold text-gray-900">{usd(opt.total)}</div>
              {opt.perBottle !== undefined && opt.savings !== undefined ? (
                <div className="text-xs text-gray-500 leading-snug">
                  {usd(opt.perBottle)} per bottle · save {usd(opt.savings)}
                </div>
              ) : (
                <div className="text-xs text-gray-500 leading-snug">Single bottle</div>
              )}
              {note && <div className="text-xs text-gray-600 mt-1">{note}</div>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
