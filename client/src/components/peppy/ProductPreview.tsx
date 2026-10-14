import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { isHiddenProduct } from "@shared/hidden-products";
import { getCartLineUnitUSD } from "@shared/product-prices";
import type { PeppyProduct } from "@shared/peppy/types";
import InlinePreview from "./InlinePreview";
import { FAMILY_LABEL, firstSentence } from "@/lib/pepitaPreview";
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

function ZoomCard({
  product,
  fallback,
}: {
  product: Product | null;
  fallback: PeppyProduct;
}) {
  const name = product?.name ?? fallback.name;
  const image = product?.image ?? fallback.image;
  const price = product ? defaultCartLine(product).unitUSD : fallback.priceUSD;
  // Claim-filtered catalog summary (never the raw store description).
  const line = firstSentence(fallback.summary, 140);
  return (
    <div className="space-y-2" data-testid="pepita-product-preview">
      <div className="flex h-44 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
        {image && (
          <img src={image} alt={name} className="h-full w-full object-contain p-2" loading="lazy" />
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold leading-snug text-gray-900">{name}</p>
        {typeof price === "number" && (
          <p className="text-sm font-bold text-orange-600">${price.toFixed(2)}</p>
        )}
      </div>
      {line && <p className="text-xs leading-snug text-gray-600">{line}</p>}
      <div className="flex items-center gap-3 pt-0.5">
        <AddToCartMini product={product} />
        <Link
          href={productPath(fallback.id)}
          className="text-xs font-semibold text-orange-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          See details
        </Link>
      </div>
    </div>
  );
}

/**
 * A product named in an answer: link to its page with a hover/focus/tap zoom preview.
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
    <InlinePreview
      label={`${product.name} preview`}
      className="w-64"
      content={<ZoomCard product={store} fallback={product} />}
    >
      <Link
        href={productPath(product.id)}
        className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-2 hover:decoration-orange-600 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        data-testid="pepita-product-link"
      >
        {children}
      </Link>
    </InlinePreview>
  );
}

/** Row of tappable product thumbnails under the answer (image + name + price, whole tile links). */
export function ProductThumbRow({ products }: { products: readonly PeppyProduct[] }) {
  const shown = products.filter(p => !isHiddenProduct(p));
  if (!shown.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-gray-500">
        Products with these ingredients (optional)
      </p>
      <ul className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        {shown.map(p => (
          <li key={p.id} className="min-w-0 sm:w-32">
            <ProductThumb product={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductThumb({ product }: { product: PeppyProduct }) {
  const store = useStoreProduct(product.id);
  const image = store?.image ?? product.image;
  const price = store ? defaultCartLine(store).unitUSD : product.priceUSD;
  return (
    <Link
      href={productPath(product.id)}
      data-testid="pepita-product-thumb"
      className="group block h-full rounded-xl border border-gray-200 bg-white p-2 transition hover:border-orange-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
        {image && (
          <img src={image} alt="" className="h-full w-full object-contain p-1 transition-transform group-hover:scale-105" loading="lazy" />
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-tight text-gray-900 [overflow-wrap:anywhere]">
        {store?.name ?? product.name}
      </p>
      {typeof price === "number" && (
        <p className="text-xs font-bold text-orange-600">${price.toFixed(2)}</p>
      )}
    </Link>
  );
}

/** v6: compact product card (image, name, tissue-target line; links to the product page). No price push. */
export function ProductCardSmall({
  product,
  tissue,
  family,
}: {
  product: PeppyProduct;
  tissue?: string;
  family?: string;
}) {
  const store = useStoreProduct(product.id);
  if (isHiddenProduct(product)) return null;
  const image = store?.image ?? product.image;
  const name = store?.name ?? product.name;
  const familyLabel = family ? FAMILY_LABEL[family] : undefined;
  return (
    <Link
      href={productPath(product.id)}
      data-testid="pepita-product-card"
      data-product-id={product.id}
      className="flex h-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-2 transition hover:border-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    >
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
        {image && <img src={image} alt="" className="h-full w-full object-contain p-0.5" loading="lazy" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-gray-900">{name}</span>
        {(tissue || familyLabel) && (
          <span className="block text-xs leading-snug text-gray-600 line-clamp-2">{tissue ?? familyLabel}</span>
        )}
        <span className="block text-xs text-orange-700">View product →</span>
      </span>
    </Link>
  );
}
