import { useId } from "react";
import { cn } from "@/lib/utils";
import {
  getBundleOffers,
  getStorefrontBundleOffers,
  hasSizePair,
  type BundleOverrideFields,
  type BundleSizingFields,
  type StorefrontBundle,
} from "@shared/bundle-pricing";
import type { ProductFacts } from "@/lib/productFacts";

/** Storefront (20/60 products) or Prime/legacy (1 | 2 | 3). */
export type BundleChoice = 1 | 2 | 3 | StorefrontBundle;

function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function savePct(savingsCents: number, regularCents: number): number {
  if (regularCents <= 0) return 0;
  return Math.round((savingsCents / regularCents) * 100);
}

/** e.g. "1 bottle (60 capsules) — $149.49" or "60 + 20 capsules — $177.49 (save 13%)". */
export function storefrontOptionLabel(opt: { title: string; totalCents: number; savingsCents?: number; regularCents?: number }): string {
  const price = usd(opt.totalCents);
  if (!opt.savingsCents || !opt.regularCents) return `${opt.title} — ${price}`;
  const pct = savePct(opt.savingsCents, opt.regularCents);
  return pct > 0 ? `${opt.title} — ${price} (save ${pct}%)` : `${opt.title} — ${price}`;
}

/**
 * Buy More & Save.
 *
 * 20/60 products (Julia, 2026-11-10): a native <select> only when the 60-cap
 * size is selected. Options are a single 60, 2 × 60, and 60 + 20. Hidden when
 * the 20-cap size is selected, and on single-size products.
 *
 * Prime Peptide pages are frozen and keep the main-branch card picker
 * (2 / 3 bottles of that product's single size).
 */
export default function BundleSelector({
  product,
  singlePriceUSD,
  size,
  facts,
  value,
  onChange,
  legacy = false,
}: {
  product: BundleOverrideFields & BundleSizingFields;
  singlePriceUSD: number | undefined;
  /** Cart size of the selected bottle ("20" | "60"). */
  size?: string;
  facts?: ProductFacts;
  value: BundleChoice;
  onChange: (choice: BundleChoice) => void;
  packageLabel?: string;
  /** Prime Peptide (frozen): main-branch titles, legend and coverage notes. */
  legacy?: boolean;
}) {
  const id = useId();
  if (typeof singlePriceUSD !== "number" || !Number.isFinite(singlePriceUSD)) return null;

  if (legacy) {
    const offers = getBundleOffers(product, singlePriceUSD, { size });
    if (offers.length === 0) return null;
    const singleCents = Math.round(singlePriceUSD * 100);
    const coverage = (bottles: number): string | undefined => {
      if (!facts?.daysPerBottle) return undefined;
      if (facts.bottlesPerCycle && facts.bottlesPerCycle > 1 && bottles === facts.bottlesPerCycle && facts.cycleDays) {
        return `Full ${facts.cycleDays}-day cycle`;
      }
      return `Covers ${facts.daysPerBottle * bottles} days`;
    };
    const options: Array<{
      bottles: 1 | 2 | 3;
      title: string;
      total: number;
      perBottle?: number;
      savings?: number;
    }> = [
      { bottles: 1, title: "1 bottle", total: singleCents },
      ...offers.map((o) => ({
        bottles: o.bottles as 2 | 3,
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

  // Storefront: only when this product has a 20/60 pair and the 60-cap size is selected.
  if (!hasSizePair(product) || size !== "60") return null;
  const offers = getStorefrontBundleOffers(product);
  if (offers.length === 0) return null;
  const singleCents = Math.round(singlePriceUSD * 100);
  const options = [
    { value: 1 as const, label: storefrontOptionLabel({ title: "1 bottle (60 capsules)", totalCents: singleCents }) },
    ...offers.map((o) => ({
      value: o.kind,
      label: storefrontOptionLabel({
        title: o.label,
        totalCents: o.bundleCents,
        savingsCents: o.savingsCents,
        regularCents: o.regularCents,
      }),
    })),
  ];
  const current = options.some((o) => o.value === value) ? value : 1;

  return (
    <div className="space-y-2" data-testid="bundle-selector">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        Buy More & Save
      </label>
      <select
        id={id}
        data-testid="bundle-select"
        value={String(current)}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "1") onChange(1);
          else if (v === "2x60" || v === "60+20") onChange(v);
        }}
        className="block w-full h-12 rounded-lg border-2 border-gray-200 bg-white px-3 text-base font-medium text-gray-900 hover:border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
