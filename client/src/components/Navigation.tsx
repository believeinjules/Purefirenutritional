import { Link } from "wouter";
import { ShoppingCart, User, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const { items: wishlistItems } = useWishlist();
  
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav
      className="sticky top-0 z-50 bg-gradient-to-r from-orange-400 via-orange-300 to-rose-400 shadow-lg md:bg-gradient-to-r md:from-orange-500/70 md:via-orange-400/70 md:to-rose-500/70 md:backdrop-blur-lg"
      // Ensure Safari gets the backdrop filter as well
      style={{ WebkitBackdropFilter: 'blur(16px)' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-orange-200">
                <img 
                  src="/logo.png" 
                  alt="Pure Fire Nutritional" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-white hidden sm:block">
                Pure Fire Nutritional
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/">
              <a className="text-white font-medium px-4 py-2 rounded transition-all duration-200 hover:bg-orange-900/80 hover:text-orange-300 hover:drop-shadow-[0_0_8px_rgba(154,78,30,0.8)] hover:underline hover:underline-offset-4">
                Home
              </a>
            </Link>
            <Link href="/products">
              <a className="text-white font-medium px-4 py-2 rounded transition-all duration-200 hover:bg-orange-900/80 hover:text-orange-300 hover:drop-shadow-[0_0_8px_rgba(154,78,30,0.8)] hover:underline hover:underline-offset-4">
                Products
              </a>
            </Link>
            <Link href="/science">
              <a className="text-white font-medium px-4 py-2 rounded transition-all duration-200 hover:bg-orange-900/80 hover:text-orange-300 hover:drop-shadow-[0_0_8px_rgba(154,78,30,0.8)] hover:underline hover:underline-offset-4">
                Science
              </a>
            </Link>
            <Link href="/about">
              <a className="text-white font-medium px-4 py-2 rounded transition-all duration-200 hover:bg-orange-900/80 hover:text-orange-300 hover:drop-shadow-[0_0_8px_rgba(154,78,30,0.8)] hover:underline hover:underline-offset-4">
                About
              </a>
            </Link>
            <Link href="/faq">
              <a className="text-white font-medium px-4 py-2 rounded transition-all duration-200 hover:bg-orange-900/80 hover:text-orange-300 hover:drop-shadow-[0_0_8px_rgba(154,78,30,0.8)] hover:underline hover:underline-offset-4">
                FAQ
              </a>
            </Link>
            <Link href="/ai-assistant">
              <a className="text-white font-medium px-4 py-2 rounded transition-all duration-200 hover:bg-orange-900/80 hover:text-orange-300 hover:drop-shadow-[0_0_8px_rgba(154,78,30,0.8)] hover:underline hover:underline-offset-4">
                AI Assistant
              </a>
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            {/* Peptalk Podcast Logo */}
            <Link href="/peptalk">
              <a className="transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(154,78,30,0.8)]">
                <img 
                  src="/peptalk-logo.png" 
                  alt="Peptalk Podcast" 
                  className="h-12 w-auto object-contain"
                />
              </a>
            </Link>

            <Link href="/dashboard">
              <a className="text-white hover:text-red-300 transition-colors">
                <User className="h-6 w-6" />
              </a>
            </Link>
            
            <Link href="/wishlist">
              <a className="text-white hover:text-red-300 transition-colors relative">
                <Heart className="h-6 w-6" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </a>
            </Link>
            
            <Link href="/cart">
              <a className="text-white hover:text-red-300 transition-colors relative">
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </a>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-red-300 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/">
              <a className="block text-white font-medium hover:text-red-300 transition-colors py-2">
                Home
              </a>
            </Link>
            <Link href="/products">
              <a className="block text-white font-medium hover:text-red-300 transition-colors py-2">
                Products
              </a>
            </Link>
            <Link href="/science">
              <a className="block text-white font-medium hover:text-red-300 transition-colors py-2">
                Science
              </a>
            </Link>
            <Link href="/about">
              <a className="block text-white font-medium hover:text-red-300 transition-colors py-2">
                About
              </a>
            </Link>
            <Link href="/faq">
              <a className="block text-white font-medium hover:text-red-300 transition-colors py-2">
                FAQ
              </a>
            </Link>
            <Link href="/ai-assistant">
              <a className="block text-white font-medium hover:text-red-300 transition-colors py-2">
                AI Assistant
              </a>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
