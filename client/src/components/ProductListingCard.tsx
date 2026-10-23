import { Link } from "wouter";
import QuickAddToCart from "@/components/QuickAddToCart";
import RatingStars from "@/components/shop/RatingStars";
import { getProductFacts } from "@/lib/productFacts";
import PreorderBadge from "@/components/PreorderBadge";
import { FULFILLMENT_CARD_LABEL, resolveFulfillment } from "@shared/fulfillment";
import { responsiveImage, fetchPriority } from "@/lib/responsiveImage";
import type { ReviewSummary } from "@shared/reviews";

export type ListingProduct = {
  id: string;
  name: string;
  description?: string;
  category: string;
  priceUSD: number;
  priceEUR: number;
  rating?: number;
  sizes?: number;
  image?: string;
  imageAlt?: string;
  benefits?: string[];
  in_stock?: boolean;
  fulfillment?: string;
  variants?: Array<{
    id: string;
    name: string;
    priceUSD: number;
    priceEUR: number;
    inStock?: boolean;
  }>;
};

const getCategoryAccent = (category: string) => {
  switch (category) {
    case "PEPTIDE BIOREGULATORS":
      return {
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        dot: "bg-orange-400",
        pill: "bg-orange-100 text-orange-700",
        glow: "from-orange-400 to-rose-400",
      };
    case "ANTI AGING-LONGEVITY":
      return {
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        dot: "bg-purple-400",
        pill: "bg-purple-100 text-purple-700",
        glow: "from-purple-400 to-indigo-400",
      };
    case "NUTRITIONAL SUPPLEMENTS":
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-400",
        pill: "bg-emerald-100 text-emerald-700",
        glow: "from-emerald-400 to-teal-400",
      };
    default:
      return {
        badge: "bg-gray-50 text-gray-700 border-gray-200",
        dot: "bg-gray-400",
        pill: "bg-gray-100 text-gray-700",
        glow: "from-gray-400 to-gray-500",
      };
  }
};

const getCategoryShort = (category: string) => {
  switch (category) {
    case "PEPTIDE BIOREGULATORS":
      return "Peptide";
    case "ANTI AGING-LONGEVITY":
      return "Anti-Aging";
    case "NUTRITIONAL SUPPLEMENTS":
      return "Supplement";
    default:
      return category;
  }
};

