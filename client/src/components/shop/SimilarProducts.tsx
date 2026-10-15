import { ProductGridCard, type ListingProduct } from "@/components/ProductListingCard";
import { getSimilarProducts } from "@/lib/similarProducts";
import { useReviewSummaries } from "@/lib/reviewsApi";

/** "Similar products" row (3–4 cards). Plain links, so it is crawlable in the prerendered HTML. */
export default function SimilarProducts({ productId }: { productId: string }) {
  const reviewSummaries = useReviewSummaries();
  const items = getSimilarProducts(productId, 4);
  if (items.length < 3) return null;
  return (
    <section className="mt-12" aria-labelledby="similar-products-heading" data-testid="similar-products">
      <h2 id="similar-products-heading" className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
        Similar Products
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {items.map((p) => (
          <ProductGridCard
            key={p.id}
            product={p as unknown as ListingProduct}
            reviewSummary={reviewSummaries[p.id]}
          />
        ))}
      </div>
    </section>
  );
}
