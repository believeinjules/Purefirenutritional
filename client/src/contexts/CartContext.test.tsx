// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { getProductById } from "@/data/products";

vi.mock("@/lib/productsStorage", () => ({ fetchProducts: vi.fn(async () => []) }));
vi.mock("@/lib/dailyFire", () => ({ notifyAddedToCart: vi.fn() }));

import { CartProvider, useCart, type CartItem } from "./CartContext";

let seen: CartItem[] = [];
function Probe() {
  seen = useCart().items;
  return null;
}

describe("saved carts with a retired Khavinson deal", () => {
  beforeEach(() => {
    localStorage.clear();
    seen = [];
  });

  it("quietly turns Khavinson packs into single bottles and keeps Prime Peptide deals", async () => {
    const gotratix = getProductById("gotratix")!;
    const endoluten = getProductById("endoluten")!;
    const brain = getProductById("prime-peptide-brain")!;
    localStorage.setItem(
      "cart",
      JSON.stringify([
        { product: gotratix, quantity: 1, size: "60", bundle: "3x60" },
        { product: gotratix, quantity: 1, size: "60" },
        { product: endoluten, quantity: 2, size: "60", bundle: "2x60" },
        { product: endoluten, quantity: 1, size: "60", bundle: "60+20" },
        { product: brain, quantity: 1, size: "20", bundle: 2 },
      ])
    );
    render(
      <CartProvider>
        <Probe />
      </CartProvider>
    );
    await waitFor(() => expect(seen.some((i) => i.product.id !== "prime-peptide-brain" && i.bundle)).toBe(false));
    await waitFor(() => expect(seen.map((i) => [i.product.id, i.size, i.quantity, i.bundle ?? null])).toHaveLength(3));
    const line = (id: string) => seen.find((i) => i.product.id === id)!;
    expect(line("gotratix")).toMatchObject({ size: "60", quantity: 4 });
    expect(line("gotratix").bundle).toBeUndefined();
    expect(line("endoluten")).toMatchObject({ size: "60", quantity: 6 });
    expect(line("endoluten").bundle).toBeUndefined();
    expect(line("prime-peptide-brain").bundle).toBe(2);
  });
});
