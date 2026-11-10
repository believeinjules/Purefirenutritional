// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VariantSelector, { variantCountLabel } from "./VariantSelector";
import { getProductById, type ProductVariant } from "@/data/products";

afterEach(cleanup);

const v = (id: string, name: string, priceUSD: number, inStock = true): ProductVariant => ({ id, name, priceUSD, priceEUR: 0, inStock });

describe("VariantSelector (native size dropdown)", () => {
  it("labels are the capsule count only (no days, months or $/day)", () => {
    expect(variantCountLabel({ name: "20 Capsules" })).toBe("20 Capsules");
    expect(variantCountLabel({ name: "60 capsules (30-day cycle)" })).toBe("60 Capsules");
    expect(variantCountLabel({ name: "90 tablets · 1 month" })).toBe("90 Tablets");
    expect(variantCountLabel({ name: "Lingual 15 ml" })).toBe("Lingual 15 ml");
  });

  it("renders a labelled native <select> listing the sizes; changing it passes the variant on", async () => {
    const user = userEvent.setup();
    const variants = [v("20-count", "20 Capsules", 77.99), v("60-count", "60 Capsules (30 days)", 199.99)];
    const onChange = vi.fn();
    render(<VariantSelector variants={variants} selectedVariant={variants[0]} onVariantChange={onChange} />);
    const select = screen.getByLabelText("Size") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select.value).toBe("20-count");
    expect(within(select).getAllByRole("option").map((o) => o.textContent)).toEqual(["20 Capsules", "60 Capsules"]);
    expect(select.textContent).not.toMatch(/day|month|\$/i);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    await user.selectOptions(select, "60-count");
    expect(onChange).toHaveBeenCalledWith(variants[1]);
  });

  it("out-of-stock sizes stay listed but cannot be chosen (as the old buttons)", () => {
    const variants = [v("20-count", "20 Capsules", 10), v("60-count", "60 Capsules", 20, false)];
    render(<VariantSelector variants={variants} selectedVariant={variants[0]} onVariantChange={() => {}} />);
    const opt = screen.getByRole("option", { name: "60 Capsules (out of stock)" }) as HTMLOptionElement;
    expect(opt.disabled).toBe(true);
  });

  it("one size: plain text, no dropdown", () => {
    const variants = [v("20-count", "20 Capsules", 10)];
    render(<VariantSelector variants={variants} selectedVariant={variants[0]} onVariantChange={() => {}} />);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByTestId("variant-single").textContent).toBe("Size: 20 Capsules");
  });
});

// ── Product page wiring: price, bundles and Add to Cart follow the dropdown ──────────────
const addToCart = vi.fn();
vi.mock("wouter", async (orig) => ({ ...(await orig<typeof import("wouter")>()), useParams: () => ({ id: "bonomarlot" }) }));
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

describe("product page size dropdown", () => {
  it("Bonomarlot: 60 Capsules updates the price and adds the 60 size to the cart", async () => {
    const { HelmetProvider } = await import("react-helmet-async");
    const { default: ProductDetail } = await import("@/pages/ProductDetail");
    const user = userEvent.setup();
    const p = getProductById("bonomarlot")!;
    const [v20, v60] = p.variants!;
    render(
      <HelmetProvider>
        <ProductDetail />
      </HelmetProvider>,
    );
    const select = (await screen.findByLabelText("Size")) as HTMLSelectElement;
    expect(document.body.textContent).toContain(`$${v20.priceUSD.toFixed(2)}`);
    expect(screen.queryByText(/Select Size \/ Format/)).toBeNull();

    await user.selectOptions(select, v60.id);
    await waitFor(() => expect(select.value).toBe(v60.id));
    const priceBlock = screen.getByTestId("product-facts").parentElement!;
    expect(priceBlock.textContent).toContain(`$${v60.priceUSD.toFixed(2)}`);
    expect(priceBlock.textContent).not.toContain(`$${v20.priceUSD.toFixed(2)}`);
    expect(screen.getByTestId("product-facts").textContent).toBe("60 Capsules");

    await user.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(addToCart).toHaveBeenCalledTimes(1);
    expect(addToCart.mock.calls[0][0].id).toBe("bonomarlot");
    expect(addToCart.mock.calls[0][2]).toBe("60");
  });
});
