import { describe, expect, it } from "vitest";
import { responsiveImage, imageRatio, fetchPriority } from "./responsiveImage";
import { isPreorderProduct, PREORDER_CART_NOTE } from "@shared/preorder";

describe("responsiveImage", () => {
  it("maps a processed local image to WebP srcset", () => {
    const r = responsiveImage("/logo-flame.jpeg", "64px", 160);
    expect(r.src).toMatch(/^\/opt\/logo-flame-\d+\.webp$/);
    expect(r.srcSet).toContain("160w");
    expect(r.sizes).toBe("64px");
    expect(imageRatio("/logo-flame.jpeg")).toBeGreaterThan(0);
  });
  it("passes unknown / remote images through", () => {
    expect(responsiveImage("https://example.com/a.jpg", "100vw")).toEqual({ src: "https://example.com/a.jpg" });
    expect(responsiveImage(undefined, "100vw")).toEqual({ src: undefined });
  });
  it("fetchPriority uses the lowercase attribute React 18 passes through", () => {
    expect(fetchPriority(true)).toEqual({ fetchpriority: "high" });
    expect(fetchPriority(false)).toEqual({});
  });
});

describe("pre-order cart note", () => {
  it("is neutral (no promised dates)", () => {
    expect(PREORDER_CART_NOTE).toBe("Pre-order: ships when restocked");
    expect(PREORDER_CART_NOTE).not.toMatch(/\d|week|day/i);
    expect(isPreorderProduct("revilab-sl-01")).toBe(true);
    expect(isPreorderProduct("glandokort")).toBe(false);
  });
});
