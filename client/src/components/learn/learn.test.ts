import { describe, expect, it } from "vitest";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup as rawRender } from "react-dom/server";
import { readFileSync } from "fs";
import { Router } from "wouter";
import { allProducts } from "@/data/products";
import { HIDDEN_PRODUCT_IDS } from "@shared/hidden-products";
import { parsePeppyParams } from "@/lib/peppyContext";
import TwoTypes from "./TwoTypes";
import BodySystemNav from "./BodySystemNav";
import AskPepitaDock from "./AskPepitaDock";
import { askPepitaHref, BODY_SYSTEM_TILES, PEPITA_SUGGESTIONS, typeExamples } from "./learnData";

const render = (el: ReactElement) => rawRender(createElement(Router, { ssrPath: "/learn" }, el));
const HIDDEN = Array.from(HIDDEN_PRODUCT_IDS);
const page = readFileSync("client/src/pages/learn/WhatAreKhavinsonPeptides.tsx", "utf8");

describe("Two Types examples never show hidden products", () => {
  it("one Cytogen and one Cytomax from the visible catalog", () => {
    expect(typeExamples().map((e) => [e.type, e.product.id])).toEqual([
      ["Cytogen", "cartalax"],
      ["Cytomax", "endoluten"],
    ]);
  });
  it("hidden ids are dropped even if the catalog contains them", () => {
    const dirty = allProducts.map((p) => (p.id === "cartalax" ? { ...p, id: "femalin" } : p));
    const ids = typeExamples(dirty).map((e) => e.product.id);
    for (const h of HIDDEN) expect(ids).not.toContain(h);
    const html = render(createElement(TwoTypes, { catalog: dirty }));
    for (const h of HIDDEN) expect(html).not.toContain(`/products/${h}"`);
  });
});

describe("Body-system nav", () => {
  it("tiles link to the store's system filter and carry no educational text", () => {
    const html = render(createElement(BodySystemNav));
    for (const t of BODY_SYSTEM_TILES) expect(html).toContain(`href="/products?system=${t.id}"`);
    expect(html.match(/<li/g)).toHaveLength(BODY_SYSTEM_TILES.length);
    expect(html.match(/<p[\s>]/g)).toHaveLength(1); // only the "Explore by Body System →" label
  });
});

describe("Pepita dock", () => {
  it("renders closed (never auto-opens) as an avatar-only button", () => {
    const html = render(createElement(AskPepitaDock));
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("/images/pepita/avatar-128.webp");
    expect(html).not.toContain("pepita-dock-menu\" class");
  });
  it("2–3 suggestions per section, prefilled via ?q=", () => {
    for (const qs of Object.values(PEPITA_SUGGESTIONS)) expect(qs.length).toBeGreaterThanOrEqual(2), expect(qs.length).toBeLessThanOrEqual(3);
    expect(askPepitaHref("What is a peptide?")).toBe("/ai-assistant?q=What+is+a+peptide%3F");
    expect(parsePeppyParams("?q=%20What%20is%20Endoluten%3F%20", () => false).question).toBe("What is Endoluten?");
    expect(parsePeppyParams("?q=" + "a".repeat(500), () => false).question).toHaveLength(300);
  });
});

describe("Page copy and order", () => {
  it("opens with Julia's H1, subhead and three paragraphs, in order, before anything else", () => {
    const order = [
      "What Are Khavinson Peptide Bioregulators?</h1>",
      "A different approach to peptide science.",
      "Peptides are tiny chains of amino acids—the same building blocks",
      "Khavinson peptide bioregulators are a group of short peptides",
      "It’s a developing area of research, and evidence for specific benefits varies by peptide.",
      "Two Types You’ll Find at Pure Fire",
      "Cytogens — Defined short peptides: ",
      "Cytomaxes — Natural peptide complexes: ",
      "<TwoTypes />",
      "Explore What Interests You",
      "<BodySystemNav />",
      "Want the deeper science? Visit The Short Peptide",
    ];
    const idx = order.map((s) => page.indexOf(s));
    expect(idx.every((i) => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    const main = page.slice(page.indexOf("<main"));
    expect(main.indexOf("<h1")).toBeLessThan(main.indexOf("<TwoTypes"));
    expect(main.slice(0, main.indexOf("<h1"))).not.toMatch(/<(img|svg|Molecule|Link)/);
  });
  it("Short Peptide link opens in a new tab", () => {
    expect(page).toMatch(/href="https:\/\/theshortpeptide\.com"\s+target="_blank"\s+rel="noopener noreferrer"/);
  });
  it("no banned claim language, figures or dosing on the page", () => {
    const html = [render(createElement(TwoTypes)), render(createElement(BodySystemNav)), page.replace(/This article is for educational purposes only\.[^<]*/, "")].join(" ");
    expect(html).not.toMatch(/mortality|lifespan|tumou?r|alzheimer|covid|atheroscl|oncoprotect|clinically proven|\bcures?\b|\bproven\b/i);
    expect(html).not.toMatch(/\b\d+\s*(months?|weeks?)\b|cycles? (per|a) year|capsules? (daily|a day)/i);
  });
});
