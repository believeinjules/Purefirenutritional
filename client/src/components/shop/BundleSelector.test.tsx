// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BundleSelector, { bundleOptionLabel } from "./BundleSelector";
import { getBundleOffer, getBundleOffers } from "@shared/bundle-pricing";
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
  }) as BundleSelectorProduct;

type BundleSelectorProduct = Parameters<typeof BundleSelector>[0]["product"];

function optionTexts(select: HTMLElement) {
  return within(select).getAllByRole("option").map((o) => o.textContent);
}

describe("bundleOptionLabel", () => {
  it("formats the single bottle and bundle lines Julia asked for", () => {
    expect(bundleOptionLabel({ bottles: 1, totalCents: 7799, singleBottleCents: 7799 })).toBe("1 bottle — $77.99");
    expect(
      bundleOptionLabel({ bottles: 2, totalCents: 14798, savingsCents: 800, singleBottleCents: 7799 }),
    ).toBe("2 bottles — $147.98 (save 5%)");
    expect(
      bundleOptionLabel({ bottles: 3, totalCents: 20997, savingsCents: 2400, singleBottleCents: 7799 }),
    ).toBe("3 bottles — $209.97 (save 10%)");
  });
});

describe("BundleSelector (Buy More & Save dropdown)", () => {
  it("is a labelled native <select> whose options use bottle count, price and save %", () => {
    const onChange = vi.fn();
    const p = product();
    render(
      <BundleSelector product={p} singlePriceUSD={77.99} size="20" value={1} onChange={onChange} />,
    );
    const select = screen.getByLabelText("Buy More & Save") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select.value).toBe("1");
    const offers = getBundleOffers(p, 77.99, { size: "20" });
    expect(offers.map((o) => o.bottles).sort()).toEqual([2, 3]);
    expect(optionTexts(select)).toEqual([
      "1 bottle — $77.99",
      "2 bottles — $147.98 (save 5%)",
      "3 bottles — $209.97 (save 10%)",
    ]);
    expect(screen.queryByText(/^Bundles$/)).toBeNull();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("changing the dropdown passes the bundle size on", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BundleSelector product={product()} singlePriceUSD={77.99} size="20" value={1} onChange={onChange} />,
    );
    await user.selectOptions(screen.getByLabelText("Buy More & Save"), "2");
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("Cerluten 20-cap: all three options are shown, and 3 bottles costs more than the 60-cap bottle", () => {
    const cerluten = getProductById("cerluten")!;
    const onChange = vi.fn();
    render(
      <BundleSelector product={cerluten} singlePriceUSD={59.99} size="20" value={1} onChange={onChange} />,
    );
    const select = screen.getByLabelText("Buy More & Save") as HTMLSelectElement;
    expect(optionTexts(select)).toEqual([
      "1 bottle — $59.99",
      "2 bottles — $111.98 (save 7%)",
      "3 bottles — $155.97 (save 13%)",
    ]);
    expect(getBundleOffers(cerluten, 59.99, { size: "20" }).map((o) => o.bottles)).toEqual([2, 3]);
    expect(getCartLineUnitUSD(cerluten, "20", 3)).toBe(155.97);
    expect(155.97).toBeGreaterThan(cerluten.variants!.find((v) => v.id === "60-count")!.priceUSD);
  });

  it("still hides a 3-bottle 20-cap option when that bundle would undercut the 60-cap price", () => {
    // Safety net: previous $58.99 20-cap price against Cerluten's unchanged $153.99 60-cap bottle.
    const cerluten = getProductById("cerluten")!;
    render(
      <BundleSelector product={cerluten} singlePriceUSD={58.99} size="20" value={1} onChange={() => {}} />,
    );
    const select = screen.getByLabelText("Buy More & Save") as HTMLSelectElement;
    expect(optionTexts(select)).toEqual(["1 bottle — $58.99", "2 bottles — $109.98 (save 7%)"]);
    expect(getBundleOffer(cerluten, 58.99, 3, { size: "20" })).toBeNull();
  });

  it("renders nothing when no bundle is offered", () => {
    const { container } = render(
      <BundleSelector
        product={product({ bundlesEnabled: false })}
        singlePriceUSD={77.99}
        size="20"
        value={1}
        onChange={() => {}}
      />,
    );
    expect(container.innerHTML).toBe("");
    expect(screen.queryByLabelText("Buy More & Save")).toBeNull();
  });

  it("Prime Peptide (legacy) keeps the card picker and Cycle bundles legend", () => {
    render(
      <BundleSelector
        product={product()}
        singlePriceUSD={77.99}
        size="20"
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

// ── Product page wiring: price display and Add to Cart follow the dropdown ──────────────
const addToCart = vi.fn();
let productId = "bonomarlot";
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

describe("product page Buy More & Save dropdown", () => {
  it("Bonomarlot: choosing 2 bottles updates the Add to Cart total and payload", async () => {
    const user = userEvent.setup();
    const p = getProductById("bonomarlot")!;
    await renderPdp("bonomarlot");
    const select = (await screen.findByLabelText("Buy More & Save")) as HTMLSelectElement;
    expect(select.value).toBe("1");
    expect(screen.getByRole("button", { name: /add to cart/i }).textContent).toMatch(/Add to Cart/i);

    await user.selectOptions(select, "2");
    await waitFor(() => expect(select.value).toBe("2"));
    const total = getCartLineUnitUSD(p, "20", 2)!;
    expect(screen.getByRole("button", { name: /add 2 bottles/i }).textContent).toBe(
      `Add 2 bottles · $${total.toFixed(2)}`,
    );

    await user.click(screen.getByRole("button", { name: /add 2 bottles/i }));
    expect(addToCart).toHaveBeenCalledTimes(1);
    expect(addToCart.mock.calls[0][0].id).toBe("bonomarlot");
    expect(addToCart.mock.calls[0][1]).toBe(1);
    expect(addToCart.mock.calls[0][2]).toBe("20");
    expect(addToCart.mock.calls[0][3]).toBe(2);
  });

  it("Cerluten 60-cap: choosing 3 bottles adds a 3-bottle bundle of the 60 size", async () => {
    const user = userEvent.setup();
    const p = getProductById("cerluten")!;
    const v60 = p.variants!.find((v) => v.id === "60-count")!;
    await renderPdp("cerluten");
    const size = (await screen.findByLabelText("Size")) as HTMLSelectElement;
    await user.selectOptions(size, v60.id);
    await waitFor(() => expect(size.value).toBe(v60.id));

    const select = screen.getByLabelText("Buy More & Save") as HTMLSelectElement;
    expect(optionTexts(select)).toEqual([
      "1 bottle — $153.99",
      "2 bottles — $299.98 (save 3%)",
      "3 bottles — $437.97 (save 5%)",
    ]);
    await user.selectOptions(select, "3");
    await waitFor(() => expect(select.value).toBe("3"));
    const total = getCartLineUnitUSD(p, "60", 3)!;
    expect(screen.getByRole("button", { name: /add 3 bottles/i }).textContent).toBe(
      `Add 3 bottles · $${total.toFixed(2)}`,
    );

    await user.click(screen.getByRole("button", { name: /add 3 bottles/i }));
    expect(addToCart).toHaveBeenCalledTimes(1);
    expect(addToCart.mock.calls[0][0].id).toBe("cerluten");
    expect(addToCart.mock.calls[0][2]).toBe("60");
    expect(addToCart.mock.calls[0][3]).toBe(3);
  });

  it("a single bottle still adds with no bundle argument", async () => {
    const user = userEvent.setup();
    await renderPdp("bonomarlot");
    await screen.findByLabelText("Buy More & Save");
    await user.click(screen.getByRole("button", { name: /^add to cart$/i }));
    expect(addToCart).toHaveBeenCalledTimes(1);
    expect(addToCart.mock.calls[0][3]).toBeUndefined();
  });
});
