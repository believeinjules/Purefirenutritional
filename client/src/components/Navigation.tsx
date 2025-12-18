import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingCart, Flame, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const { user } = useAuth();
  const { getWishlistCount } = useWishlist();
  const wishlistCount = getWishlistCount();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/science", label: "Science" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/ai-assistant", label: "AI Assistant" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 shadow-lg" style={{background: 'linear-gradient(to right, rgb(253, 186, 116), rgb(253, 186, 116), rgb(251, 113, 133)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-white font-bold text-xl">
            <div className="bg-white rounded-full p-0.5 h-12 w-12 flex items-center justify-center overflow-hidden">
              <img src="/logo-flame.jpeg" alt="Pure Fire Nutritional Logo" className="h-full w-full object-cover rounded-full" />
            </div>
            <span className="hidden sm:inline text-lg font-bold">Pure Fire Nutritional</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-white hover:text-yellow-200 transition-colors font-medium ${
                  isActive(link.href) ? "text-yellow-200 underline underline-offset-4" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            {/* Peptalk Logo */}
            <Link href="/peptalk" className="flex items-center">
              <img src="/peptalk-logo.png" alt="Peptalk! The Podcast" className="h-8 hover:opacity-80 transition-opacity" />
            </Link>

            {/* User Account */}
            <Link href={user ? "/dashboard" : "/login"} className="text-white hover:text-yellow-200">
              <User className="w-6 h-6" />
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative text-white hover:text-yellow-200">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-white hover:text-yellow-200">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-white hover:text-yellow-200 py-2 px-4 rounded transition-colors ${
                    isActive(link.href) ? "bg-white/20 text-yellow-200" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
