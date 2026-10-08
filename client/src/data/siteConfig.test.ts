import { describe, expect, it } from "vitest";
import { SITE_TRUST, founderBlockVisible, isUsableUrl } from "./siteConfig";

describe("site trust config", () => {
  it("keeps the founder block hidden until approved AND a photo is set", () => {
    expect(founderBlockVisible()).toBe(false);
    const f = SITE_TRUST.founder;
    expect(founderBlockVisible({ ...f, approved: true })).toBe(false); // no photo yet
    expect(founderBlockVisible({ ...f, photoUrl: "/team/julia.jpg" })).toBe(false); // not approved
    expect(founderBlockVisible({ ...f, approved: true, photoUrl: "/team/julia.jpg" })).toBe(true);
  });

  it("has no authorization document until Julia supplies it", () => {
    expect(SITE_TRUST.authorizationDocUrl).toBe("");
    expect(isUsableUrl("")).toBe(false);
    expect(isUsableUrl("http://x.test/a.pdf")).toBe(false);
    expect(isUsableUrl("/docs/authorization.pdf")).toBe(true);
  });
});
