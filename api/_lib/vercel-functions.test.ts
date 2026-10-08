import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Vercel turns every file under api/ (outside "_"-prefixed folders/files) into a
 * Serverless Function, and this project's plan allows at most 12 per deployment.
 * A 13th file (e.g. a test placed next to a route) makes the production build fail.
 */
const MAX_FUNCTIONS = 12;

function functionFiles(dir: string, rel = ""): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const r = path.join(rel, entry.name);
    if (entry.isDirectory()) out.push(...functionFiles(path.join(dir, entry.name), r));
    else if (/\.(ts|js|mjs|cjs)$/.test(entry.name)) out.push(r);
  }
  return out;
}

describe("Vercel function budget", () => {
  const files = functionFiles(path.resolve(__dirname, ".."));
  it(`has at most ${MAX_FUNCTIONS} functions under api/`, () => {
    expect(files.length, files.join("\n")).toBeLessThanOrEqual(MAX_FUNCTIONS);
  });
  it("has no test files outside api/_lib (they would deploy as functions)", () => {
    expect(files.filter((f) => /\.test\.|\.spec\./.test(f))).toEqual([]);
  });
});
