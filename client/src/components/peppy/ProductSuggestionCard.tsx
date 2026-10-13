import { Link } from "wouter";
import PreorderBadge from "@/components/PreorderBadge";
import { Button } from "@/components/ui/button";
import { isHiddenProduct } from "@shared/hidden-products";
import type { PeppyProductSuggestion } from "@shared/peppy/types";
import { productPath } from "@/lib/seo";
import {
  AddToCartMini,
  defaultCartLine,
  useStoreProduct,
} from "./ProductPreview";

export default function ProductSuggestionCard({
  suggestion,
}: {
  suggestion: PeppyProductSuggestion;
}) {
  const { product, why, evidenceNote } = suggestion;
  const store = useStoreProduct(product.id);
  if (isHiddenProduct(product)) return null;
  const href = productPath(product.id);
  const image = product.image ?? store?.image;
  const price = (store && defaultCartLine(store).unitUSD) ?? product.priceUSD;

  return (
    <li
      className="flex gap-3 rounded-xl border border-orange-100 bg-white p-3 shadow-sm"
      data-testid="peppy-product"
    >
      <Link
        href={href}
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
            href={href}
            className="font-semibold text-gray-900 hover:underline"
          >
            {product.name}
          </Link>
          <PreorderBadge productId={product.id} />
          <span className="text-sm font-bold text-orange-600">
            ${price.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-700">{why}</p>
        <p className="mt-1 text-xs italic text-gray-500">{evidenceNote}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link href={href}>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              View product
            </Button>
          </Link>
          {product.inStock && <AddToCartMini product={store} />}
        </div>
      </div>
    </li>
  );
}
