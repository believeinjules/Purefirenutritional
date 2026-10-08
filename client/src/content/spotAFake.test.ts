import { describe, expect, it } from "vitest";
import { SPOT_A_FAKE, containsBracketPlaceholder, renderableItem } from "./spotAFake";

describe("/how-to-spot-a-fake content", () => {
  it("stays unpublished (noindex, out of nav/sitemap) until Julia confirms", () => {
    expect(SPOT_A_FAKE.published).toBe(false);
  });

  it("never renders bracket placeholder text", () => {
    const all = [SPOT_A_FAKE.title, SPOT_A_FAKE.intro, SPOT_A_FAKE.closing.text, SPOT_A_FAKE.closing.after];
    for (const item of SPOT_A_FAKE.items) {
      const r = renderableItem(item);
      if (r) all.push(r.sentence ?? "", r.tail ?? "", r.link?.label ?? "");
    }
    for (const text of all) expect(containsBracketPlaceholder(text), text).toBe(false);
  });

  it("drops the half-sentence when a data field is empty, and shows it when filled", () => {
    const packaging = SPOT_A_FAKE.items[1];
    expect(renderableItem(packaging)).toEqual({
      sentence: undefined,
      tail: "Be careful with relabeled or plain bottles.",
      link: undefined,
    });
    expect(renderableItem({ ...packaging, detail: "a printed box with a blister pack" })?.sentence).toBe(
      "Genuine product comes in a printed box with a blister pack."
    );
  });

  it("shows the authorization link only once a URL is set", () => {
    const who = SPOT_A_FAKE.items[0];
    expect(renderableItem({ ...who, link: { label: "Ours is here.", href: "" } })?.link).toBeUndefined();
    expect(renderableItem({ ...who, link: { label: "Ours is here.", href: "/docs/auth.pdf" } })?.link).toEqual({
      label: "Ours is here.",
      href: "/docs/auth.pdf",
    });
  });
});
