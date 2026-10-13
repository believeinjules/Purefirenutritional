import { Link } from "wouter";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { getProductById, type Product } from "@/data/products";
import type { PeppyProductSuggestion } from "@shared/peppy/types";

/** Prefer product default/variant capsule count for cart size. */
export function getDefaultCartSize(product: Product): "20" | "60" {
  const variant =
    product.variants?.find(v => v.inStock) ?? product.variants?.[0];
  if (variant) {
    if (variant.id === "60-count" || /\b60\b/.test(variant.name)) return "60";
    if (variant.id === "20-count" || /\b20\b/.test(variant.name)) return "20";
  }
  return "20";
}

export default function ProductSuggestionCard({
  suggestion,
}: {
  suggestion: PeppyProductSuggestion;
}) {
  const { product, why, evidenceNote } = suggestion;
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const cartProduct = getProductById(product.id);
  const image = product.image ?? cartProduct?.image;

  return (
    <li
      className="flex gap-3 rounded-xl border border-orange-100 bg-white p-3 shadow-sm"
      data-testid="peppy-product"
    >
      <Link
        href={`/products/${product.id}`}
        className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100"
        aria-hidden="true"
        tabIndex={-1}
      >
        {image && (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
            onError={e => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <Link
            href={`/products/${product.id}`}
            className="font-semibold text-gray-900 hover:underline"
          >
            {product.name}
          </Link>
          <span className="text-sm font-bold text-orange-600">
            ${product.priceUSD.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-700">{why}</p>
        <p className="mt-1 text-xs italic text-gray-500">{evidenceNote}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link href={`/products/${product.id}`}>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              View product
            </Button>
          </Link>
          {cartProduct && product.inStock && (
            <Button
              size="sm"
              className="h-8 bg-green-600 text-xs hover:bg-green-700"
              onClick={() => {
                addToCart(cartProduct, 1, getDefaultCartSize(cartProduct));
                setAdded(true);
              }}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <Check className="mr-1 h-3 w-3" aria-hidden="true" />
              ) : (
                <ShoppingCart className="mr-1 h-3 w-3" aria-hidden="true" />
              )}
              {added ? "Added" : "Add to Cart"}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
