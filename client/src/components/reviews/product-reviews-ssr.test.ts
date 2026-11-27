import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render } from "../../entry-server";
import { getPdpContent } from "@shared/product-facts";
import { getProductById } from "@/data/products";
import { formatUSD } from "@shared/format-price";
import type { PublicReview } from "@shared/reviews";

const review: PublicReview = {
  id: "r-visible",
  productId: "anti-wrinkle-serum-7",
  displayName: "A. B.",
  date: "2026-10-20",
  text: "Visible serum review used to support the rating.",
  rating: 5,
  verified: true,
  kind: "product",
  tagLabel: "Verified buyer",
};

function ldBlocks(scriptTags: string): Array<Record<string, unknown>> {
  return Array.from(scriptTags.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)).map(
    (m) => JSON.parse(m[1]) as Record<string, unknown>,
  );
}

function ratingBlocks(scriptTags: string) {
  return ldBlocks(scriptTags).filter((b) => b.aggregateRating || b.review);
}

function visibleText(html: string): string {
  return html.replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/<!-- -->/g, "");
}

describe("product review markup", () => {
  it("emits aggregateRating only with the same visible review", () => {
    const { html, helmet } = render("/products/anti-wrinkle-serum-7", { reviews: [review] });
    expect(html).toContain(review.text);
    expect(html).toContain(review.displayName);
    expect(html).not.toContain("No reviews yet");
    const blocks = ratingBlocks(helmet.script.toString());
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.aggregateRating).toMatchObject({ ratingValue: 5, reviewCount: 1 });
    expect(blocks[0]?.review).toMatchObject([{ reviewBody: review.text, author: { name: review.displayName } }]);
  });

  it("does not emit aggregateRating when the page shows no reviews", () => {
    const { html, helmet } = render("/products/anti-wrinkle-serum-7");
    expect(html).toContain("No reviews yet");
    expect(html).not.toContain(review.text);
    expect(ratingBlocks(helmet.script.toString())).toEqual([]);
  });

  it("does not show or rate a review for a different product", () => {
    const other: PublicReview = { ...review, productId: "endoluten", text: "Not this serum." };
    const { html, helmet } = render("/products/anti-wrinkle-serum-7", { reviews: [other] });
    expect(html).toContain("No reviews yet");
    expect(html).not.toContain(other.text);
    expect(ratingBlocks(helmet.script.toString())).toEqual([]);
  });

  it("prerender does not attach a rating without the visible review text", () => {
    const src = fs.readFileSync(path.resolve(__dirname, "../../../../prerender.mjs"), "utf8");
    expect(src).not.toContain("withAggregateRating");
    expect(src).toContain("visibleProductReviews");
    expect(src).toContain("stripUnsupportedRating");
  });
});

describe("recommendation cards on the product page", () => {
  it("shows the corrected Brain, Joints, and Serum descriptions", () => {
    const cases = [
      ["prime-peptide-brain", "penetrates the blood-brain barrier"],
      ["prime-peptide-joints", "targeted cellular repair"],
      ["anti-wrinkle-serum-7", "deep wrinkle reduction"],
    ] as const;
    for (const [id, stale] of cases) {
      const html = visibleText(render(`/products/${id}`).html);
      const overview = getPdpContent(id)!.overview[0]!;
      expect(html, id).toContain(overview);
      expect(html, id).not.toContain(stale);
      expect(html, id).toContain(formatUSD(getProductById(id)!.priceUSD));
    }
  });
});
