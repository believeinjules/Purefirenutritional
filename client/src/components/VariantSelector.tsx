import { useId } from "react";
import { ProductVariant } from "@/data/products";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

/**
 * Size label for a variant: the capsule (or tablet) count only, e.g. "20 Capsules", with no
 * days, months or price per day. Falls back to the variant name when it states no count.
 */
export function variantCountLabel(variant: { name: string }): string {
  const m = variant.name.match(/\b(\d{1,4})\s*(capsules|caps|tablets|tabs)\b/i);
  if (!m) return variant.name;
  return `${m[1]} ${/^tab/i.test(m[2]) ? "Tablets" : "Capsules"}`;
}

/**
 * Product page size picker (Julia, 2026-11-09): a native <select> with a visible label,
 * listing capsule counts only. Changing it calls onVariantChange with the same variant
 * object the old buttons passed, so price, bundles, Add to Cart and the cart line follow.
 * A product with a single size shows that size as plain text.
 */
export default function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
}: VariantSelectorProps) {
  const id = useId();
  if (variants.length === 0) return null;
  if (variants.length === 1) {
    return (
      <p className="text-sm text-gray-700" data-testid="variant-single">
        <span className="font-medium">Size:</span> {variantCountLabel(variants[0])}
      </p>
    );
  }
  const current = selectedVariant ?? variants[0];
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        Size
      </label>
      <select
        id={id}
        data-testid="variant-select"
        value={current.id}
        onChange={(e) => {
          const next = variants.find((v) => v.id === e.target.value);
          if (next) onVariantChange(next);
        }}
        className="block w-full h-12 rounded-lg border-2 border-gray-200 bg-white px-3 text-base font-medium text-gray-900 hover:border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
      >
        {variants.map((variant) => (
          <option key={variant.id} value={variant.id} disabled={!variant.inStock}>
            {variantCountLabel(variant)}
            {!variant.inStock ? " (out of stock)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
