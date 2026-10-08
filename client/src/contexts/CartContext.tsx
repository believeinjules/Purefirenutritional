import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "@/data/products";
import { getCartLineUnitUSD } from "@shared/product-prices";
import { fetchProducts } from "@/lib/productsStorage";

/** 2 or 3 = a cycle bundle of that many bottles; absent = single bottle. */
export type CartBundle = 2 | 3;

export interface CartItem {
  product: Product;
  /** Single bottles, or number of bundles when `bundle` is set. */
  quantity: number;
  size?: "20" | "60";
  bundle?: CartBundle;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size?: "20" | "60", bundle?: CartBundle) => void;
  removeFromCart: (productId: string, size?: "20" | "60", bundle?: CartBundle | null) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    size?: "20" | "60",
    bundle?: CartBundle | null
  ) => void;
  clearCart: () => void;
  getTotal: () => number;
}

/** Same line = same product + size + bundle (a bundle and single bottles stay separate lines). */
function sameLine(item: CartItem, productId: string, size?: string, bundle?: CartBundle | null): boolean {
  return (
    item.product.id === productId &&
    (size === undefined || item.size === size) &&
    (bundle === undefined || (item.bundle ?? null) === (bundle ?? null))
  );
}

function normalizeBundle(value: unknown): CartBundle | undefined {
  return value === 2 || value === 3 ? value : undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/** Fields that affect what the shopper sees / is charged. */
function pricingSignature(p: Partial<Product> | undefined): string {
  if (!p) return "";
  return JSON.stringify([
    p.name,
    p.priceUSD,
    p.image ?? null,
    p.bundlesEnabled ?? null,
    p.bundleDiscountsUSD ?? null,
    (p.variants ?? []).map((v) => [v.id, v.name, v.priceUSD, v.inStock !== false]),
  ]);
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize with empty array, load from localStorage after mount
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("cart");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setItems(
            Array.isArray(parsed)
              ? parsed.map((i: CartItem) => {
                  const bundle = normalizeBundle(i?.bundle);
                  const { bundle: _drop, ...rest } = i ?? ({} as CartItem);
                  return bundle ? { ...rest, bundle } : rest;
                })
              : []
          );
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Cart items store a product snapshot from when they were added. Refresh it
  // from the live catalog (Firestore, with code fallback) so the cart shows the
  // same prices checkout will charge, even after an admin price change.
  const [liveProducts, setLiveProducts] = useState<Map<string, Product> | null>(null);
  const hasItems = items.length > 0;

  useEffect(() => {
    if (!isLoaded || liveProducts || !hasItems) return;
    let cancelled = false;
    fetchProducts()
      .then((list) => {
        if (cancelled) return;
        setLiveProducts(new Map(list.map((p) => [p.id, p as unknown as Product])));
      })
      .catch((err) => console.error("Failed to refresh cart prices", err));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, liveProducts, hasItems]);

  useEffect(() => {
    if (!liveProducts) return;
    setItems((current) => {
      let changed = false;
      const next = current.map((item) => {
        const live = liveProducts.get(item.product.id);
        if (!live || pricingSignature(live) === pricingSignature(item.product)) {
          return item;
        }
        changed = true;
        return { ...item, product: live };
      });
      return changed ? next : current;
    });
  }, [liveProducts, items]);

  // Save to localStorage whenever items change (but only after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = useCallback(
    (product: Product, quantity: number = 1, size: "20" | "60" = "20", bundle?: CartBundle) => {
      const b = normalizeBundle(bundle);
      setItems((currentItems) => {
        const existingItem = currentItems.find((i) => sameLine(i, product.id, size, b ?? null));

        if (existingItem) {
          return currentItems.map((i) =>
            sameLine(i, product.id, size, b ?? null) ? { ...i, quantity: i.quantity + quantity } : i
          );
        }

        return [...currentItems, b ? { product, quantity, size, bundle: b } : { product, quantity, size }];
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string, size?: "20" | "60", bundle?: CartBundle | null) => {
      setItems((currentItems) => currentItems.filter((item) => !sameLine(item, productId, size, bundle)));
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, size?: "20" | "60", bundle?: CartBundle | null) => {
      if (quantity <= 0) {
        removeFromCart(productId, size, bundle);
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) => (sameLine(item, productId, size, bundle) ? { ...item, quantity } : item))
      );
    },
    [removeFromCart]
  );

  // Stable identity + no-op when already empty, so effects that call
  // clearCart (e.g. the checkout success page) cannot loop. Also clears storage
  // synchronously: a child page's mount effect runs before this provider's
  // load-from-localStorage effect, which would otherwise restore the old cart.
  const clearCart = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart");
    }
    setItems((current) => (current.length === 0 ? current : []));
  }, []);

  const getTotal = (): number => {
    return items.reduce((sum, item) => {
      // Bundle lines use the same bundle math as checkout (shared/bundle-pricing.ts).
      const unit = getCartLineUnitUSD(item.product, item.size, item.bundle);
      if (typeof unit !== "number" || !Number.isFinite(unit)) return sum;
      return sum + unit * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
