import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  type WishlistItem
} from '@/lib/wishlistStorage';

interface WishlistContextType {
  wishlist: WishlistItem[];
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isItemInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerEmail, setCustomerEmail] = useState<string>('guest@example.com'); // Default guest email

  useEffect(() => {
    loadWishlist();
  }, [customerEmail]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const items = await getWishlist(customerEmail);
      setWishlist(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string) => {
    try {
      await addToWishlist(customerEmail, productId);
      await loadWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await removeFromWishlist(customerEmail, productId);
      await loadWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const isItemInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.productId === productId);
  };

  const getWishlistCount = (): number => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addItem,
        removeItem,
        isItemInWishlist,
        getWishlistCount,
        loading
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
