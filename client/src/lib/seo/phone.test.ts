/**
 * Business phone (Julia, 2026-11-25): (347) 913-3002 on /contact, the footer and
 * the Organization JSON-LD; the old (315) 567-7931 is gone. Uses the same render
 * and check prerender.mjs runs at build time.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { render, BUSINESS_PHONE } from "../../entry-server";
import { homeJsonLd, ORGANIZATION_ID } from "./index";
// @ts-expect-error plain .mjs build helpers
import { applyHead, checkBusinessPhone } from "../../../../scripts/prerender-html.mjs";

const root = path.resolve(__dirname, "../../../..");
const template = fs.readFileSync(path.join(root, "client/index.html"), "utf8");
function prerenderPage(route: string): string {
  const { html, helmet } = render(route);
  return applyHead(template.replace(`<div id="root"></div>`, `<div id="root">${html}</div>`), helmet);
}

describe("business phone", () => {
  it("constants: display, tel: link and schema format", () => {
    expect(BUSINESS_PHONE).toEqual({ display: "(347) 913-3002", href: "tel:+13479133002", schema: "+1-347-913-3002" });
  });

  it("/contact and the footer show (347) 913-3002 as a tel: link", () => {
    const contact = prerenderPage("/contact");
    const main = contact.match(/<main[\s\S]*<\/main>/)?.[0] ?? "";
    const footer = contact.match(/<footer[\s\S]*<\/footer>/)?.[0] ?? "";
    for (const part of [main, footer]) {
      expect(part).toMatch(/<a[^>]*href="tel:\+13479133002"[^>]*>\s*\(347\) 913-3002\s*<\/a>/);
    }
    // footer: phone sits in the Contact Us list right after the contact@ email
    expect(footer.indexOf("contact@purefirenutritional.com")).toBeLessThan(footer.indexOf("(347) 913-3002"));
    expect(checkBusinessPhone(contact, BUSINESS_PHONE, { link: true })).toEqual([]);
  });

  it("Organization JSON-LD telephone (and its ContactPoint) is +1-347-913-3002 on the home page", () => {
    const org = (homeJsonLd()["@graph"] as Record<string, any>[]).find((n) => n["@id"] === ORGANIZATION_ID)!;
    expect(org.telephone).toBe("+1-347-913-3002");
    expect(org.contactPoint.map((c: { telephone: string }) => c.telephone)).toEqual(["+1-347-913-3002"]);
    expect(checkBusinessPhone(prerenderPage("/"), BUSINESS_PHONE, { link: true, jsonLd: true })).toEqual([]);
  });

  it("the old number is gone from source and the checker catches it", () => {
    for (const rel of ["client/src/components/Footer.tsx", "client/src/pages/Contact.tsx", "client/src/pages/FAQ.tsx", "client/src/lib/seo/index.ts"]) {
      const src = fs.readFileSync(path.join(root, rel), "utf8");
      expect(src, rel).not.toMatch(/567-?7931|3155677931/);
    }
    expect(prerenderPage("/faq")).toContain('href="tel:+13479133002"');
    const bad = `<a href="tel:+13155677931">(315) 567-7931</a>`;
    expect(checkBusinessPhone(bad, BUSINESS_PHONE, { link: true })).toEqual([
      "old phone (315) 567-7931 still present",
      "missing tel:+13479133002 link",
      "missing displayed phone (347) 913-3002",
    ]);
  });
});
