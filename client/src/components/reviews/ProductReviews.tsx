import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { PenLine } from "lucide-react";
import { reviewsJsonLd, type PublicReview, type ReviewSummary } from "@shared/reviews";
import { fetchProductReviews } from "@/lib/reviewsApi";
import { canonicalUrl, productPath } from "@/lib/seo";
import RatingStars from "@/components/shop/RatingStars";
import ReviewCard from "./ReviewCard";

export const INITIAL_VISIBLE = 3;

/**
 * Compact review section for a product page (id="reviews").
 * Approved reviews only (GET /api/reviews). With none: just a short
 * "Write a review" prompt — no placeholder rating, no JSON-LD.
 * AggregateRating/Review JSON-LD is added only when approved reviews exist;
 * it shares the Product "@id" so it merges with the page's Product node.
 */
export default function ProductReviews({ productId, productName }: { productId: string; productName: string }) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ count: 0, average: 0 });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReviews([]);
    setExpanded(false);
    fetchProductReviews(productId).then((r) => {
      if (cancelled) return;
      setReviews(r.reviews);
      setSummary(r.summary);
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const writeHref = `/review/${productId}`;
  const writeLink = (
    <Link
      href={writeHref}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 underline underline-offset-4 hover:no-underline"
      data-testid="write-review-link"
    >
      <PenLine className="h-4 w-4" aria-hidden /> Write a review
    </Link>
  );

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="mt-12 scroll-mt-24" aria-labelledby="reviews-title" data-testid="product-reviews">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b">
          <h2 id="reviews-title" className="text-lg font-semibold text-gray-900">
            Customer reviews
          </h2>
          {writeLink}
        </div>
        <p className="mt-3 text-sm text-gray-500">No reviews yet. Used {productName}? Share your experience.</p>
      </section>
    );
  }

  const visible = expanded ? reviews : reviews.slice(0, INITIAL_VISIBLE);
  const ld = reviewsJsonLd({ id: productId, name: productName, url: canonicalUrl(productPath(productId)) }, reviews);

  return (
    <section id="reviews" className="mt-12 scroll-mt-24" aria-labelledby="reviews-title" data-testid="product-reviews">
      {ld && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(ld)}</script>
        </Helmet>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 id="reviews-title" className="text-lg font-semibold text-gray-900">
            Customer reviews
          </h2>
          <RatingStars summary={summary} size={14} />
        </div>
        {writeLink}
      </div>
      <div className="grid gap-3 md:grid-cols-3" id="reviews-list">
        {visible.map((r) => (
          <ReviewCard key={r.id} review={r} compact={!expanded} />
        ))}
      </div>
      {reviews.length > INITIAL_VISIBLE && (
        <button
          type="button"
          className="mt-4 text-sm font-medium text-gray-900 underline underline-offset-4 hover:no-underline"
          aria-expanded={expanded}
          aria-controls="reviews-list"
          onClick={() => setExpanded((v) => !v)}
          data-testid="reviews-show-more"
        >
          {expanded ? "Show fewer" : `Show all ${reviews.length} reviews`}
        </button>
      )}
    </section>
  );
}
