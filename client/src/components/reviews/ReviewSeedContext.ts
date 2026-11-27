import { createContext } from "react";
import type { PublicReview } from "@shared/reviews";

/**
 * Approved reviews for the product page being prerendered.
 * Null in the browser; the page then loads reviews from GET /api/reviews.
 */
export const ReviewSeedContext = createContext<PublicReview[] | null>(null);
