import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePeppy, parsePeppyBody } from "./handler";
import { codeCatalog } from "./products";
import { resetRateLimit, RATE_LIMIT } from "./rate-limit";

function mockRes() {
  const res: {
    statusCode: number;
    body: unknown;
    headers: Record<string, string>;
  } & Record<string, unknown> = {
    statusCode: 200,
    body: undefined,
    headers: {},
  };
  res.setHeader = (k: string, v: string) => {
    res.headers[k.toLowerCase()] = v;
    return res;
  };
  res.status = (c: number) => {
    res.statusCode = c;
    return res;
  };
  res.json = (b: unknown) => {
    res.body = b;
    return res;
  };
  return res as unknown as VercelResponse & {
    statusCode: number;
    body: any;
    headers: Record<string, string>;
  };
}
const req = (body: unknown, method = "POST", ip = "203.0.113.7") =>
  ({
    method,
    body,
    headers: { "x-forwarded-for": ip },
    socket: {},
  }) as unknown as VercelRequest;

const catalog = codeCatalog();
const deps = { catalog, searchPubmed: async () => [], env: {} };

describe("POST /api/peppy", () => {
  beforeEach(() => {
    resetRateLimit();
    vi.spyOn(console, "info").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects other methods and bad bodies", async () => {
    const r1 = mockRes();
    await handlePeppy(req({}, "GET"), r1, deps);
    expect(r1.statusCode).toBe(405);
    const r2 = mockRes();
    await handlePeppy(req({ message: "  " }), r2, deps);
    expect(r2.statusCode).toBe(400);
    const r3 = mockRes();
    await handlePeppy(req({ message: "x".repeat(801) }), r3, deps);
    expect(r3.statusCode).toBe(400);
  });

  it("answers in fallback mode with no LLM key", async () => {
    const res = mockRes();
    await handlePeppy(req({ message: "What is Epitalon?" }), res, deps);
    expect(res.statusCode).toBe(200);
    expect(res.body.mode).toBe("fallback");
    expect(res.body.research.length).toBeGreaterThan(0);
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("uses the LLM when configured and validates its output", async () => {
    const callLlm = vi.fn(async () =>
      JSON.stringify({
        summary:
          "Epitalon is a synthetic four-amino-acid peptide studied mostly in animals.",
        sections: [],
        sourceIds: ["pmid:12937682", "pmid:00000001"],
        products: [],
        followUps: [],
        suggestions: ["What is Endoluten?", "Do Khavinson peptides work?"],
      })
    );
    const res = mockRes();
    await handlePeppy(req({ message: "What is Epitalon?" }), res, {
      ...deps,
      callLlm,
    });
    expect(callLlm).toHaveBeenCalledOnce();
    expect(res.body.mode).toBe("llm");
    expect(res.body.research.map((s: { id: string }) => s.id)).toEqual([
      "pmid:12937682",
    ]);
  });

  it("rate-limits per IP", async () => {
    for (let i = 0; i < RATE_LIMIT.max; i++) {
      const ok = mockRes();
      await handlePeppy(
        req({ message: "hello" }, "POST", "198.51.100.1"),
        ok,
        deps
      );
      expect(ok.statusCode).toBe(200);
    }
    const blocked = mockRes();
    await handlePeppy(
      req({ message: "hello" }, "POST", "198.51.100.1"),
      blocked,
      deps
    );
    expect(blocked.statusCode).toBe(429);
    expect(Number(blocked.headers["retry-after"])).toBeGreaterThan(0);
    const other = mockRes();
    await handlePeppy(
      req({ message: "hello" }, "POST", "198.51.100.2"),
      other,
      deps
    );
    expect(other.statusCode).toBe(200);
  });

  it("never logs the user's message or IP", async () => {
    const spy = vi.mocked(console.info);
    await handlePeppy(
      req({ message: "my secret symptom zebra" }, "POST", "192.0.2.55"),
      mockRes(),
      deps
    );
    const logged = spy.mock.calls.map(c => c.join(" ")).join("\n");
    expect(logged).toContain('"evt":"peppy"');
    expect(logged).not.toMatch(/zebra|192\.0\.2\.55/);
  });

  it("caps history and sanitises productId", () => {
    const parsed = parsePeppyBody({
      message: "hi",
      history: Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 ? "assistant" : "user",
        content: "x".repeat(5000),
      })),
      productId: "../etc",
    });
    expect("error" in parsed).toBe(false);
    if ("error" in parsed) return;
    expect(parsed.history).toHaveLength(8);
    expect(parsed.history[0].content.length).toBe(1200);
    expect(parsed.productId).toBeUndefined();
  });
});
