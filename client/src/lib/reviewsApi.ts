/**
 * Public review reads via GET /api/reviews (Admin SDK on the server).
 * Any failure (no API in local dev, network) → no reviews, so nothing renders.
 */
import { useEffect, useState } from "react";
import type { PublicReview, ReviewSummary } from "@shared/reviews";

let summaryPromise: Promise<Record<string, ReviewSummary>> | null = null;

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("application/json")) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** All per-product summaries (one request per page load, shared by every card). */
export function fetchReviewSummaries(): Promise<Record<string, ReviewSummary>> {
  if (!summaryPromise) {
    summaryPromise = getJson<{ summary?: Record<string, ReviewSummary> }>("/api/reviews").then(
      (b) => b?.summary ?? {}
    );
  }
  return summaryPromise;
}

export function useReviewSummaries(): Record<string, ReviewSummary> {
  const [summaries, setSummaries] = useState<Record<string, ReviewSummary>>({});
  useEffect(() => {
    let cancelled = false;
    fetchReviewSummaries().then((s) => {
      if (!cancelled) setSummaries(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return summaries;
}

export async function fetchProductReviews(
  productId: string
): Promise<{ reviews: PublicReview[]; summary: ReviewSummary }> {
  const body = await getJson<{ reviews?: PublicReview[]; summary?: ReviewSummary }>(
    `/api/reviews?productId=${encodeURIComponent(productId)}`
  );
  return { reviews: body?.reviews ?? [], summary: body?.summary ?? { count: 0, average: 0 } };
}

export async function fetchLatestReviews(): Promise<PublicReview[]> {
  const body = await getJson<{ reviews?: PublicReview[] }>("/api/reviews?latest=1");
  return body?.reviews ?? [];
}
