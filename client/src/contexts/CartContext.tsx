import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: "20" | "60";
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size?: "20" | "60") => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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

  // Save to localStorage whenever items change (but only after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, quantity: number = 1, size: "20" | "60" = "20") => {
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
  };

  const removeFromCart = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = (): number => {
    return items.reduce(
      (sum, item) => {
        const priceMultiplier = item.size === "60" ? 2.5 : 1;
        return sum + (item.product.priceUSD * priceMultiplier * item.quantity);
      },
      0
    );
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
