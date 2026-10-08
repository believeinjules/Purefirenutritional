import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { COMMERCE_CONFIG } from "@shared/commerce-config";
import {
  CONTACT_EMAIL,
  FDA_DISCLAIMER,
  POLICIES,
  POLICY_LAST_UPDATED,
  POLICY_LIST,
  SHIP_TO_COUNTRIES,
  type Policy,
} from "@/content/policies";
import { PUBLIC_STATIC_ROUTES } from "@/lib/seo/sitemap";
import { routeHead } from "@/lib/seo";

const root = path.resolve(__dirname, "../../../..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

/** Every piece of visible text on a policy page. */
function allText(p: Policy): string {
  const blocks = p.sections.flatMap((s) => [
    s.heading,
    ...s.body.map((b) => (typeof b === "string" ? b : "list" in b ? b.list.join("\n") : b.callout)),
  ]);
  return [p.title, p.description, p.intro, ...(p.summary ?? []), ...blocks].join("\n");
}

describe("policy pages: routing and SEO", () => {
  const app = read("client/src/App.tsx");

  it.each(POLICY_LIST.map((p) => [p.path, p] as const))("%s is a routed, indexable page in the sitemap", (route, p) => {
    expect(app).toContain(`<Route path="${route}"`);
    expect(PUBLIC_STATIC_ROUTES).toContain(route);
    expect(routeHead(route)?.noindex).toBeFalsy();
    expect(p.metaTitle).toMatch(/\| Pure Fire Nutritional$/);
    expect(p.description.length).toBeGreaterThan(50);
    expect(p.description.length).toBeLessThanOrEqual(160);
  });

  it("each page has its own title and description", () => {
    expect(new Set(POLICY_LIST.map((p) => p.metaTitle)).size).toBe(4);
    expect(new Set(POLICY_LIST.map((p) => p.description)).size).toBe(4);
  });

  it("the footer links all four pages", () => {
    const footer = read("client/src/components/Footer.tsx");
    for (const p of POLICY_LIST) expect(footer).toContain(`href="${p.path}"`);
  });

  it("/learn is a 301 to /science (vercel.json) and redirects in-app too", () => {
    const vercel = JSON.parse(read("vercel.json"));
    expect(vercel.redirects).toContainEqual({ source: "/learn", destination: "/science", statusCode: 301 });
    expect(app).toMatch(/<Route path="\/learn">\s*<Redirect to="\/science" replace \/>/);
  });
});

describe("policy pages: content", () => {
  it.each(POLICY_LIST.map((p) => [p.path, p] as const))("%s: complete copy, no placeholders", (_r, p) => {
    const t = allText(p);
    expect(POLICY_LAST_UPDATED).toBe("October 8, 2026");
    expect(t).not.toMatch(/\bTBD\b|\bTODO\b|lorem|ipsum|placeholder|\bXXX\b|\[insert|\{\{/i);
    expect(t).toContain(CONTACT_EMAIL);
    expect(p.sections.length).toBeGreaterThanOrEqual(5);
  });

  it.each(POLICY_LIST.map((p) => [p.path, p] as const))("%s: no phone number or street address", (_r, p) => {
    const t = allText(p);
    expect(t).not.toMatch(/\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/);
    expect(t).not.toMatch(/\b\d{2,5}\s+\w+(\s\w+)?\s(Ave|Avenue|St|Street|Rd|Road|Blvd|Suite)\b/i);
  });

  it.each(POLICY_LIST.map((p) => [p.path, p] as const))("%s: makes no health claims", (_r, p) => {
    // The FDA disclaimer itself says "diagnose, treat, cure, or prevent", so it is excluded.
    const t = allText(p).split(FDA_DISCLAIMER).join(" ");
    expect(t).not.toMatch(/\b(cures?|heals?|prevents? (disease|illness)|boosts?|anti-aging|lifespan|longevity|clinically proven|guaranteed results?)\b/i);
    expect(t).not.toMatch(/\b(treats?|treatment for|relie(f|ves?)|supports?|improves?|reduces?) (your |a |any )?(condition|disease|illness|symptoms?|health|immunity|energy|sleep|aging)\b/i);
  });

  it("terms carry the FDA dietary-supplement disclaimer", () => {
    expect(FDA_DISCLAIMER).toBe(
      "These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease."
    );
    expect(allText(POLICIES.terms)).toContain(FDA_DISCLAIMER);
  });

  it("shipping numbers come from the store config", () => {
    const t = allText(POLICIES.shipping);
    expect(t).toContain(`$${COMMERCE_CONFIG.standardShippingUSD.toFixed(2)}`);
    expect(t).toContain(`$${COMMERCE_CONFIG.freeShippingThresholdUSD} or more`);
  });

  it("ship-to countries match what Stripe checkout accepts", () => {
    const checkout = read("api/_lib/checkout-session.ts");
    const m = checkout.match(/allowed_countries:\s*\[([^\]]+)\]/);
    expect(m).not.toBeNull();
    const codes = Array.from(m![1].matchAll(/"([A-Z]{2})"/g), (x) => x[1]);
    expect(SHIP_TO_COUNTRIES.map((c) => c.code)).toEqual(codes);
  });

  it("returns policy matches the FAQ: unopened products within 30 days", () => {
    const faq = read("client/src/pages/FAQ.tsx");
    expect(faq).toContain("return unopened products within 30 days");
    expect(allText(POLICIES.returns)).toContain("unopened products in their original, sealed packaging within 30 days of delivery");
  });
});
