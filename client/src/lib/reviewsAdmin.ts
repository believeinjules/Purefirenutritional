/**
 * Admin review management through /api/admin/reviews (Firebase Admin SDK).
 * The browser never writes Firestore `reviews` directly.
 */
import { adminFetch } from "./adminApi";
import type { ReviewDoc, ReviewStatus } from "@shared/reviews";

export type AdminReview = ReviewDoc & {
  id: string;
  healthClaim: boolean;
  status: ReviewStatus;
  created_at?: string | null;
};
export type ReviewInput = ReviewDoc;

export async function listAdminReviews(): Promise<AdminReview[]> {
  const { reviews } = await adminFetch<{ reviews: AdminReview[] }>("/api/admin/reviews");
  return reviews;
}

export async function createReview(input: ReviewInput): Promise<void> {
  await adminFetch("/api/admin/reviews", { method: "POST", body: JSON.stringify(input) });
}

export async function updateReview(id: string, patch: Partial<ReviewInput>): Promise<void> {
  await adminFetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteReview(id: string): Promise<void> {
  await adminFetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** What the moderation UI needs; swapped for an in-memory mock in the DEV preview. */
export type ReviewAdminApi = {
  list: () => Promise<AdminReview[]>;
  update: (id: string, patch: Partial<ReviewInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const reviewAdminApi: ReviewAdminApi = {
  list: listAdminReviews,
  update: updateReview,
  remove: deleteReview,
};
