import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PepitaAvatar from "./PepitaAvatar";

describe("PepitaAvatar", () => {
  it("is a round webp with alt 'Pepita' and a 2x source", () => {
    const html = renderToStaticMarkup(createElement(PepitaAvatar, { size: 24 }));
    expect(html).toContain('alt="Pepita"');
    expect(html).toContain("/images/pepita/avatar-128.webp");
    expect(html).toContain("/images/pepita/avatar-256.webp 2x");
    expect(html).toContain("rounded-full");
  });
});
