import { LEARN_ARTICLES } from "@/content/learnArticles";
import { Link } from "wouter";
import { ShoppingCart, User, Heart, Menu, X, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { MENU_BODY_SYSTEMS, COLLECTIONS, GOALS, LIST_PAGE_PATH, SYSTEMS_LANDING_PATH, browsePath } from "@/data/bodySystems";
import { useCart } from "@/contexts/CartContext";
import { responsiveImage, imageRatio, fetchPriority } from "@/lib/responsiveImage";
import { useWishlist } from "@/contexts/WishlistContext";

/** Items under the Science dropdown (desktop) and Science submenu (mobile). */
// "Science" itself links to /science (desktop and mobile), so no extra overview entry is needed.
const SCIENCE_SUBMENU = [
  ...LEARN_ARTICLES.filter((a) => !a.hideFromNav).map((a) => ({ label: a.navLabel ?? a.title, href: a.href })),
  { label: "Longevity Journal", href: "/learn" },
];

/**
 * Shop menu sections (desktop dropdown + mobile collapsible sections), built
 * from the shop taxonomy (data/bodySystems.ts + data/productTags.ts).
 */
type ShopItem = { label: string; href: string; children?: { label: string; href: string }[] };
function collection(slug: string) {
  const page = COLLECTIONS.find((c) => c.slug === slug);
  if (!page) throw new Error(`Unknown collection: ${slug}`);
  return page;
}
const SHOP_SECTIONS: { id: string; label: string; items: ShopItem[] }[] = [
  {
    id: "systems",
    label: "Shop by Body System",
    items: [
      ...MENU_BODY_SYSTEMS.map((p) => ({ label: p.name, href: browsePath(p) })),
      { label: "All body systems", href: SYSTEMS_LANDING_PATH },
    ],
  },
  {
    id: "collections",
    label: "Shop by Collection",
    items: [
      {
        label: "Khavinson Peptides",
        href: LIST_PAGE_PATH,
        children: [
          { label: "Cytogens", href: browsePath(collection("khavinson-cytogens")) },
          { label: "Cytomaxes", href: browsePath(collection("khavinson-cytomaxes")) },
        ],
      },
      { label: collection("revilab").name, href: browsePath(collection("revilab")) },
      { label: collection("prime-peptide").name, href: browsePath(collection("prime-peptide")) },
    ],
  },
  { id: "goals", label: "Shop by Goal", items: GOALS.map((p) => ({ label: p.name, href: browsePath(p) })) },
];
const SHOP_ALL_LINK = { label: "Shop All", href: "/products" };
const ASK_PEPITA_LINK = { before: "Not sure where to start?", label: "Ask Pepita", href: "/ai-assistant" };
/** Small highlighted CTA under Shop by Goal; the site's existing accent gradient (cart/wishlist badges). */
const CTA_GRADIENT = "linear-gradient(135deg, #E8793A, #B83870)";
function AskPepitaCta({ onClick, className = "" }: { onClick?: () => void; className?: string }) {
  return (
    <Link
      href={ASK_PEPITA_LINK.href}
      onClick={onClick}
      className={`inline-block rounded-full px-3 py-1 text-[12px] font-medium leading-snug text-white shadow-sm hover:opacity-90 transition-opacity ${className}`}
      style={{ background: CTA_GRADIENT }}
    >
      {ASK_PEPITA_LINK.before} {ASK_PEPITA_LINK.label}
    </Link>
  );
}

const DESKTOP_ITEM = "block px-5 py-1.5 text-[13px] font-light leading-snug text-white/85 hover:text-white hover:bg-white/5 transition-colors";
const MOBILE_ITEM = "block py-1.5 text-[13px] font-light leading-snug text-white/75 hover:text-white transition-colors";

/** Desktop item whose children reveal inline beneath it on hover and keyboard focus; Esc hides them (Shop stays open). */
function DesktopFlyoutItem({ item }: { item: ShopItem & { children: { label: string; href: string }[] } }) {
  const [open, setOpen] = useState(false);
  const skipReopen = useRef(false);
  const id = `nav-shop-flyout-${item.href.replace(/\W+/g, "-")}`;
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => {
        if (skipReopen.current) skipReopen.current = false;
        else setOpen(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          setOpen(false);
          skipReopen.current = true;
          (e.currentTarget.querySelector("a") as HTMLElement | null)?.focus();
        }
      }}
    >
      <Link href={item.href} className={`${DESKTOP_ITEM} flex items-center justify-between gap-2`} aria-expanded={open} aria-controls={id}>
        {item.label}
        <ChevronDown className={`h-3 w-3 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </Link>
      {/* Revealed inline beneath the item (no overlay). The Body System column is taller, so the panel height doesn't change. */}
      <div id={id} className={open ? "block" : "hidden"}>
        {item.children.map((child) => (
          <Link key={child.href} href={child.href} className={`${DESKTOP_ITEM} pl-9`}>
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Mobile item with children: the label opens its page, a small toggle reveals the children. */
function MobileNestedItem({ item, onNavigate }: { item: ShopItem & { children: { label: string; href: string }[] }; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const id = `mobile-shop-nested-${item.href.replace(/\W+/g, "-")}`;
  return (
    <>
      <div className="flex items-center justify-between">
        <Link href={item.href} className={MOBILE_ITEM} onClick={onNavigate}>
          {item.label}
        </Link>
        <button
          type="button"
          className="p-1.5 -mr-1.5 text-white/75 hover:text-white transition-colors"
          aria-expanded={open}
          aria-controls={id}
          aria-label={`${open ? "Hide" : "Show"} ${item.label} collections`}
          onClick={() => setOpen(!open)}
        >
          <ChevronDown className={`h-3 w-3 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>
      {open && (
        <ul id={id} className="pl-4 border-l border-white/10">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link href={child.href} className={MOBILE_ITEM} onClick={onNavigate}>
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Navigation() {
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(null);
  // Esc returns focus to "Shop" without reopening the menu.
  const skipReopen = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const { items: wishlistItems } = useWishlist();
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navGradient = "linear-gradient(135deg, rgba(120, 20, 50, 0.75), rgba(70, 10, 30, 0.75), rgba(25, 5, 12, 0.75))";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "Science", href: "/science" },
    { label: "Authenticity", href: "/authenticity" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Pepita AI", href: "/ai-assistant" },
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
                  {...responsiveImage("/logo-flame.jpeg", "64px", 160)}
                  alt="Pure Fire Nutritional"
                  width={64}
                  height={64}
                  {...fetchPriority(true)}
                  decoding="async"
                  className="w-[115%] h-[115%] object-cover"
                  style={{ mixBlendMode: "lighten" }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'Inter', 'Inter Fallback', system-ui, sans-serif",
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
              href === "/products" ? (
                <div
                  key={href}
                  className="relative group"
                  data-nav-shop
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                  onFocus={() => {
                    if (skipReopen.current) skipReopen.current = false;
                    else setShopOpen(true);
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setShopOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShopOpen(false);
                      skipReopen.current = true;
                      (e.currentTarget.querySelector("a") as HTMLElement | null)?.focus();
                    }
                  }}
                >
                  <Link
                    href={href}
                    className="nav-link inline-flex items-center gap-1"
                    aria-haspopup="true"
                    aria-expanded={shopOpen}
                    aria-controls="nav-shop-menu"
                  >
                    {label}
                    <ChevronDown className="h-3 w-3 opacity-70" aria-hidden="true" />
                  </Link>
                  {/* Shop submenu: same panel as Science; shown on hover or keyboard focus, Esc closes */}
                  <div
                    id="nav-shop-menu"
                    className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 ${shopOpen ? "block" : "hidden"}`}
                  >
                    <div
                      className="w-[46rem] rounded-md border border-white/10 py-2 shadow-xl"
                      style={{ background: "linear-gradient(135deg, rgb(120, 20, 50), rgb(70, 10, 30), rgb(25, 5, 12))" }}
                    >
                      <Link href={SHOP_ALL_LINK.href} className="block px-5 py-1.5 text-[13px] font-light leading-snug text-white/85 hover:text-white hover:bg-white/5 transition-colors">
                        {SHOP_ALL_LINK.label}
                      </Link>
                      <div className="grid grid-cols-3 border-t border-white/10 mt-1 pt-1">
                        {SHOP_SECTIONS.map((section) => (
                          <div key={section.id} role="group" aria-labelledby={`nav-shop-${section.id}-label`}>
                            <p id={`nav-shop-${section.id}-label`} className="px-5 pt-2 pb-1 text-[11px] uppercase tracking-widest text-white/50">
                              {section.label}
                            </p>
                            {section.items.map((item) =>
                              item.children ? (
                                <DesktopFlyoutItem key={item.href} item={{ ...item, children: item.children }} />
                              ) : (
                                <Link key={item.href} href={item.href} className={DESKTOP_ITEM}>
                                  {item.label}
                                </Link>
                              )
                            )}
                            {section.id === "goals" && (
                              <div className="px-5 pt-2 pb-1">
                                <AskPepitaCta />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : href === "/science" ? (
                <div key={href} className="relative group" data-nav-science>
                  <Link href={href} className="nav-link inline-flex items-center gap-1" aria-haspopup="true">
                    {label}
                    <ChevronDown className="h-3 w-3 opacity-70" aria-hidden="true" />
                  </Link>
                  {/* Science submenu: shown on hover or keyboard focus */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 hidden group-hover:block group-focus-within:block">
                    <div
                      className="w-72 rounded-md border border-white/10 py-2 shadow-xl"
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
            <Link href="/peptalk" aria-label="Peptalk Podcast" className="nav-scale inline-block">
                <img
                  {...responsiveImage("/peptalk-logo.png", `${Math.round(48 * (imageRatio("/peptalk-logo.png") ?? 1))}px`, 320)}
                  alt="Peptalk Podcast"
                  height={48}
                  width={Math.round(48 * (imageRatio("/peptalk-logo.png") ?? 1))}
                  decoding="async"
                  className="h-12 w-auto object-contain"
                />
            </Link>

            <Link href="/dashboard" aria-label="Account" className="nav-scale inline-block p-2 -m-2 text-white/80 hover:text-white transition-colors">
                <User className="h-5 w-5" />
            </Link>

            <Link href="/wishlist" aria-label="Wishlist" className="nav-scale inline-block p-2 -m-2 relative text-white/80 hover:text-white transition-colors">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-white text-xs leading-none font-medium rounded-full h-4 min-w-[1rem] px-0.5 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #E8793A, #B83870)" }}>
                    {wishlistItems.length}
                  </span>
                )}
            </Link>

            <Link href="/cart" aria-label="Cart" className="nav-scale inline-block p-2 -m-2 relative text-white/80 hover:text-white transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-white text-xs leading-none font-medium rounded-full h-4 min-w-[1rem] px-0.5 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #E8793A, #B83870)" }}>
                    {cartItemsCount}
                  </span>
                )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="nav-scale md:hidden p-2 -m-2 text-white/80 hover:text-white transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
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
                {href === "/products" && (
                  <div className="pl-4 pb-1 border-l border-white/10">
                    <Link href={SHOP_ALL_LINK.href} className="block py-1.5 text-[13px] font-light leading-snug text-white/75 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
                      {SHOP_ALL_LINK.label}
                    </Link>
                    {SHOP_SECTIONS.map((section) => {
                      const open = mobileOpenSection === section.id;
                      return (
                        <div key={section.id}>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between py-1.5 text-[13px] font-light leading-snug text-white/75 hover:text-white transition-colors"
                            aria-expanded={open}
                            aria-controls={`mobile-shop-${section.id}`}
                            onClick={() => setMobileOpenSection(open ? null : section.id)}
                          >
                            {section.label}
                            <ChevronDown className={`h-3 w-3 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                          </button>
                          {open && (
                            <ul id={`mobile-shop-${section.id}`} className="pl-4 border-l border-white/10" aria-label={section.label}>
                              {section.items.map((item) => (
                                <li key={item.href}>
                                  {item.children ? (
                                    <MobileNestedItem item={{ ...item, children: item.children }} onNavigate={() => setIsMenuOpen(false)} />
                                  ) : (
                                    <Link href={item.href} className={MOBILE_ITEM} onClick={() => setIsMenuOpen(false)}>
                                      {item.label}
                                    </Link>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                          {section.id === "goals" && (
                            <div className="py-1.5">
                              <AskPepitaCta onClick={() => setIsMenuOpen(false)} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {href === "/science" && (
                  <div className="pl-4 pb-1 border-l border-white/10">
                    {SCIENCE_SUBMENU.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-2.5 text-[13px] font-light leading-snug text-white/75 hover:text-white transition-colors"
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
