import { Link } from "wouter";
import { ShoppingCart, User, Heart, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

/** Items under the Science dropdown (desktop) and Science submenu (mobile). */
const SCIENCE_SUBMENU = [
  { label: "Science", href: "/science" },
  { label: "Blog", href: "/blog" },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const { items: wishlistItems } = useWishlist();
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navGradient = "linear-gradient(135deg, rgba(120, 20, 50, 0.75), rgba(70, 10, 30, 0.75), rgba(25, 5, 12, 0.75))";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Science", href: "/science" },
    { label: "Authenticity", href: "/authenticity" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "AI Assistant", href: "/ai-assistant" },
  ];

  return (
    <nav style={{ background: navGradient, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} className="sticky top-0 z-50">
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
            {navLinks.map(({ label, href }) =>
              href === "/science" ? (
                <div key={href} className="relative group" data-nav-science>
                  <Link href={href} className="nav-link inline-flex items-center gap-1" aria-haspopup="true">
                    {label}
                    <ChevronDown className="h-3 w-3 opacity-70" aria-hidden="true" />
                  </Link>
                  {/* Science submenu: shown on hover or keyboard focus */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 hidden group-hover:block group-focus-within:block">
                    <div
                      className="w-44 rounded-md border border-white/10 py-2 shadow-xl"
                      style={{ background: "linear-gradient(135deg, rgb(120, 20, 50), rgb(70, 10, 30), rgb(25, 5, 12))" }}
                    >
                      {SCIENCE_SUBMENU.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-5 py-2 text-[13px] font-light leading-snug text-white/85 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={href} href={href} className="nav-link">{label}</Link>
              )
            )}
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

            <Link href="/dashboard" className="nav-scale inline-block text-white/80 hover:text-white transition-colors">
                <User className="h-5 w-5" />
            </Link>

            <Link href="/wishlist" className="nav-scale inline-block relative text-white/80 hover:text-white transition-colors">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-medium rounded-full h-3.5 w-3.5 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #E8793A, #B83870)" }}>
                    {wishlistItems.length}
                  </span>
                )}
            </Link>

            <Link href="/cart" className="nav-scale inline-block relative text-white/80 hover:text-white transition-colors">
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
              className="nav-scale md:hidden text-white/80 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-5 pt-3 space-y-1 border-t border-white/10">
            {navLinks.map(({ label, href }) => (
              <div key={href}>
                <Link
                  href={href}
                  className="block py-2.5 nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
                {href === "/science" && (
                  <div className="pl-4 pb-1 border-l border-white/10">
                    {SCIENCE_SUBMENU.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-1.5 text-[13px] font-light leading-snug text-white/75 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
