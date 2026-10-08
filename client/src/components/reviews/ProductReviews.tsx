import { useEffect, useState } from "react";
import type { PublicReview, ReviewSummary } from "@shared/reviews";
import { fetchProductReviews } from "@/lib/reviewsApi";
import RatingStars from "@/components/shop/RatingStars";
import ReviewCard from "./ReviewCard";

/**
 * Full review section for a product page (id="reviews").
 * Approved reviews only; renders NOTHING when there are none.
 */
export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ count: 0, average: 0 });

  useEffect(() => {
    let cancelled = false;
    setReviews([]);
    fetchProductReviews(productId).then((r) => {
      if (cancelled) return;
      setReviews(r.reviews);
      setSummary(r.summary);
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="mt-12 scroll-mt-24" aria-labelledby="reviews-title" data-testid="product-reviews">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5 pb-2 border-b">
        <h2 id="reviews-title" className="text-lg font-semibold text-gray-900">
          Customer reviews
        </h2>
        <RatingStars summary={summary} size={14} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </section>
  );
}
