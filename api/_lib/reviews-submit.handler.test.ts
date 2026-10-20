import { describe, it, expect, beforeEach, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/** POST /api/reviews (api/reviews.ts) with Firestore and email stubbed. */
const added: Array<Record<string, unknown>> = [];
const rate = new Map<string, Record<string, unknown>>();
const mail = vi.fn(async () => true);

vi.mock("../_lib/email.js", () => ({ sendReviewNotification: (n: unknown) => mail(n) }));
vi.mock("../_lib/firebase.js", () => ({
  getAdminDb: () => ({
    collection: (name: string) => ({
      add: async (d: Record<string, unknown>) => {
        added.push({ _collection: name, ...d });
        return { id: `id${added.length}` };
      },
      doc: (id: string) => ({ id, _name: name }),
    }),
    runTransaction: async (fn: (tx: unknown) => Promise<boolean>) =>
      fn({
        get: async (ref: { id: string }) => ({ exists: rate.has(ref.id), get: (k: string) => rate.get(ref.id)?.[k] }),
        set: (ref: { id: string }, data: Record<string, unknown>) => void rate.set(ref.id, data),
      }),
  }),
}));
vi.mock("firebase-admin/firestore", () => ({ FieldValue: { serverTimestamp: () => "TS" } }));

const { default: handler } = await import("../reviews.js");

const valid = { productId: "endoluten", rating: 5, text: "Arrived quickly and easy to take.", firstName: "Jane", lastInitial: "D", email: "", consent: true, serviceText: "", website: "", elapsedMs: 9000 };

async function post(body: unknown, ip = "1.2.3.4") {
  const out: { status: number; body: any } = { status: 200, body: undefined };
  const res = {
    status(code: number) { out.status = code; return this; },
    json(payload: unknown) { out.body = payload; return this; },
    setHeader() { return this; },
  } as unknown as VercelResponse;
  await handler({ method: "POST", body, headers: { "x-forwarded-for": ip }, query: {} } as unknown as VercelRequest, res);
  return out;
}

describe("POST /api/reviews", () => {
  beforeEach(() => { added.length = 0; rate.clear(); mail.mockClear(); });

  it("stores a pending product review + separate service review and emails Julia", async () => {
    const r = await post({ ...valid, serviceText: "Great communication." });
    expect(r.status).toBe(201);
    expect(added).toHaveLength(2);
    expect(added[0]).toMatchObject({ _collection: "reviews", status: "pending", approved: false, kind: "product", productId: "endoluten" });
    expect(added[1]).toMatchObject({ status: "pending", approved: false, kind: "service", linkedReviewId: "id1" });
    expect(mail).toHaveBeenCalledTimes(1);
  });
  it("rejects invalid input with 400 and stores nothing", async () => {
    const r = await post({ ...valid, consent: false, rating: 9 });
    expect(r.status).toBe(400);
    expect(r.body.errors).toHaveProperty("consent");
    expect(added).toHaveLength(0);
  });
  it("honeypot → silent 200, nothing stored or emailed", async () => {
    const r = await post({ ...valid, website: "http://spam.example" });
    expect(r.status).toBe(200);
    expect(added).toHaveLength(0);
    expect(mail).not.toHaveBeenCalled();
  });
  it("rate-limits per IP (5 per hour)", async () => {
    for (let i = 0; i < 5; i++) expect((await post(valid)).status).toBe(201);
    expect((await post(valid)).status).toBe(429);
    expect((await post(valid, "5.6.7.8")).status).toBe(201);
  });
});
