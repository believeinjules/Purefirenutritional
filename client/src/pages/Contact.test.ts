import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPORT_EMAIL } from "@shared/contact-emails";
import { PUBLIC_PAGE_HEADS } from "@/lib/seo/publicHeads";
import { PUBLIC_STATIC_ROUTES } from "@/lib/seo/sitemap";

const src = fs.readFileSync(path.join(__dirname, "Contact.tsx"), "utf8");

describe("Contact page", () => {
  it("is a public routed page with support email and FAQ links, and no form backend", () => {
    expect(PUBLIC_STATIC_ROUTES).toContain("/contact");
    expect(PUBLIC_PAGE_HEADS["/contact"]?.title).toBe("Contact | Pure Fire Nutritional");
    expect(src).toContain("SUPPORT_EMAIL");
    expect(src).toContain('href="/faq"');
    expect(src).toContain("mailto(");
    expect(src).not.toMatch(/<form\b/);
    expect(src).not.toMatch(/fetch\(/);
    expect(src).not.toMatch(/action=/);
  });
});
