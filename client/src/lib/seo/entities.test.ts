import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import {
  aboutOrganizationJsonLd,
  homeJsonLd,
  productJsonLd,
  returnPolicyJsonLd,
  FOUNDERS_BY_PAGE,
  ORGANIZATION_ID,
  WEBSITE_ID,
  JULIA_PERSON_ID,
  BENJAMIN_PERSON_ID,
} from "./index";
import { authorizedRetailerJsonLd } from "./authorizedRetailer";

type Node = Record<string, any>;
const graph = (ld: Node): Node[] => (ld["@graph"] as Node[]) ?? [ld];
const org = (ld: Node) => graph(ld).find((n) => n["@id"] === ORGANIZATION_ID)!;

describe("one business entity across pages", () => {
  const pages = { home: homeJsonLd(), about: aboutOrganizationJsonLd(), auth: authorizedRetailerJsonLd() };

  it("every page defines #organization as OnlineStore with the same core facts", () => {
    const cores = Object.values(pages).map((ld) => {
      const o = org(ld);
      expect(o["@type"]).toBe("OnlineStore");
      const { founder: _f, ...core } = o;
      return core;
    });
    for (const c of cores) expect(c).toEqual(cores[0]);
    expect(cores[0].email).toBe("contact@purefirenutritional.com");
    expect(cores[0].contactPoint[0].email).toBe("support@purefirenutritional.com");
    expect(cores[0].address).toEqual({ "@type": "PostalAddress", addressLocality: "Brooklyn", addressRegion: "NY", addressCountry: "US" });
    expect(cores[0].address.streetAddress).toBeUndefined();
    expect(returnPolicyJsonLd()["@type"]).toBe("OnlineStore");
    expect(returnPolicyJsonLd()["@id"]).toBe(ORGANIZATION_ID);
  });

  it("home has no inline Organization without @id; WebSite publisher points to the store", () => {
    for (const ld of [pages.home, pages.about]) {
      const site = graph(ld).find((n) => n["@id"] === WEBSITE_ID)!;
      expect(site.publisher).toEqual({ "@id": ORGANIZATION_ID });
    }
    expect(JSON.stringify(pages.home)).not.toContain('"Organization"');
  });

  it("founders: /about both co-founders, authorization page Julia only, each with a stable @id", () => {
    expect(FOUNDERS_BY_PAGE.about).toEqual(["julia", "benjamin"]);
    expect(FOUNDERS_BY_PAGE.authorizedRetailer).toEqual(["julia"]);
    expect(org(pages.about).founder.map((p: Node) => p["@id"])).toEqual([JULIA_PERSON_ID, BENJAMIN_PERSON_ID]);
    expect(org(pages.auth).founder.map((p: Node) => p["@id"])).toEqual([JULIA_PERSON_ID]);
    expect(org(pages.home).founder).toBeUndefined();
    const julia = org(pages.auth).founder[0];
    expect(julia).toEqual(org(pages.about).founder[0]);
    expect(julia.identifier).toEqual({ "@type": "PropertyValue", name: "Peptides Company Consultant ID", value: "296389" });
  });

  it("product offers' seller is the store by @id", () => {
    const v = products.find((p) => p.id === "vesugen")!;
    const ld = productJsonLd(v) as Node;
    const offers = (ld.hasVariant ?? [ld]).map((x: Node) => x.offers);
    for (const o of offers) {
      expect(o.seller["@id"]).toBe(ORGANIZATION_ID);
      expect(o.seller["@type"]).toBe("OnlineStore");
    }
  });

  it("Vesugen: both sizes InStock (Julia, 2026-11-12)", () => {
    const v = products.find((p) => p.id === "vesugen")!;
    const ld = productJsonLd(v) as Node;
    const offers = (ld.hasVariant as Node[]).map((x) => x.offers);
    expect(offers).toHaveLength(2);
    for (const o of offers) expect(o.availability).toBe("https://schema.org/InStock");
  });
});
