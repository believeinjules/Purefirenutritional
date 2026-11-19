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
});
