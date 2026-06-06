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

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Science", href: "/science" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "AI Assistant", href: "/ai-assistant" },
  ];

  return (
    <nav style={{ backgroundColor: "rgba(51, 9, 22, 0.82)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} className="sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* Logo + Wordmark */}
          <Link href="/" className="nav-scale flex items-center gap-3">
              {/* Flame logo — mix-blend-mode: lighten removes white bg on dark nav */}
              <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: "transparent" }}>
                <img
                  src="/logo-flame.jpeg"
                  alt="Pure Fire Nutritional"
                  className="w-[115%] h-[115%] object-cover"
                  style={{ mixBlendMode: "lighten" }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 300,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontSize: "13px",
                  color: "#fff",
                  lineHeight: 1.3,
                }}
                className="hidden sm:block"
              >
                Pure Fire<br />Nutritional
              </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(({ label, href }) => (
              <Link key={href} href={href} className="nav-link">{label}</Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Peptalk */}
            <Link href="/peptalk" className="nav-scale inline-block">
                <img
                  src="/peptalk-logo.png"
                  alt="Peptalk Podcast"
                  className="h-12 w-auto object-contain"
                />
            </Link>

            <Link href="/dashboard" className="nav-scale inline-block text-[#777] hover:text-white transition-colors">
                <User className="h-5 w-5" />
            </Link>

            <Link href="/wishlist" className="nav-scale inline-block relative text-[#777] hover:text-white transition-colors">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-medium rounded-full h-3.5 w-3.5 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #E8793A, #B83870)" }}>
                    {wishlistItems.length}
                  </span>
                )}
            </Link>

            <Link href="/cart" className="nav-scale inline-block relative text-[#777] hover:text-white transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-medium rounded-full h-3.5 w-3.5 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #E8793A, #B83870)" }}>
                    {cartItemsCount}
                  </span>
                )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="nav-scale md:hidden text-[#777] hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-5 pt-3 space-y-1 border-t border-white/10">
            {[...navLinks, { label: "Peptalk Podcast", href: "/peptalk" }].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="block py-2.5 nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
