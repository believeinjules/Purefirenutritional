/**
 * Admin review management through /api/admin/reviews (Firebase Admin SDK).
 * The browser never writes Firestore `reviews` directly.
 */
import { adminFetch } from "./adminApi";
import type { ReviewDoc } from "@shared/reviews";

export type AdminReview = ReviewDoc & { id: string; healthClaim: boolean };
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
