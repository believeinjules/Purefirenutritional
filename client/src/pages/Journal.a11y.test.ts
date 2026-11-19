import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const src = fs.readFileSync(path.join(__dirname, "Journal.tsx"), "utf8");

describe("Learn article cards are named", () => {
  it("gives cover images a meaningful alt and each article link an accessible name", () => {
    expect(src).toContain("alt={`Cover image for “${a.title}”`}");
    expect(src).toContain('aria-label={`Read “${a.title}”`}');
    expect(src).not.toMatch(/alt=""/);
    expect(src).not.toMatch(/aria-hidden="true"[^>]*>\s*<Cover/);
  });
});
