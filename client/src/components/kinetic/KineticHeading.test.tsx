import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import KineticHeading, { splitWords } from "./KineticHeading";

describe("KineticHeading", () => {
  it("splits words without losing text", () => {
    expect(splitWords("  Oral  Khavinson (and Doesn't)\nShow ")).toEqual(["Oral", "Khavinson", "(and", "Doesn't)", "Show"]);
  });
  it("keeps accessible text and visible static text", () => {
    const t = "Longevity Journal: A & B";
    const html = renderToStaticMarkup(<KineticHeading text={t} className="x" />);
    expect(html).toContain('aria-label="Longevity Journal: A &amp; B"');
    expect(html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&")).toBe(t);
    expect(html).not.toMatch(/opacity/);
  });
});
