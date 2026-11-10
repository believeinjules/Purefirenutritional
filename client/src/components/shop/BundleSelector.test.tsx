// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BundleSelector, { storefrontOptionLabel } from "./BundleSelector";
import { getStorefrontBundleOffers } from "@shared/bundle-pricing";
import { getProductById, type Product } from "@/data/products";
import { getCartLineUnitUSD } from "@shared/product-prices";

afterEach(cleanup);

const product = (overrides: Partial<Product> & { priceUSD?: number; variants?: Product["variants"]; bundlesEnabled?: boolean } = {}) =>
  ({
    id: "test-product",
    name: "Test",
    priceUSD: 77.99,
    variants: [
      { id: "20-count", name: "20 Capsules", priceUSD: 77.99, priceEUR: 0, inStock: true },
      { id: "60-count", name: "60 Capsules", priceUSD: 199.99, priceEUR: 0, inStock: true },
    ],
    ...overrides,
  }) as Parameters<typeof BundleSelector>[0]["product"];

function optionTexts(select: HTMLElement) {
  return within(select).getAllByRole("option").map((o) => o.textContent);
}

describe("storefrontOptionLabel", () => {
  it("formats the 60-cap single and pack lines", () => {
    expect(storefrontOptionLabel({ title: "1 bottle (60 capsules)", totalCents: 14949 })).toBe(
      "1 bottle (60 capsules) — $149.49",
    );
    expect(
      storefrontOptionLabel({ title: "2 × 60 capsules", totalCents: 27900, savingsCents: 1998, regularCents: 29898 }),
    ).toBe("2 × 60 capsules — $279.00 (save 7%)");
    expect(
      storefrontOptionLabel({ title: "60 + 20 capsules", totalCents: 17749, savingsCents: 2700, regularCents: 20449 }),
    ).toBe("60 + 20 capsules — $177.49 (save 13%)");
  });
});

