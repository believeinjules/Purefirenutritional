import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "@/data/products";
import { getUnitPriceUSD } from "@shared/product-prices";
import { fetchProducts } from "@/lib/productsStorage";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: "20" | "60";
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size?: "20" | "60") => void;
  removeFromCart: (productId: string, size?: "20" | "60") => void;
  updateQuantity: (productId: string, quantity: number, size?: "20" | "60") => void;
  clearCart: () => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/** Fields that affect what the shopper sees / is charged. */
function pricingSignature(p: Partial<Product> | undefined): string {
  if (!p) return "";
  return JSON.stringify([
    p.name,
    p.priceUSD,
    p.image ?? null,
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
          setItems(JSON.parse(saved));
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

  const addToCart = useCallback((product: Product, quantity: number = 1, size: "20" | "60" = "20") => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (i) => i.product.id === product.id && i.size === size
      );

      if (existingItem) {
        return currentItems.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [...currentItems, { product, quantity, size }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, size?: "20" | "60") => {
    setItems((currentItems) =>
      currentItems.filter((item) =>
        size
          ? !(item.product.id === productId && item.size === size)
          : item.product.id !== productId
      )
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, size?: "20" | "60") => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId && (size === undefined || item.size === size)
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

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
      const unit = getUnitPriceUSD(item.product, item.size);
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
