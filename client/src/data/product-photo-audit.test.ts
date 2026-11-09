import { describe, expect, it } from "vitest";
import { getProductById } from "./products";
import { responsiveImage } from "@/lib/responsiveImage";
import { render } from "../entry-server";
import { productHead, productImageUrls, productJsonLd } from "@/lib/seo";

describe("verified product photo mapping", () => {
  it("points Revifort at the bottle labeled REVIFORT, 60 capsules of 0.31 g", () => {
    const p = getProductById("revifort")!;
    expect(p.image).toBe("/products/revifort-main.webp");
    expect(p.imageAlt).toBe("Revifort bottle and box");
    expect(p.priceUSD).toBe(131.99);
    expect(responsiveImage(p.image, "100vw").src).toBe("/opt/products/revifort-main-500.webp");
  });

  it("points Reviform Cocktail at the pouch labeled Reviform cocktail", () => {
    const p = getProductById("reviform-cocktail")!;
    expect(p.image).toBe("/products/reviform-cocktail-main.webp");
    expect(p.imageAlt).toBe("Reviform Cocktail pouch");
    expect(p.priceUSD).toBe(36.99);
    expect(responsiveImage(p.image, "100vw").src).toBe("/opt/products/reviform-cocktail-main-500.webp");
  });

  it("uses the native Mamiton packshot and the labeled gallery, not the Felicita photo", () => {
    const p = getProductById("mamiton")!;
    expect(p.image).toBe("/products/mamiton-main-native.webp");
    expect(p.images).toEqual([
      "/products/mamiton-main-native.webp",
      "/products/mamiton-bottle-front-b.webp",
      "/products/mamiton-box-ingredients.webp",
      "/products/mamiton-box-manufacturer.webp",
    ]);
    expect(p.images?.join(" ")).not.toMatch(/felicita|mamiton-main\.webp|bottle-front-a|reference/);
    expect(p.priceUSD).toBe(40.99);
    expect(p.description).toMatch(/^Natural formula designed specifically for the female reproductive system/);
    expect(responsiveImage(p.image, "100vw").src).toBe("/opt/products/mamiton-main-native-407.webp");
  });

  it("prerenders the Mamiton gallery from the labeled files", () => {
    const { html, helmet } = render("/products/mamiton");
    for (const src of [
      "/opt/products/mamiton-main-native-407.webp",
      "/opt/products/mamiton-bottle-front-b-320.webp",
      "/opt/products/mamiton-box-ingredients-320.webp",
      "/opt/products/mamiton-box-manufacturer-320.webp",
    ]) {
      expect(html, src).toContain(src);
    }
    expect(html).toContain("$40.99");
    expect(html).not.toMatch(/felicita|bottle-front-a|mamiton-main-1000|reference_only/i);
    const ld = helmet.script.toString();
    expect(ld).toContain("mamiton-main-native");
    expect(ld).not.toMatch(/felicita/i);
  });

  it("points Reviplant at its bottle-and-box packshot", () => {
    const p = getProductById("reviplant")!;
    expect(p.image).toBe("/products/reviplant-main.webp");
    expect(p.imageAlt).toBe("Reviplant bottle and box");
    expect(p.priceUSD).toBe(79.99);
    expect(responsiveImage(p.image, "100vw").src).toBe("/opt/products/reviplant-main-500.webp");
  });


  it.each([
    ["reviplant", "/products/reviplant-main.webp", "Reviplant bottle and box"],
    ["revifort", "/products/revifort-main.webp", "Revifort bottle and box"],
    ["reviform-cocktail", "/products/reviform-cocktail-main.webp", "Reviform Cocktail pouch"],
  ] as const)("%s image is used by JSON-LD / product head / prerender", (id, path, alt) => {
    const p = getProductById(id)!;
    expect(productImageUrls(p)[0]).toContain(path);
    expect(JSON.stringify(productJsonLd(p))).toContain(path.replace("/products/", ""));
    const head = productHead(p);
    expect(head.image).toContain(path.replace("/products/", ""));
    expect(head.imageAlt).toBe(alt);
    const { html, helmet } = render(`/products/${id}`);
    const stem = path.replace("/products/", "").replace(".webp", "");
    expect(html).toContain(stem);
    expect(helmet.script.toString()).toContain(stem);
  });

  it("leaves Rinolax and Felicita image mapping unchanged", () => {
    expect(getProductById("rinolax")!.image).toBe("/products/Alvenorm.jpg");
    expect(getProductById("rinolax")!.priceUSD).toBe(55.99);
    expect(getProductById("felicita")!.image).toBe("/products/felicita.jpg");
    expect(getProductById("alvenorm-forte")!.image).toBe("/products/Alvenorm.jpg");
  });
});
