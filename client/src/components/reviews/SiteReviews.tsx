import { useEffect, useState } from "react";
import type { PublicReview } from "@shared/reviews";
import { fetchSiteReviews } from "@/lib/reviewsApi";
import ReviewCard from "./ReviewCard";

/**
 * About page: approved general + service reviews ("buying from Pure Fire").
 * Renders NOTHING until at least one is approved. Never product stars, never
 * JSON-LD, never sample reviews.
 */
export default function SiteReviews({ initial }: { initial?: PublicReview[] }) {
  const [reviews, setReviews] = useState<PublicReview[]>(initial ?? []);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    fetchSiteReviews().then((r) => {
      if (!cancelled) setReviews(r.slice(0, 3));
    });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  if (reviews.length === 0) return null;

  return (
    <section className="py-12 bg-white border-t border-gray-100" aria-labelledby="site-reviews-title" data-testid="site-reviews">
      <div className="max-w-6xl mx-auto px-6">
        <h2 id="site-reviews-title" className="section-label mb-6 text-center">
          What customers say about buying from us
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
