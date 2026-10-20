/**
 * DEV ONLY (`vite dev`): Admin → Reviews moderation UI on in-memory MOCK
 * data, for local screenshots without Firebase/admin auth. Not routed in
 * production builds (App.tsx checks import.meta.env.DEV).
 */
import { useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ReviewModeration from "@/components/reviews/ReviewModeration";
import { hasHealthClaim } from "@shared/reviews";
import type { AdminReview, ReviewAdminApi } from "@/lib/reviewsAdmin";

const MOCK: AdminReview[] = [
  { id: "m1", productId: "endoluten", firstName: "Maria", lastInitial: "K", date: "2026-10-14", rating: 5, text: "Easy to take and arrived quickly. I've been using it for six weeks as part of my evening routine.", verified: false, approved: false, permission: true, status: "pending", email: "maria@example.com", source: "customer-form", usedProduct: true, healthClaim: false },
  { id: "m2", productId: "cartalax", firstName: "Tom", lastInitial: "", date: "2026-10-13", rating: 4, text: "Good quality, packaging was great. It cured my joint disease in a week!", verified: false, approved: false, permission: true, status: "pending", email: "", source: "customer-form", usedProduct: true, healthClaim: true },
  { id: "m3", productId: "endoluten", firstName: "Anna", lastInitial: "S", date: "2026-10-01", rating: 5, text: "Second order. Customer service answered all my questions.", verified: true, approved: true, permission: true, status: "approved", source: "customer-form", usedProduct: true, healthClaim: false },
  { id: "m5", productId: "", kind: "service", firstName: "Lena", lastInitial: "R", date: "2026-10-14", rating: 0, text: "Julia answered every question before I ordered and the package came in three days.", verified: false, approved: false, permission: true, status: "pending", email: "lena@example.com", source: "customer-form", tag: null, healthClaim: false },
  { id: "m6", productId: "", kind: "general", firstName: "Sam", lastInitial: "P", date: "2026-10-12", rating: 5, text: "Clear information on the site and careful packaging.", verified: false, approved: false, permission: true, status: "pending", email: "", source: "customer-form", tag: "purchased-through-julia", healthClaim: false },
  { id: "m4", productId: "vladonix", firstName: "Spam", lastInitial: "", date: "2026-09-29", rating: 1, text: "Buy cheap followers at example dot com", verified: false, approved: false, permission: true, status: "rejected", source: "customer-form", usedProduct: true, healthClaim: false },
];

function mockApi(): ReviewAdminApi {
  let data = MOCK.map((r) => ({ ...r }));
  return {
    list: async () => data.map((r) => ({ ...r })),
    update: async (id, patch) => {
      data = data.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...patch } as AdminReview;
        if (patch.status) next.approved = patch.status === "approved";
        next.healthClaim = hasHealthClaim(next.text);
        return next;
      });
    },
    remove: async (id) => {
      data = data.filter((r) => r.id !== id);
    },
  };
}

export default function DevReviewsAdminPreview() {
  const api = useMemo(mockApi, []);
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 space-y-4">
          <p className="rounded-md bg-yellow-300 px-3 py-2 text-sm font-bold text-black">
            LOCAL DEV PREVIEW — MOCK DATA (not in production builds)
          </p>
          <h1 className="text-3xl font-bold">Admin → Reviews</h1>
          <ReviewModeration api={api} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
