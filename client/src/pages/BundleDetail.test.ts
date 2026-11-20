import { describe, expect, it } from "vitest";
import { MIXED_BUNDLES } from "@shared/mixed-bundles";
import { bundleSafetyText, canShowBundle } from "./BundleDetail";

describe("BundleDetail gating", () => {
  const draft = MIXED_BUNDLES[0];
  it("draft bundles show only in a preview build", () => {
    expect(draft.live).toBe(false);
    expect(canShowBundle(draft, undefined)).toBe(false);
    expect(canShowBundle(draft, "")).toBe(false);
    expect(canShowBundle(draft, "1")).toBe(true);
    expect(canShowBundle(undefined, "1")).toBe(false);
    expect(canShowBundle({ ...draft, live: true }, undefined)).toBe(true);
  });
  it("uses the frozen Prime safety text", () => {
    for (const b of MIXED_BUNDLES) {
      expect(bundleSafetyText(b)).toBe(
        "Not recommended during pregnancy or breastfeeding unless your doctor advises it. Do not use if you are allergic or sensitive to any component. Consult a healthcare professional before use, especially if you take medications or have a medical condition. Keep out of reach of children."
      );
    }
  });
});
