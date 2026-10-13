/**
 * LLM provider adapter (plain fetch, no SDK). Configured entirely by env vars:
 *   PEPPY_LLM_PROVIDER  openai | xai | gemini | none   (default: first provider with a key set)
 *   PEPPY_MODEL         model id override (defaults below)
 *   OPENAI_API_KEY / XAI_API_KEY / GEMINI_API_KEY
 *   PEPPY_LLM_TIMEOUT_MS (default 15000)
 * No key → null → the endpoint serves the deterministic answer (never an error).
 */
import type { LlmContext } from "../../../shared/peppy/prompt.js";

export type LlmProvider = "openai" | "xai" | "gemini";

export interface LlmConfig {
  provider: LlmProvider;
  model: string;
  apiKey: string;
  timeoutMs: number;
}

export const DEFAULT_MODELS: Record<LlmProvider, string> = {
  openai: "gpt-5-mini",
  xai: "grok-4.7",
  gemini: "gemini-flash-latest",
};

const KEY_ENV: Record<LlmProvider, string> = {
  openai: "OPENAI_API_KEY",
  xai: "XAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};

export function resolveLlmConfig(
  env: Record<string, string | undefined> = process.env
): LlmConfig | null {
  const requested = (env.PEPPY_LLM_PROVIDER ?? "").trim().toLowerCase();
  if (requested === "none" || requested === "off") return null;
  const order: LlmProvider[] = ["openai", "xai", "gemini"];
  const provider = (order as string[]).includes(requested)
    ? (requested as LlmProvider)
    : order.find(p => !!env[KEY_ENV[p]]?.trim());
  if (!provider) return null;
  const apiKey = env[KEY_ENV[provider]]?.trim();
  if (!apiKey) return null;
  const timeout = Number(env.PEPPY_LLM_TIMEOUT_MS);
  return {
    provider,
    model: env.PEPPY_MODEL?.trim() || DEFAULT_MODELS[provider],
    apiKey,
    timeoutMs:
      Number.isFinite(timeout) && timeout >= 2000 && timeout <= 25000
        ? timeout
        : 15000,
  };
}

type FetchLike = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
    signal: AbortSignal;
  }
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

/** Reasoning models are slow at default effort; keep it low for a chat widget. */
function reasoningParams(cfg: LlmConfig): Record<string, unknown> {
  if (cfg.provider === "openai" && /^(gpt-5|gpt-6|o\d)/.test(cfg.model))
    return { reasoning_effort: "low" };
  if (cfg.provider === "xai" && /^grok-4\.(?:[5-9]|\d{2})/.test(cfg.model))
    return { reasoning_effort: "low" };
  return {};
}

export function buildRequest(
  cfg: LlmConfig,
  ctx: LlmContext
): { url: string; headers: Record<string, string>; body: unknown } {
  if (cfg.provider === "gemini") {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": cfg.apiKey,
      },
      body: {
        systemInstruction: { parts: [{ text: ctx.system }] },
        contents: [{ role: "user", parts: [{ text: ctx.user }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 2048,
        },
      },
    };
  }
  const base =
    cfg.provider === "xai"
      ? "https://api.x.ai/v1"
      : "https://api.openai.com/v1";
  return {
    url: `${base}/chat/completions`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: {
      model: cfg.model,
      messages: [
        { role: "system", content: ctx.system },
        { role: "user", content: ctx.user },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 3000,
      ...reasoningParams(cfg),
    },
  };
}

export function extractText(cfg: LlmConfig, payload: unknown): string {
  if (cfg.provider === "gemini") {
    const parts = (
      payload as {
        candidates?: { content?: { parts?: { text?: unknown }[] } }[];
      }
    )?.candidates?.[0]?.content?.parts;
    return Array.isArray(parts)
      ? parts.map(p => (typeof p?.text === "string" ? p.text : "")).join("")
      : "";
  }
  const content = (
    payload as { choices?: { message?: { content?: unknown } }[] }
  )?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

export function makeLlmCaller(
  cfg: LlmConfig,
  fetchImpl: FetchLike = globalThis.fetch as unknown as FetchLike
) {
  return async (ctx: LlmContext): Promise<string> => {
    const req = buildRequest(cfg, ctx);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs);
    try {
      const res = await fetchImpl(req.url, {
        method: "POST",
        headers: req.headers,
        body: JSON.stringify(req.body),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
      const text = extractText(cfg, await res.json());
      if (!text) throw new Error("LLM returned no text");
      return text;
    } finally {
      clearTimeout(timer);
    }
  };
}
