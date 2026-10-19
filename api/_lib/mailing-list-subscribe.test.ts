import { describe, it, expect, beforeEach, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/** The deployed Vercel function api/mailing-list/subscribe.ts, with Firestore stubbed. */
const store = new Map<string, Record<string, unknown>>();
const docIds: string[] = [];

vi.mock("firebase-admin/app", () => ({ getApps: () => [{}], initializeApp: vi.fn(), cert: vi.fn() }));
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: () => ({
      doc: (id: string) => {
        docIds.push(id);
        return {
          get: async () => ({ exists: store.has(id), data: () => store.get(id) }),
          set: async (data: Record<string, unknown>) => void store.set(id, data),
          update: async (data: Record<string, unknown>) => void store.set(id, { ...store.get(id), ...data }),
        };
      },
    }),
  }),
}));

const { default: handler } = await import("../mailing-list/subscribe.js");

async function post(body: unknown) {
  const out: { status: number; body: any } = { status: 200, body: undefined };
  const res = {
    status(code: number) {
      out.status = code;
      return this;
    },
    json(payload: unknown) {
      out.body = payload;
      return this;
    },
  } as unknown as VercelResponse;
  await handler({ method: "POST", body } as VercelRequest, res);
  return out;
}

describe("api/mailing-list/subscribe", () => {
  beforeEach(() => {
    store.clear();
    docIds.length = 0;
  });

  it("rejects invalid email format before any Firestore access", async () => {
    for (const email of ["notanemail", "@example.com", "test@", "test..test@example.com", "a/b@example.com"]) {
      const r = await post({ email });
      expect(r.status, email).toBe(400);
      expect(r.body.error).toBe("Please enter a valid email address");
    }
    expect(docIds).toEqual([]);
  });

  it("stores a valid address trimmed and lower-cased", async () => {
    const r = await post({ email: " User+Tag@Example.com " });
    expect(r.body.success).toBe(true);
    expect(store.get("user+tag@example.com")).toMatchObject({ email: "user+tag@example.com", subscribed: true });
  });
});
