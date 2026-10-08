import { Star } from "lucide-react";
import type { ReviewSummary } from "@shared/reviews";

/**
 * Stars + review count from APPROVED reviews only. Renders nothing when there
 * are no approved reviews — never a default or placeholder rating.
 */
export default function RatingStars({
  summary,
  size = 12,
  className = "",
  href,
}: {
  summary?: ReviewSummary | null;
  size?: number;
  className?: string;
  /** Optional anchor (e.g. "#reviews") for the count. */
  href?: string;
}) {
  if (!summary || summary.count < 1 || !(summary.average > 0)) return null;
  const full = Math.round(summary.average);
  const label = `${summary.average.toFixed(1)} out of 5 stars from ${summary.count} review${summary.count === 1 ? "" : "s"}`;
  const count = `(${summary.count})`;
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={label} title={label}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < full ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"}
          aria-hidden
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">
        {summary.average.toFixed(1)}{" "}
        {href ? (
          <a href={href} className="hover:underline">
            {count}
          </a>
        ) : (
          count
        )}
      </span>
    </div>
  );
}
