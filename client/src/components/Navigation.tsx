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
            <a className="flex items-center gap-4 hover:opacity-85 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center ring-2 ring-orange-200 overflow-hidden">
                <img 
                  src="/logo-flame.jpeg" 
                  alt="Pure Fire Nutritional" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="text-3xl font-bold text-white hidden sm:block">
                Pure Fire Nutritional
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-9">
            <Link href="/">
              <a className="text-white font-medium text-sm md:text-base px-4 py-2 rounded transition-all duration-200 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                Home
              </a>
            </Link>
            <Link href="/products">
              <a className="text-white font-medium text-sm md:text-base px-4 py-2 rounded transition-all duration-200 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                Products
              </a>
            </Link>
            <Link href="/science">
              <a className="text-white font-medium text-sm md:text-base px-4 py-2 rounded transition-all duration-200 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                Science
              </a>
            </Link>
            <Link href="/about">
              <a className="text-white font-medium text-sm md:text-base px-4 py-2 rounded transition-all duration-200 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                About
              </a>
            </Link>
            <Link href="/faq">
              <a className="text-white font-medium text-sm md:text-base px-4 py-2 rounded transition-all duration-200 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                FAQ
              </a>
            </Link>
            <Link href="/ai-assistant">
              <a className="text-white font-medium text-sm md:text-base px-4 py-2 rounded transition-all duration-200 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                AI Assistant
              </a>
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            {/* Peptalk Podcast Logo */}
            <Link href="/peptalk">
              <a className="transition-all duration-200 hover:scale-110 inline-block">
                <img 
                  src="/peptalk-logo.png" 
                  alt="Peptalk Podcast" 
                  className="h-14 w-auto object-contain hover:drop-shadow-[0_0_10px_rgba(200,50,50,0.9)]"
                />
              </a>
            </Link>

            <Link href="/dashboard">
              <a className="text-white transition-all hover:drop-shadow-[0_0_10px_rgba(200,50,50,0.9)] hover:scale-110 inline-block">
                <User className="h-7 w-7" />
              </a>
            </Link>
            
            <Link href="/wishlist">
              <a className="text-white transition-all hover:drop-shadow-[0_0_10px_rgba(200,50,50,0.9)] hover:scale-110 relative inline-block">
                <Heart className="h-7 w-7" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </a>
            </Link>
            
            <Link href="/cart">
              <a className="text-white transition-all hover:drop-shadow-[0_0_10px_rgba(200,50,50,0.9)] hover:scale-110 relative inline-block">
                <ShoppingCart className="h-7 w-7" />
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
              className="md:hidden text-white transition-all hover:drop-shadow-[0_0_10px_rgba(200,50,50,0.9)]"
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/">
              <a className="block text-white font-semibold text-lg transition-all py-2 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                Home
              </a>
            </Link>
            <Link href="/products">
              <a className="block text-white font-semibold text-lg transition-all py-2 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                Products
              </a>
            </Link>
            <Link href="/science">
              <a className="block text-white font-semibold text-lg transition-all py-2 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                Science
              </a>
            </Link>
            <Link href="/about">
              <a className="block text-white font-semibold text-lg transition-all py-2 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                About
              </a>
            </Link>
            <Link href="/faq">
              <a className="block text-white font-semibold text-lg transition-all py-2 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                FAQ
              </a>
            </Link>
            <Link href="/ai-assistant">
              <a className="block text-white font-semibold text-lg transition-all py-2 hover:[text-shadow:0_0_7px_rgba(200,50,50,0.9)] hover:underline hover:underline-offset-8 hover:scale-125">
                AI Assistant
              </a>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
