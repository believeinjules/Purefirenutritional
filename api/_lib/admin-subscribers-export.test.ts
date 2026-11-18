// GET /api/admin/subscribers-export (served by api/admin/[collection].ts).
import { describe, expect, it, vi, beforeEach } from "vitest";

let isAdmin = true;
let fakeDb: any = null;
vi.mock("./admin-auth.js", async (orig) => ({
  ...(await orig<any>()),
  requireAdmin: async (_req: any, res: any) => {
    if (!isAdmin) {
      res.status(403).json({ error: "Forbidden" });
      return null;
    }
    return { email: "julesxshulman@gmail.com" };
  },
}));
vi.mock("./firebase.js", () => ({ getAdminDb: () => fakeDb }));

const { default: handler } = await import("../admin/[collection]");

function call(method = "GET") {
  const res: any = {
    headers: {} as Record<string, string>,
    status(c: number) { this.statusCode = c; return this; },
    json(b: unknown) { this.body = b; return this; },
    send(b: unknown) { this.body = b; return this; },
    setHeader(k: string, v: string) { this.headers[k] = v; },
  };
  return Promise.resolve(handler({ method, query: { collection: "subscribers-export" }, headers: {} } as any, res)).then(() => res);
}

beforeEach(() => {
  isAdmin = true;
  fakeDb = {
    collection: (name: string) => ({
      limit: () => ({
        get: async () => ({
          docs: name === "mailing_list"
            ? [{ id: "a@b.co", data: () => ({ email: "a@b.co", subscribed: true, source: "daily-fire", createdAt: "2026-11-18T00:00:00.000Z" }) }]
            : [],
        }),
      }),
    }),
  };
});

describe("admin subscribers CSV export", () => {
  it("admins get a CSV attachment of mailing_list", async () => {
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toContain("text/csv");
    expect(res.headers["Content-Disposition"]).toMatch(/^attachment; filename="pure-fire-mailing-list-\d{4}-\d{2}-\d{2}\.csv"$/);
    expect(res.headers["Cache-Control"]).toBe("no-store");
    expect(res.body).toContain("a@b.co,true,daily-fire");
  });
  it("non-admins are refused; only GET; 503 without Firebase Admin", async () => {
    isAdmin = false;
    expect((await call()).statusCode).toBe(403);
    isAdmin = true;
    expect((await call("POST")).statusCode).toBe(405);
    fakeDb = null;
    expect((await call()).statusCode).toBe(503);
  });
});