describe("BundleSelector (Buy More & Save, 60-cap only)", () => {
  it("is hidden when the 20-cap size is selected", () => {
    const { container } = render(
      <BundleSelector product={product()} singlePriceUSD={77.99} size="20" value={1} onChange={() => {}} />,
    );
    expect(container.innerHTML).toBe("");
    expect(screen.queryByLabelText("Buy More & Save")).toBeNull();
  });

  it("is hidden on a single-size product", () => {
    const { container } = render(
      <BundleSelector
        product={product({ variants: [{ id: "20-count", name: "20 Capsules", priceUSD: 77.99, priceEUR: 0, inStock: true }] })}
        singlePriceUSD={77.99}
        size="20"
        value={1}
        onChange={() => {}}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("Cerluten 60-cap: labelled native <select> with 60, 2×60 and 60+20", () => {
    const cerluten = getProductById("cerluten")!;
    const onChange = vi.fn();
    render(
      <BundleSelector product={cerluten} singlePriceUSD={149.49} size="60" value={1} onChange={onChange} />,
    );
    const select = screen.getByLabelText("Buy More & Save") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select.value).toBe("1");
    expect(getStorefrontBundleOffers(cerluten).map((o) => o.kind)).toEqual(["2x60", "60+20"]);
    expect(optionTexts(select)).toEqual([
      "1 bottle (60 capsules) — $149.49",
      "2 × 60 capsules — $279.00 (save 7%)",
      "60 + 20 capsules — $177.49 (save 13%)",
    ]);
  });

  it("changing the dropdown passes the pack kind on", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const cerluten = getProductById("cerluten")!;
    render(
      <BundleSelector product={cerluten} singlePriceUSD={149.49} size="60" value={1} onChange={onChange} />,
    );
    await user.selectOptions(screen.getByLabelText("Buy More & Save"), "60+20");
    expect(onChange).toHaveBeenCalledWith("60+20");
  });

  it("renders nothing when bundles are disabled", () => {
    const { container } = render(
      <BundleSelector
        product={product({ bundlesEnabled: false })}
        singlePriceUSD={199.99}
        size="60"
        value={1}
        onChange={() => {}}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("Prime Peptide (legacy) keeps the card picker and Cycle bundles legend", () => {
    render(
      <BundleSelector
        product={{ id: "prime-peptide-brain", name: "Prime", priceUSD: 139.99, variants: [] } as Parameters<typeof BundleSelector>[0]["product"]}
        singlePriceUSD={139.99}
        value={1}
        onChange={() => {}}
        legacy
      />,
    );
    expect(screen.getByText("Cycle bundles")).toBeTruthy();
    expect(screen.queryByLabelText("Buy More & Save")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });
});

const addToCart = vi.fn();
let productId = "cerluten";
vi.mock("wouter", async (orig) => ({ ...(await orig<typeof import("wouter")>()), useParams: () => ({ id: productId }) }));
vi.mock("@/contexts/CartContext", () => ({ useCart: () => ({ addToCart, items: [] }) }));
vi.mock("@/contexts/WishlistContext", () => ({ useWishlist: () => ({ addItem: vi.fn(), removeItem: vi.fn(), isInWishlist: () => false }) }));
vi.mock("@/lib/productsStorage", () => ({ fetchProductById: async (id: string) => getProductById(id) ?? null }));
vi.mock("@/lib/reviewsApi", () => ({ useReviewSummaries: () => ({}) }));
vi.mock("@/components/Navigation", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/components/reviews/ProductReviews", () => ({ default: () => null }));
vi.mock("@/components/FrequentlyBoughtTogether", () => ({ default: () => null }));
vi.mock("@/components/shop/SimilarProducts", () => ({ default: () => null }));
vi.mock("@/components/guidance/AskPeppyButton", () => ({ default: () => null }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

async function renderPdp(id: string) {
  productId = id;
  addToCart.mockClear();
  const { HelmetProvider } = await import("react-helmet-async");
  const { default: ProductDetail } = await import("@/pages/ProductDetail");
  return render(
    <HelmetProvider>
      <ProductDetail />
    </HelmetProvider>,
  );
}

describe("product page Buy More & Save (60-cap only)", () => {
  it("Cerluten 20-cap: no Buy More & Save; Add to Cart is a single 20", async () => {
    const user = userEvent.setup();
    await renderPdp("cerluten");
    expect(screen.queryByLabelText("Buy More & Save")).toBeNull();
    await user.click(screen.getByRole("button", { name: /^add to cart$/i }));
    expect(addToCart).toHaveBeenCalledTimes(1);
    expect(addToCart.mock.calls[0][0].id).toBe("cerluten");
    expect(addToCart.mock.calls[0][2]).toBe("20");
    expect(addToCart.mock.calls[0][3]).toBeUndefined();
  });

  it("Cerluten 60-cap: choosing 60 + 20 updates the Add to Cart total and payload", async () => {
    const user = userEvent.setup();
    const p = getProductById("cerluten")!;
    const v60 = p.variants!.find((v) => v.id === "60-count")!;
    await renderPdp("cerluten");
    const size = (await screen.findByLabelText("Size")) as HTMLSelectElement;
    await user.selectOptions(size, v60.id);
    await waitFor(() => expect(size.value).toBe(v60.id));

    const select = (await screen.findByLabelText("Buy More & Save")) as HTMLSelectElement;
    expect(optionTexts(select)[2]).toBe("60 + 20 capsules — $177.49 (save 13%)");
    await user.selectOptions(select, "60+20");
    await waitFor(() => expect(select.value).toBe("60+20"));
    const total = getCartLineUnitUSD(p, "60", "60+20")!;
    expect(total).toBe(177.49);
    expect(screen.getByRole("button", { name: /add 60 \+ 20 ·/i }).textContent).toBe(
      `Add 60 + 20 · $${total.toFixed(2)}`,
    );

    await user.click(screen.getByRole("button", { name: /add 60 \+ 20 ·/i }));
    expect(addToCart).toHaveBeenCalledTimes(1);
    expect(addToCart.mock.calls[0][0].id).toBe("cerluten");
    expect(addToCart.mock.calls[0][2]).toBe("60");
    expect(addToCart.mock.calls[0][3]).toBe("60+20");
  });
});
