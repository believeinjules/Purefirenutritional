import { useId } from "react";
import { cn } from "@/lib/utils";
import { getBundleOffers, type BundleOverrideFields, type BundleSizingFields } from "@shared/bundle-pricing";
import type { ProductFacts } from "@/lib/productFacts";

export type BundleChoice = 1 | 2 | 3;

function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Shopper-facing <option> text, e.g. "1 bottle — $77.99" or
 * "2 bottles — $147.98 (save 5%)". The percent is the bundle savings
 * rounded to the nearest whole number; 0% is omitted rather than shown.
 */
export function bundleOptionLabel(opt: {
  bottles: number;
  totalCents: number;
  savingsCents?: number;
  singleBottleCents: number;
}): string {
  const count = opt.bottles === 1 ? "1 bottle" : `${opt.bottles} bottles`;
  const price = usd(opt.totalCents);
  if (opt.bottles === 1 || !opt.savingsCents) return `${count} — ${price}`;
  const original = opt.singleBottleCents * opt.bottles;
  const pct = original > 0 ? Math.round((opt.savingsCents / original) * 100) : 0;
  return pct > 0 ? `${count} — ${price} (save ${pct}%)` : `${count} — ${price}`;
}

/**
 * Single bottle / 2-bottle / 3-bottle choice. Prices are DISPLAY ONLY and use
 * the same math as checkout (shared/bundle-pricing.ts); the server recomputes
 * the price from the bundle size. Renders nothing if no bundle is offered.
 *
 * Regular pages: a native <select> labeled "Buy More & Save" (Julia, 2026-11-09).
 * Prime Peptide pages are frozen and keep the main-branch card picker.
 */
export default function BundleSelector({
  product,
  singlePriceUSD,
  size,
  facts,
  value,
  onChange,
  packageLabel,
  legacy = false,
}: {
  product: BundleOverrideFields & BundleSizingFields;
  singlePriceUSD: number | undefined;
  /** Cart size of the selected bottle ("20" | "60"); used by the larger-size guard. */
  size?: string;
  facts?: ProductFacts;
  value: BundleChoice;
  onChange: (choice: BundleChoice) => void;
  /**
   * e.g. "20 Capsules". Used only on the frozen Prime Peptide card picker
   * when we want package-count titles; regular pages use "N bottles".
   */
  packageLabel?: string;
  /** Prime Peptide (frozen): main-branch titles, legend and coverage notes. */
  legacy?: boolean;
}) {
  const id = useId();
  if (typeof singlePriceUSD !== "number" || !Number.isFinite(singlePriceUSD)) return null;
  const offers = getBundleOffers(product, singlePriceUSD, { size });
  if (offers.length === 0) return null;

  const singleCents = Math.round(singlePriceUSD * 100);

  // Package selection shows capsule counts and prices only (Julia, 2026-11-09): no
  // "Covers …" / cycle notes. Prime Peptide pages are frozen and keep the main-branch UI.
  const coverage = (bottles: number): string | undefined => {
    if (!legacy || !facts?.daysPerBottle) return undefined;
    if (facts.bottlesPerCycle && facts.bottlesPerCycle > 1 && bottles === facts.bottlesPerCycle && facts.cycleDays) {
      return `Full ${facts.cycleDays}-day cycle`;
    }
    return `Covers ${facts.daysPerBottle * bottles} days`;
  };
  const label = legacy ? undefined : packageLabel;

  const options: Array<{
    bottles: BundleChoice;
    title: string;
    total: number;
    perBottle?: number;
    savings?: number;
  }> = [
    { bottles: 1, title: label ?? "1 bottle", total: singleCents },
    ...offers.map((o) => ({
      bottles: o.bottles as BundleChoice,
      title: label ? `${o.bottles} × ${label}` : `${o.bottles} bottles`,
      total: o.bundleCents,
      perBottle: o.bottleCents,
      savings: o.savingsCents,
    })),
  ];

  if (legacy) {
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

  return (
    <div className="space-y-2" data-testid="bundle-selector">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        Buy More & Save
      </label>
      <select
        id={id}
        data-testid="bundle-select"
        value={String(value)}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (n === 1 || n === 2 || n === 3) onChange(n);
        }}
        className="block w-full h-12 rounded-lg border-2 border-gray-200 bg-white px-3 text-base font-medium text-gray-900 hover:border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
      >
        {options.map((opt) => (
          <option key={opt.bottles} value={opt.bottles}>
            {bundleOptionLabel({
              bottles: opt.bottles,
              totalCents: opt.total,
              savingsCents: opt.savings,
              singleBottleCents: singleCents,
            })}
          </option>
        ))}
      </select>
    </div>
  );
}
