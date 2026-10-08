/**
 * Browser client for POST /api/peppy. If the endpoint is unreachable, rate-limited or
 * returns something unusable, the same shared engine runs locally with the code catalog
 * (curated answers, no live PubMed/LLM) — the assistant never shows an error.
 */
import type { PeppyRequestBody, PeppyResponse } from "@shared/peppy/types";

const TIMEOUT_MS = 25000;

function isPeppyResponse(v: unknown): v is PeppyResponse {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.summary === "string" &&
    r.summary.length > 0 &&
    Array.isArray(r.sections) &&
    Array.isArray(r.research) &&
    Array.isArray(r.products) &&
    Array.isArray(r.followUps) &&
    Array.isArray(r.suggestions)
  );
}

export async function answerLocally(
  body: PeppyRequestBody
): Promise<PeppyResponse> {
  const [{ answerPeppy }, { buildCatalog }, { products }] = await Promise.all([
    import("@shared/peppy/respond"),
    import("@shared/peppy/catalog"),
    import("@/data/products"),
  ]);
  const catalog = buildCatalog(
    products as unknown as Parameters<typeof buildCatalog>[0]
  );
  const { response } = await answerPeppy(
    { message: body.message, history: body.history, productId: body.productId },
    { catalog }
  );
  return response;
}

export async function askPeppy(body: PeppyRequestBody): Promise<PeppyResponse> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("/api/peppy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (res.ok) {
      const data: unknown = await res.json();
      if (isPeppyResponse(data)) return data;
    }
  } catch {
    // Network error / timeout → local answer below.
  } finally {
    clearTimeout(timer);
  }
  return answerLocally(body);
}
