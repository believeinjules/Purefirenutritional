import { Star, BadgeCheck } from "lucide-react";
import type { PublicReview } from "@shared/reviews";
import { formatReviewDate } from "./format";

export default function ReviewCard({
  review,
  productLabel,
  compact = false,
}: {
  review: PublicReview;
  productLabel?: string;
  compact?: boolean;
}) {
  const date = formatReviewDate(review.date);
  return (
    <article className="rounded-xl border border-gray-100 bg-white p-5" data-testid="review-card">
      <div className="flex items-center gap-0.5 mb-2" aria-label={`${review.rating} out of 5 stars`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"}`}
            aria-hidden
          />
        ))}
      </div>
      <p className={`text-gray-700 leading-relaxed ${compact ? "text-sm line-clamp-4" : "text-sm"}`}>{review.text}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
        <span className="font-medium text-gray-900">{review.displayName}</span>
        {review.verified && (
          <span className="inline-flex items-center gap-1 text-green-700">
            <BadgeCheck className="w-3.5 h-3.5" aria-hidden /> Verified buyer
          </span>
        )}
        {date && <time dateTime={review.date}>{date}</time>}
        {productLabel && <span>· {productLabel}</span>}
      </div>
    </article>
  );
}
