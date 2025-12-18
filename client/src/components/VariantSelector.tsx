import { ProductVariant } from "@/data/products";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

export default function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
}: VariantSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Select Size / Format:
      </label>
      <div className="grid grid-cols-1 gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onVariantChange(variant)}
            disabled={!variant.inStock}
            className={cn(
              "relative flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left",
              selectedVariant.id === variant.id && variant.inStock
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300",
              !variant.inStock && "opacity-60 cursor-not-allowed bg-gray-50"
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{variant.name}</span>
                {!variant.inStock && (
                  <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                    OUT OF STOCK
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-orange-600">
                ${variant.priceUSD.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                €{variant.priceEUR.toFixed(2)}
              </div>
            </div>
            {selectedVariant.id === variant.id && variant.inStock && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
