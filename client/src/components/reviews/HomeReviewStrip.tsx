import { useEffect, useState } from "react";
import { Link } from "wouter";
import type { PublicReview } from "@shared/reviews";
import { fetchLatestReviews } from "@/lib/reviewsApi";
import { getProductById } from "@/data/products";
import ReviewCard from "./ReviewCard";

/**
 * Homepage review strip (directly under the hero).
 * Renders NOTHING — no wrapper, no spacing — until at least one approved,
 * permitted review exists. Never shows sample reviews.
 */
export default function HomeReviewStrip() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchLatestReviews().then((r) => {
      if (!cancelled) setReviews(r.slice(0, 3));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="py-12 bg-white border-b border-gray-100" aria-labelledby="home-reviews-title" data-testid="home-review-strip">
      <div className="max-w-6xl mx-auto px-6">
        <h2 id="home-reviews-title" className="section-label mb-6 text-center">
          From our customers
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((r) => {
            const product = getProductById(r.productId);
            return (
              <Link key={r.id} href={`/products/${r.productId}#reviews`} className="block hover:opacity-90 transition-opacity">
                <ReviewCard review={r} productLabel={product?.name} compact />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
