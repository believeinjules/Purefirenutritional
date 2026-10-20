/**
 * Per-IP rate limit for POST /api/reviews, stored in Firestore
 * `review_rate_limits/{hash}` so it holds across function instances.
 * IPs are hashed (salted), never stored raw. Browsers cannot read/write
 * this collection (firestore.rules default deny).
 */
import { createHash } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";

export const REVIEW_RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 5 } as const;

export function reviewClientKey(headers: Record<string, string | string[] | undefined>): string {
  const fwd = headers["x-forwarded-for"];
  const raw =
    (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim() || (headers["x-real-ip"] as string | undefined) || "unknown";
  return createHash("sha256").update(`pf-review:${raw}`).digest("hex").slice(0, 32);
}

/** Pure window check: keeps recent hits, says whether one more is allowed. */
export function nextHits(hits: unknown, now: number): { ok: boolean; hits: number[] } {
  const since = now - REVIEW_RATE_LIMIT.windowMs;
  const recent = (Array.isArray(hits) ? hits : []).filter((t): t is number => typeof t === "number" && t > since);
  if (recent.length >= REVIEW_RATE_LIMIT.max) return { ok: false, hits: recent };
  return { ok: true, hits: [...recent, now] };
}

/** Records a hit; false when the IP is over the limit. Fails open if Firestore errors. */
export async function takeReviewSlot(db: Firestore, key: string, now = Date.now()): Promise<boolean> {
  const ref = db.collection("review_rate_limits").doc(key);
  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const r = nextHits(snap.exists ? snap.get("hits") : [], now);
      if (r.ok) tx.set(ref, { hits: r.hits, updatedAt: new Date(now) });
      return r.ok;
    });
  } catch (err) {
    console.error("[reviews] rate-limit check failed:", err);
    return true;
  }
}
