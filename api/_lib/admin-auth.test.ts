import { describe, it, expect, vi, beforeEach } from "vitest";

const verifyIdToken = vi.fn();
vi.mock("./firebase.js", () => ({ getAdminAuth: () => ({ verifyIdToken }) }));

import { assertAdmin } from "./admin-auth";

const req = (headers: Record<string, string> = {}) => ({ headers }) as any;

describe("assertAdmin", () => {
  beforeEach(() => {
    verifyIdToken.mockReset();
    process.env.ADMIN_EMAILS = "Admin@Example.com, other@example.com";
    process.env.ADMIN_SEED_SECRET = "s3cret-value";
  });

  it("401 without a bearer token", async () => {
    expect(await assertAdmin(req())).toMatchObject({ ok: false, status: 401 });
  });

  it("accepts a verified allowlisted ID token (case-insensitive)", async () => {
    verifyIdToken.mockResolvedValue({ email: "admin@example.com", email_verified: true });
    expect(await assertAdmin(req({ authorization: "Bearer tok" }))).toMatchObject({
      ok: true,
      email: "admin@example.com",
    });
  });

  it("403 for non-allowlisted or unverified emails", async () => {
    verifyIdToken.mockResolvedValue({ email: "x@example.com", email_verified: true });
    expect(await assertAdmin(req({ authorization: "Bearer tok" }))).toMatchObject({ status: 403 });
    verifyIdToken.mockResolvedValue({ email: "admin@example.com", email_verified: false });
    expect(await assertAdmin(req({ authorization: "Bearer tok" }))).toMatchObject({ status: 403 });
  });

  it("401 for invalid tokens", async () => {
    verifyIdToken.mockRejectedValue(new Error("bad"));
    expect(await assertAdmin(req({ authorization: "Bearer tok" }))).toMatchObject({ status: 401 });
  });

  it("seed secret only works where explicitly allowed", async () => {
    verifyIdToken.mockRejectedValue(new Error("not a jwt"));
    const r = req({ authorization: "Bearer s3cret-value" });
    expect(await assertAdmin(r)).toMatchObject({ ok: false, status: 401 });
    expect(await assertAdmin(r, { allowSeedSecret: true })).toMatchObject({
      ok: true,
      via: "seed-secret",
    });
    expect(
      await assertAdmin(req({ "x-admin-seed-secret": "s3cret-value" }), { allowSeedSecret: true })
    ).toMatchObject({ ok: true });
  });

  it("503 when ADMIN_EMAILS is empty", async () => {
    process.env.ADMIN_EMAILS = "";
    expect(await assertAdmin(req({ authorization: "Bearer tok" }))).toMatchObject({ status: 503 });
  });
});
