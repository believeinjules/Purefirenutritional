import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  AUTHORIZED_RETAILER_PATH,
  MANUFACTURER_VERIFICATION_URL,
  RETAILER_NUMBER,
  isKhavinsonAuthorizedProduct,
} from "./retailerAuthorization";
import { PUBLIC_STATIC_ROUTES } from "@/lib/seo/sitemap";
import { authorizedRetailerJsonLd } from "@/lib/seo/authorizedRetailer";

const root = path.resolve(__dirname, "../../..");
const read = (f: string) => fs.readFileSync(path.join(root, f), "utf8");

describe("retailer authorization", () => {
  it("uses Julia's retailer number, 296389, with no placeholder", () => {
    expect(RETAILER_NUMBER).toBe("296389");
    expect(JSON.stringify(authorizedRetailerJsonLd())).toContain('"value":"296389"');
  });
  it("is a sitemap/prerender route, in llms.txt and linked from the footer", () => {
    expect(PUBLIC_STATIC_ROUTES).toContain(AUTHORIZED_RETAILER_PATH);
    expect(read("client/public/llms.txt")).toContain(`https://www.purefirenutritional.com${AUTHORIZED_RETAILER_PATH}`);
    expect(read("client/src/components/Footer.tsx")).toContain("AUTHORIZED_RETAILER_PATH");
  });
  it("puts the line on Cytomax and Cytogen products only, never hidden or Prime Peptide", () => {
    expect(isKhavinsonAuthorizedProduct("vesugen")).toBe(true);
    expect(isKhavinsonAuthorizedProduct("cerluten")).toBe(true);
    expect(isKhavinsonAuthorizedProduct("prime-peptide-brain")).toBe(false);
    expect(isKhavinsonAuthorizedProduct("revilab-ml-01")).toBe(false);
    for (const hidden of ["calsil-t", "indosine", "panaxod"]) expect(isKhavinsonAuthorizedProduct(hidden)).toBe(false);
  });
  it("page and JSON-LD have no supplier domain, referral URL, credential claim or 'verified' wording", () => {
    const page = read("client/src/pages/AuthorizedRetailer.tsx") + read("client/src/components/trust/PeptidesCompanyVerification.tsx");
    const ld = JSON.stringify(authorizedRetailerJsonLd());
    for (const text of [page, ld]) {
      expect(text).not.toMatch(/peptid\.ru|[?&]ref=|\.ru\b/i);
      // Julia's own Peptides Company sentence is the only "independently verified" wording allowed.
      expect(text.replace(/can be independently verified by contacting Peptides\s+Company/g, "")).not.toMatch(/independently verified|officially verified|certified retailer/i);
    }
    expect(ld).not.toMatch(/hasCredential|recognizedBy/);
    expect(ld).not.toMatch(/independently verified/i);
    expect(ld).toContain('"addressLocality":"Brooklyn"');
  });
  it("renders no manufacturer verification link until a real URL is set", () => {
    expect(MANUFACTURER_VERIFICATION_URL).toBe("");
  });
  it("shows the Peptides Company box once, with Consultant ID 296389 and Julia's exact wording", () => {
    const box = read("client/src/components/trust/PeptidesCompanyVerification.tsx").replace(/\s+/g, " ");
    for (const t of [
      "Our Relationship with Peptides Company",
      "Pure Fire Nutritional is independently operated by an Independent Consultant registered directly with Peptides Company. Our registration and affiliation can be independently verified by contacting Peptides Company.",
      "Peptides Company — Registered Independent Consultant",
      "Consultant ID: ",
      "Registration can be confirmed directly with Peptides Company.",
      'id={PEPTIDES_COMPANY_SECTION_ID}',
    ]) expect(box).toContain(t);
    const users = ["client/src/pages/AuthorizedRetailer.tsx", "client/src/pages/About.tsx", "client/src/pages/Index.tsx", "client/src/pages/ProductDetail.tsx", "client/src/components/about/SupplierRelationship.tsx"]
      .filter((f) => read(f).includes("<PeptidesCompanyVerification"));
    expect(users).toEqual(["client/src/pages/AuthorizedRetailer.tsx"]);
  });
});
