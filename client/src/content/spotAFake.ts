/**
 * Copy for /how-to-spot-a-fake (Brand Advisor approved, Oct 2026).
 *
 * Items whose Brand copy contained [brackets] have an EMPTY data field here.
 * Empty fields are never rendered: the page shows the rest of that item's
 * sentence, or hides the item. Bracket text is never shown.
 *
 * DRAFT HANDLING: `published` stays false until Julia confirms the bracket
 * items. While false the page is noindex, not in the nav, not in the sitemap,
 * and not linked from product pages (it is only reachable by direct URL so
 * Julia can review it).
 */
import { SITE_TRUST } from "@/data/siteConfig";

export type FakeCheckItem = {
  title: string;
  /** Sentence(s) shown before the optional data field. */
  lead?: string;
  /** Optional data field; item part renders only when filled. */
  detail?: string;
  /** Sentence(s) always shown after. */
  tail?: string;
  /** Optional link shown only when `href` is set. */
  link?: { label: string; href: string };
};

export const SPOT_A_FAKE = {
  published: false,
  title: "How to tell you're getting the real thing",
  intro:
    "Khavinson bioregulators are copied and resold widely online. Here's what to check, from us or from anyone.",
  items: [
    {
      title: "Who sold it.",
      lead: "Buy from a retailer that can show its authorization.",
      // "Ours is here: [auth doc link]" — renders only when the URL is set.
      link: { label: "Ours is here.", href: SITE_TRUST.authorizationDocUrl },
    },
    {
      title: "The packaging.",
      // [manufacturer packaging description: box, blister or bottle, language on label]
      detail: "",
      lead: "Genuine product comes in",
      tail: "Be careful with relabeled or plain bottles.",
    },
    {
      title: "The seal.",
      // [Describe the genuine seal or hologram, if there is one.]
      detail: "",
      tail: "Don't take product if the seal is broken or missing.",
    },
    {
      title: "Lot and expiry.",
      tail:
        "Every genuine package carries a lot number and expiry date. Ours are listed on each product page so you can match them.",
    },
    {
      title: "The price.",
      tail: "Prices far below market usually mean the product is diverted, expired, or fake.",
    },
    {
      title: "The claims.",
      tail: "Real sellers don't promise cures. If a listing does, walk away.",
    },
  ] as FakeCheckItem[],
  closing: {
    text: "Questions about a product you already bought? Email",
    email: "info@purefirenutritional.com",
    after: "with the lot number and we'll help you check it.",
  },
};

/**
 * Text parts for one item with empty fields removed. Rules:
 *  - `lead` + `detail` form one sentence; if `detail` is empty and the item has
 *    a `detail` slot, that sentence is dropped (never "comes in .").
 *  - `link` renders only with a usable href.
 */
export function renderableItem(item: FakeCheckItem): {
  sentence?: string;
  tail?: string;
  link?: { label: string; href: string };
} | null {
  const hasDetailSlot = item.detail !== undefined;
  const detail = item.detail?.trim();
  let sentence: string | undefined;
  if (hasDetailSlot) {
    if (detail) sentence = item.lead ? `${item.lead} ${detail.replace(/\.$/, "")}.` : detail;
  } else if (item.lead) {
    sentence = item.lead;
  }
  const href = item.link?.href?.trim();
  const link = item.link && href && (/^https:\/\//i.test(href) || href.startsWith("/")) ? { label: item.link.label, href } : undefined;
  const tail = item.tail?.trim() || undefined;
  if (!sentence && !tail && !link) return null;
  return { sentence, tail, link };
}

/** Bracket text must never reach customers. */
export function containsBracketPlaceholder(text: string): boolean {
  return /\[[^\]]*\]/.test(text);
}
