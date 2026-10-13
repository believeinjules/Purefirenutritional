import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { isHiddenProduct } from "@shared/hidden-products";
import { getCartLineUnitUSD } from "@shared/product-prices";
import type { PeppyProduct } from "@shared/peppy/types";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useCart } from "@/contexts/CartContext";
import { getProductById, type Product } from "@/data/products";
import { fetchProductById } from "@/lib/productsStorage";
import { getDefaultCartSize } from "@/lib/productSize";
import { productPath } from "@/lib/seo";

const storeCache = new Map<string, Promise<Product | null>>();

/** The storefront product (Firestore, products.ts fallback) — same source as product pages. */
export function useStoreProduct(id: string): Product | null {
  const [product, setProduct] = useState<Product | null>(() =>
    isHiddenProduct({ id }) ? null : (getProductById(id) ?? null)
  );
  useEffect(() => {
    if (isHiddenProduct({ id })) return;
    let live = true;
    let request = storeCache.get(id);
    if (!request) {
      request = fetchProductById(id).catch(() => getProductById(id) ?? null);
      storeCache.set(id, request);
    }
    request.then(p => {
      if (live) setProduct(p && !isHiddenProduct(p) ? p : null);
    });
    return () => {
      live = false;
    };
  }, [id]);
  return product;
}

/** Default size, quantity 1, single bottle; priced exactly as the cart prices it. */
export function defaultCartLine(product: Product) {
  const size = getDefaultCartSize(product);
  return { size, unitUSD: getCartLineUnitUSD(product, size) };
}

export function AddToCartMini({
  product,
  className = "",
}: {
  product: Product | null;
  className?: string;
}) {
  const { addToCart } = useCart();
  if (!product || isHiddenProduct(product)) return null;
  return (
    <button
      type="button"
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        const { size, unitUSD } = defaultCartLine(product);
        if (unitUSD === undefined) {
          toast.error(
            "This product's price is unavailable, so it can't be added."
          );
          return;
        }
        addToCart(product, 1, size);
        toast.success(`${product.name} added to cart`);
      }}
      aria-label={`Add ${product.name} to cart`}
      className={`inline-flex h-8 items-center gap-1.5 rounded-xl bg-gray-900 px-3 text-xs font-medium text-white transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${className}`}
    >
      <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
      Add to cart
    </button>
  );
}

function PreviewCard({
  product,
  fallback,
}: {
  product: Product | null;
  fallback: PeppyProduct;
}) {
  const name = product?.name ?? fallback.name;
  const image = product?.image ?? fallback.image;
  const price = product ? defaultCartLine(product).unitUSD : fallback.priceUSD;
  return (
    <div className="flex gap-3" data-testid="pepita-product-preview">
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
        {image && (
          <img
            src={image}
            alt=""
            className="h-full w-full object-contain"
            loading="lazy"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{name}</p>
        {typeof price === "number" && (
          <p className="text-sm font-bold text-orange-600">
            ${price.toFixed(2)}
          </p>
        )}
        <AddToCartMini product={product} className="mt-1.5" />
      </div>
    </div>
  );
}

/**
 * A product named in an answer: link to its page with a hover/focus preview card.
 * Hidden products render as plain text.
 */
export function ProductMention({
  product,
  children,
}: {
  product: PeppyProduct;
  children: ReactNode;
}) {
  const store = useStoreProduct(product.id);
  if (isHiddenProduct(product)) return <>{children}</>;
  return (
    <HoverCard openDelay={250} closeDelay={150}>
      <HoverCardTrigger asChild>
        <Link
          href={productPath(product.id)}
          className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-2 hover:decoration-orange-600 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          data-testid="pepita-product-link"
        >
          {children}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-72 max-w-[calc(100vw-2rem)] border-orange-100 bg-white"
      >
        <PreviewCard product={store} fallback={product} />
      </HoverCardContent>
    </HoverCard>
  );
}
