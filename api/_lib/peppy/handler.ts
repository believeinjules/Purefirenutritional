/**
 * POST /api/peppy — Peppy 2.0 chat endpoint.
 * Body: { message: string, history?: {role, content}[], productId?: string }
 * Returns PeppyResponse (shared/peppy/types.ts). Never returns a 5xx for answer problems:
 * PubMed/LLM/Firestore failures all degrade to the deterministic curated answer.
 * Logs only mode/topics/latency — never the user's text or IP.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { answerPeppy, type PeppyDeps } from "../../../shared/peppy/respond.js";
import {
  PEPPY_LIMITS,
  type PeppyHistoryTurn,
} from "../../../shared/peppy/types.js";
import { makeLlmCaller, resolveLlmConfig } from "./llm.js";
import { loadPeppyCatalog } from "./products.js";
import { searchPubmed } from "./pubmed.js";
import { checkRateLimit, clientKey } from "./rate-limit.js";

export interface ParsedPeppyRequest {
  message: string;
  history: PeppyHistoryTurn[];
  productId?: string;
}

export function parsePeppyBody(
  body: unknown
): ParsedPeppyRequest | { error: string } {
  let data = body;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return { error: "Invalid JSON" };
    }
  }
  if (!data || typeof data !== "object") return { error: "Invalid body" };
  const rec = data as Record<string, unknown>;
  const message =
    typeof rec.message === "string"
      ? rec.message.replace(/\s+/g, " ").trim()
      : "";
  if (!message) return { error: "Message is required" };
  if (message.length > PEPPY_LIMITS.maxMessageChars)
    return {
      error: `Message is too long (max ${PEPPY_LIMITS.maxMessageChars} characters)`,
    };
  const history: PeppyHistoryTurn[] = Array.isArray(rec.history)
    ? (rec.history as unknown[])
        .filter(
          (h): h is PeppyHistoryTurn =>
            !!h &&
            typeof h === "object" &&
            ((h as PeppyHistoryTurn).role === "user" ||
              (h as PeppyHistoryTurn).role === "assistant") &&
            typeof (h as PeppyHistoryTurn).content === "string"
        )
        .slice(-PEPPY_LIMITS.maxHistoryTurns)
        .map(h => ({
          role: h.role,
          content: h.content.slice(0, PEPPY_LIMITS.maxHistoryChars),
        }))
    : [];
  const productId =
    typeof rec.productId === "string" && /^[a-z0-9-]{1,80}$/.test(rec.productId)
      ? rec.productId
      : undefined;
  return { message, history, productId };
}

export async function handlePeppy(
  req: VercelRequest,
  res: VercelResponse,
  overrides: Partial<PeppyDeps> & {
    env?: Record<string, string | undefined>;
  } = {}
) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const limit = checkRateLimit(
    clientKey(
      req.headers as Record<string, string | string[] | undefined>,
      req.socket?.remoteAddress
    )
  );
  if (!limit.ok) {
    res.setHeader("Retry-After", String(limit.retryAfterSec));
    return res
      .status(429)
      .json({ error: "rate_limited", retryAfterSec: limit.retryAfterSec });
  }

  const parsed = parsePeppyBody(req.body);
  if ("error" in parsed) return res.status(400).json({ error: parsed.error });

  const started = Date.now();
  const catalog = overrides.catalog ?? (await loadPeppyCatalog()).catalog;
  const llmConfig = resolveLlmConfig(overrides.env ?? process.env);
  const deps: PeppyDeps = {
    catalog,
    searchPubmed: overrides.searchPubmed ?? (q => searchPubmed(q)),
    callLlm:
      overrides.callLlm ?? (llmConfig ? makeLlmCaller(llmConfig) : undefined),
  };

  const { response, meta } = await answerPeppy(parsed, deps);
  console.info(
    JSON.stringify({
      evt: "peppy",
      mode: response.mode,
      llm: meta.llm,
      provider: llmConfig?.provider ?? null,
      topics: response.topics,
      sources: response.research.length,
      products: response.products.length,
      pubmedLive: meta.pubmedLive,
      droppedSources: meta.report?.droppedSources.length ?? 0,
      droppedProducts: meta.report?.droppedProducts.length ?? 0,
      ms: Date.now() - started,
    })
  );
  return res.status(200).json(response);
}
