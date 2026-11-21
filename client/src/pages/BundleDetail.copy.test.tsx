import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { MIXED_BUNDLES, bottleAlt, getMixedBundle, groupBottlesAlt } from "@shared/mixed-bundles";

// Server-render a bundle page as a preview build would (VITE_BUNDLE_PREVIEW=1).
async function renderBundle(slug: string) {
  const { render } = await import("../entry-server");
  const { html, helmet } = render(`/bundles/${slug}`);
  const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? "";
  const head = [helmet.title, helmet.meta, helmet.link].map((h: { toString(): string }) => h.toString()).join("\n");
  return { main, head };
}
const text = (html: string) =>
  html.replace(/<[^>]*\b(?:alt|aria-label|content)="([^"]*)"[^>]*>/g, " $1 ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;/g, "'");

describe("bundle page copy (rendered)", () => {
  beforeAll(() => vi.stubEnv("VITE_BUNDLE_PREVIEW", "1"));
  afterAll(() => vi.unstubAllEnvs());

  it("meta + OG description are the approved text; OG title = page title", async () => {
    for (const b of MIXED_BUNDLES) {
      const { head } = await renderBundle(b.slug);
      const esc = b.metaDescription.replace(/&/g, "&amp;");
      expect(head).toContain(`>${b.name.replace(/&/g, "&amp;")} | Pure Fire Nutritional</title>`);
      expect(head).toContain(`name="description" content="${esc}"`);
      expect(head).toContain(`property="og:description" content="${esc}"`);
      expect(head).toContain(`property="og:title" content="${b.name.replace(/&/g, "&amp;")} | Pure Fire Nutritional"`);
      if (b.live) expect(head).toContain(`rel="canonical" href="https://www.purefirenutritional.com/bundles/${b.slug}"`);
      else expect(head).toContain('name="robots" content="noindex, follow"');
    }
  });

  it("Day & Night Duo page and meta avoid sleep / rest / stress wording", async () => {
    const { main, head } = await renderBundle("day-and-night-duo");
    const all = text(main) + " " + text(head);
    expect(all).toContain("Day & Night Duo");
    // Protect bullet stays as approved.
    expect(all).toContain("normal melatonin levels and a calm mood");
    for (const re of [/sleep/i, /sleeplessness/i, /insomnia/i, /\brest\b/i, /bedtime/i, /night-time/i, /nighttime/i, /stress/i, /anxiety/i]) {
      expect(all, String(re)).not.toMatch(re);
    }
    expect("interest restful").toMatch(/\brest/i); // sanity: boundary regex still catches "rest…" words
    expect("interest").not.toMatch(/\brest\b/i);
  });

  it("Skin & Bones Duo meta has no 'bone' beyond the bundle name", () => {
    const b = getMixedBundle("skin-and-bones-duo")!;
    expect(b.metaDescription.startsWith("Skin & Bones Duo: ")).toBe(true);
    expect(b.metaDescription.replace(b.name, "")).not.toMatch(/bone/i);
    expect([b.intro, ...b.bullets].join(" ")).not.toMatch(/bone|density|osteopor/i);
  });

  it("alt text is product names only", async () => {
    const { main } = await renderBundle("day-and-night-duo");
    const alts = Array.from(main.matchAll(/<img[^>]*\balt="([^"]*)"/g)).map((m) => m[1]);
    expect(alts).toContain("Prime Peptide Brain bottle");
    expect(alts).toContain("Prime Peptide Protect bottle");
    for (const a of alts) expect(a === "" || /^Prime Peptide (Brain|Collagen|Joints|Omega|Protect) bottle$/.test(a), a).toBe(true);
    // Lifestyle images out for now (Julia, 2026-11-20): no placeholder on any page.
    for (const b of MIXED_BUNDLES) {
      const page = (await renderBundle(b.slug)).main;
      expect(page).not.toMatch(/lifestyle/i);
      expect(page).not.toContain("bundle-lifestyle-placeholder");
    }
    expect(bottleAlt("prime-peptide-omega")).toBe("Prime Peptide Omega bottle");
    expect(groupBottlesAlt(getMixedBundle("day-and-night-duo")!)).toBe("Prime Peptide Brain and Prime Peptide Protect bottles");
    expect(groupBottlesAlt(getMixedBundle("glow-up-trio")!)).toBe(
      "Prime Peptide Brain, Prime Peptide Collagen and Prime Peptide Omega bottles"
    );
  });
});
