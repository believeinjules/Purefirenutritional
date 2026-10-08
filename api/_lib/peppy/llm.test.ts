import { describe, expect, it, vi } from "vitest";
import {
  buildRequest,
  extractText,
  makeLlmCaller,
  resolveLlmConfig,
} from "./llm";

const ctx = { system: "sys", user: "usr" };

describe("LLM config", () => {
  it("is off without a key and when explicitly disabled", () => {
    expect(resolveLlmConfig({})).toBeNull();
    expect(
      resolveLlmConfig({ PEPPY_LLM_PROVIDER: "none", OPENAI_API_KEY: "k" })
    ).toBeNull();
    expect(resolveLlmConfig({ PEPPY_LLM_PROVIDER: "xai" })).toBeNull();
  });
  it("picks the provider from env and applies model/timeout overrides", () => {
    expect(resolveLlmConfig({ XAI_API_KEY: "k" })).toMatchObject({
      provider: "xai",
      model: "grok-4.7",
    });
    expect(resolveLlmConfig({ OPENAI_API_KEY: "k" })).toMatchObject({
      provider: "openai",
      model: "gpt-5-mini",
      timeoutMs: 15000,
    });
    expect(
      resolveLlmConfig({
        PEPPY_LLM_PROVIDER: "gemini",
        GEMINI_API_KEY: "g",
        OPENAI_API_KEY: "o",
        PEPPY_MODEL: "gemini-x",
        PEPPY_LLM_TIMEOUT_MS: "8000",
      })
    ).toMatchObject({ provider: "gemini", model: "gemini-x", timeoutMs: 8000 });
  });
});

describe("LLM requests", () => {
  it("builds OpenAI-compatible JSON-mode requests without temperature", () => {
    const req = buildRequest(
      { provider: "openai", model: "gpt-5-mini", apiKey: "k", timeoutMs: 1000 },
      ctx
    );
    expect(req.url).toBe("https://api.openai.com/v1/chat/completions");
    expect(req.headers.Authorization).toBe("Bearer k");
    expect(req.body).toMatchObject({
      response_format: { type: "json_object" },
      reasoning_effort: "low",
    });
    expect(req.body).not.toHaveProperty("temperature");
    const x = buildRequest(
      { provider: "xai", model: "grok-4.7", apiKey: "k", timeoutMs: 1000 },
      ctx
    );
    expect(x.url).toBe("https://api.x.ai/v1/chat/completions");
  });
  it("builds Gemini JSON requests with the key in a header, not the URL", () => {
    const req = buildRequest(
      {
        provider: "gemini",
        model: "gemini-flash-latest",
        apiKey: "secret",
        timeoutMs: 1000,
      },
      ctx
    );
    expect(req.url).not.toContain("secret");
    expect(req.headers["x-goog-api-key"]).toBe("secret");
    expect(req.body).toMatchObject({
      generationConfig: { responseMimeType: "application/json" },
    });
  });
  it("extracts text and throws on HTTP errors", async () => {
    const cfg = {
      provider: "openai" as const,
      model: "m",
      apiKey: "k",
      timeoutMs: 1000,
    };
    expect(
      extractText(cfg, { choices: [{ message: { content: "{}" } }] })
    ).toBe("{}");
    expect(
      extractText(
        { ...cfg, provider: "gemini" },
        { candidates: [{ content: { parts: [{ text: "{" }, { text: "}" }] } }] }
      )
    ).toBe("{}");
    const fail = makeLlmCaller(
      cfg,
      vi.fn(async () => ({ ok: false, status: 401, json: async () => ({}) }))
    );
    await expect(fail(ctx)).rejects.toThrow("LLM HTTP 401");
  });
});