function FlipImage({ product, eager = false }: { product: ListingProduct; eager?: boolean }) {
  const accent = getCategoryAccent(product.category);
  const detailHref = `/products/${product.id}`;

  return (
    <Link
      href={detailHref}
      className="block product-flip aspect-square rounded-t-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
      aria-label={`View details for ${product.name}`}
    >
      <div className="product-flip-inner aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Front — product image */}
        <div className="product-flip-face product-flip-front bg-gradient-to-br from-gray-50 to-gray-100">
          {product.image ? (
            <img
              {...responsiveImage(product.image, "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw", 640)}
              alt={product.imageAlt || product.name}
              width={400}
              height={400}
              className="w-full h-full object-contain p-4"
              loading={eager ? "eager" : "lazy"}
              {...fetchPriority(eager)}
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-20" aria-hidden>
                🔬
              </span>
            </div>
          )}
          <span
            className={`absolute top-3 left-3 w-2.5 h-2.5 rounded-full ${accent.dot} shadow-sm`}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 pointer-events-none">
            <span className="text-white text-xs font-medium tracking-wide" aria-hidden="true">
              Hover for details
            </span>
          </div>
        </div>

        {/* Back — info face (CSS 3D flip) */}
        <div
          className={`product-flip-face product-flip-back bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex flex-col justify-center`}
          aria-hidden="true"
        >
          <span
            className={`text-xs font-bold uppercase tracking-widest ${accent.pill} px-2 py-0.5 rounded-full w-fit mb-2`}
          >
            {getCategoryShort(product.category)}
          </span>
          <p className="text-white text-xs font-semibold leading-snug mb-2 line-clamp-2">
            {product.name}
          </p>
          <p className="text-gray-300 text-xs leading-relaxed line-clamp-4 mb-3">
            {product.description}
          </p>
          {product.benefits && product.benefits.length > 0 && (
            <ul className="space-y-1">
              {product.benefits.slice(0, 3).map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-gray-200"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 bg-gradient-to-r ${accent.glow}`}
                  />
                  <span className="line-clamp-1">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Bottle size · cycle coverage · cost per day — each part only when the data
 * exists (variant names + client/src/data/dosing.ts). Renders nothing otherwise.
 */
function ProductFactsLine({ product, className = "" }: { product: ListingProduct; className?: string }) {
  const firstVariant = product.variants?.find((v) => v.inStock !== false) ?? product.variants?.[0];
  const facts = getProductFacts(product, undefined, firstVariant?.priceUSD ?? product.priceUSD);
  const parts = [
    facts.sizeLabel,
    facts.coverageLabel,
    typeof facts.costPerDayUSD === "number" ? `$${facts.costPerDayUSD.toFixed(2)}/day` : undefined,
  ].filter((p): p is string => Boolean(p));
  if (parts.length === 0) return null;
  return (
    <p className={`text-xs text-gray-500 leading-snug ${className}`} data-testid="product-facts">
      {parts.join(" · ")}
    </p>
  );
}

/** Small "In stock" tag for in-stock items; nothing for 2-week or out-of-stock items. */
function StockTag({ product, className = "" }: { product: ListingProduct; className?: string }) {
  if (product.in_stock === false) return null;
  if (product.variants?.length && product.variants.every((v) => v.inStock === false)) return null;
  const label = FULFILLMENT_CARD_LABEL[resolveFulfillment(product.id, product.fulfillment)];
  if (!label) return null;
  return (
    <p className={`text-xs font-medium text-gray-700 ${className}`} data-testid="stock-tag">
      {label}
    </p>
  );
}

/** Grid card: image flips on hover; title/price/ATC stay visible underneath. */
export function ProductGridCard({
  product,
  reviewSummary,
  eager = false,
}: {
  product: ListingProduct;
  reviewSummary?: ReviewSummary;
  /** First visible cards: load eagerly with high priority (LCP candidates). */
  eager?: boolean;
}) {
  const accent = getCategoryAccent(product.category);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <FlipImage product={product} eager={eager} />

      {/* Always-visible info under the image */}
      <div className="p-4 flex flex-col flex-1">
        <span
          className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${accent.pill} px-2 py-0.5 rounded-full w-fit`}
        >
          {getCategoryShort(product.category)}
        </span>
        <PreorderBadge productId={product.id} className="mb-1.5 w-fit" />
        <Link href={`/products/${product.id}`} className="block py-1 mb-0.5">
          <h3 className="font-semibold text-sm leading-snug hover:text-orange-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {product.description}
          </p>
        )}

        <ProductFactsLine product={product} className="mb-2" />
        <StockTag product={product} className="-mt-1 mb-2" />
        {/* Stars only from approved reviews; nothing when there are none. */}
        <RatingStars summary={reviewSummary} className="mb-3" />

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50 gap-2">
          <div>
            <div className="text-base font-bold text-gray-900">
              ${product.priceUSD.toFixed(2)}
            </div>
          </div>
          <QuickAddToCart product={product} compact label="Add" />
        </div>
      </div>
    </div>
  );
}

/** List row: no flip; same ATC size-chooser behavior. */
export function ProductListRow({
  product,
  reviewSummary,
}: {
  product: ListingProduct;
  reviewSummary?: ReviewSummary;
}) {
  const accent = getCategoryAccent(product.category);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 flex gap-5 p-4 items-start">
      <Link
        href={`/products/${product.id}`}
        className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xl"
        aria-label={`View details for ${product.name}`}
      >
        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.image ? (
            <img
              {...responsiveImage(product.image, "96px", 320)}
              alt={product.imageAlt || product.name}
              width={96}
              height={96}
              className="w-full h-full object-contain p-2"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl opacity-20" aria-hidden>
                🔬
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span
              className={`text-xs font-bold uppercase tracking-widest ${accent.pill} px-2 py-0.5 rounded-full`}
            >
              {getCategoryShort(product.category)}
            </span>
            <PreorderBadge productId={product.id} className="ml-2" />
            <Link href={`/products/${product.id}`} className="block py-1 mt-0.5">
              <h3 className="font-semibold text-sm hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
              {product.description}
            </p>
            <ProductFactsLine product={product} className="mb-2" />
            <StockTag product={product} className="-mt-1 mb-2" />
            {product.benefits && product.benefits.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.benefits.slice(0, 3).map((b, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-base font-bold text-gray-900">
                ${product.priceUSD.toFixed(2)}
              </div>
            </div>
            <RatingStars summary={reviewSummary} />
            <div className="flex gap-2">
              <Link href={`/products/${product.id}`}>
                <button
                  type="button"
                  className="min-h-[44px] px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-gray-400 transition-colors"
                >
                  Details
                </button>
              </Link>
              <QuickAddToCart product={product} compact label="Add" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
