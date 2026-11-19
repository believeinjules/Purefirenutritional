import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.join(__dirname, "..", "..");

describe("site chrome", () => {
  it("points favicon and apple-touch-icon at generated logo assets, not /logo.png", () => {
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    expect(html).toContain('href="/favicon.ico"');
    expect(html).toContain('href="/favicon-32.png"');
    expect(html).toContain('href="/apple-touch-icon.png"');
    expect(html).not.toContain("/logo.png");
    for (const f of ["favicon.ico", "favicon-32.png", "apple-touch-icon.png"]) {
      expect(fs.existsSync(path.join(root, "public", f)), f).toBe(true);
    }
  });

  it("uses a dynamic footer year", () => {
    const footer = fs.readFileSync(path.join(root, "src/components/Footer.tsx"), "utf8");
    expect(footer).toContain("new Date().getFullYear()");
    expect(footer).not.toMatch(/© 2024 Pure Fire Nutritional/);
    expect(footer).toContain('href="/contact"');
  });

  it("switches shop-card hints with hover media queries, not a user-agent string", () => {
    const css = fs.readFileSync(path.join(root, "src/index.css"), "utf8");
    const card = fs.readFileSync(path.join(root, "src/components/ProductListingCard.tsx"), "utf8");
    expect(card).toContain("Hover for details");
    expect(card).toContain("Tap for details");
    expect(css).toContain("@media (hover: none)");
    expect(card + css).not.toMatch(/userAgent|navigator\.platform/);
  });
});
