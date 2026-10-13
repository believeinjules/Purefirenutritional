/**
 * Best-effort per-IP rate limit (per warm function instance — Vercel may run several, so
 * this blunts abuse rather than guaranteeing a global cap). IPs are hashed, never stored raw.
 */
import { createHash } from "node:crypto";

export const RATE_LIMIT = { windowMs: 5 * 60 * 1000, max: 20 } as const;
const buckets = new Map<string, number[]>();

export function clientKey(
  headers: Record<string, string | string[] | undefined>,
  fallback = "unknown"
): string {
  const fwd = headers["x-forwarded-for"];
  const raw =
    (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim() ||
    (headers["x-real-ip"] as string | undefined) ||
    fallback;
  return createHash("sha256").update(`peppy:${raw}`).digest("hex").slice(0, 16);
}

export function checkRateLimit(
  key: string,
  now = Date.now()
): { ok: boolean; retryAfterSec: number } {
  const since = now - RATE_LIMIT.windowMs;
  const hits = (buckets.get(key) ?? []).filter(t => t > since);
  if (hits.length >= RATE_LIMIT.max) {
    buckets.set(key, hits);
    return {
      ok: false,
      retryAfterSec: Math.max(
        1,
        Math.ceil((hits[0] + RATE_LIMIT.windowMs - now) / 1000)
      ),
    };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of Array.from(buckets.entries()))
      if (!v.some(t => t > since)) buckets.delete(k);
  }
  return { ok: true, retryAfterSec: 0 };
}

export function resetRateLimit(): void {
  buckets.clear();
}
