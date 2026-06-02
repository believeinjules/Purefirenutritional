import { Helmet } from "react-helmet-async";
import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import {
  Star,
  ShoppingCart,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { fetchProducts, Product } from "@/lib/productsStorage";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "All Products", value: "all" },
  { label: "Peptide Bioregulators", value: "PEPTIDE BIOREGULATORS" },
  { label: "Anti-Aging & Longevity", value: "ANTI AGING-LONGEVITY" },
  { label: "Nutritional Supplements", value: "NUTRITIONAL SUPPLEMENTS" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCategoryAccent = (category: string) => {
  switch (category) {
    case "PEPTIDE BIOREGULATORS":
      return {
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        dot: "bg-orange-400",
        pill: "bg-orange-100 text-orange-700",
        glow: "from-orange-400 to-rose-400",
      };
    case "ANTI AGING-LONGEVITY":
      return {
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        dot: "bg-purple-400",
        pill: "bg-purple-100 text-purple-700",
        glow: "from-purple-400 to-indigo-400",
      };
    case "NUTRITIONAL SUPPLEMENTS":
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-400",
        pill: "bg-emerald-100 text-emerald-700",
        glow: "from-emerald-400 to-teal-400",
      };
    default:
      return {
        badge: "bg-gray-50 text-gray-700 border-gray-200",
        dot: "bg-gray-400",
        pill: "bg-gray-100 text-gray-700",
        glow: "from-gray-400 to-gray-500",
      };
  }
};

const getCategoryShort = (category: string) => {
  switch (category) {
    case "PEPTIDE BIOREGULATORS": return "Peptide";
    case "ANTI AGING-LONGEVITY": return "Anti-Aging";
    case "NUTRITIONAL SUPPLEMENTS": return "Supplement";
    default: return category;
  }
};

// ─── Flip Card (grid view) ────────────────────────────────────────────────────

function FlipCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const accent = getCategoryAccent(product.category);

  return (
    <div className="group" style={{ perspective: "1000px" }}>
      <div
        className="relative w-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(0deg)",
        }}
        // CSS class handles the flip on hover
      >
        {/* Wrapper that flips */}
        <div
          className="relative w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* ── Front ── */}
          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm group-hover:shadow-lg transition-shadow duration-300 flex flex-col"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Image area */}
            <Link href={`/products/${product.id}`} className="block">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.imageAlt || product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl opacity-20">🔬</span>
                  </div>
                )}
                {/* Category dot */}
                <span className={`absolute top-3 left-3 w-2.5 h-2.5 rounded-full ${accent.dot} shadow-sm`} />
                {/* Hover hint */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                  <span className="text-white text-xs font-medium tracking-wide">Hover to learn more</span>
                </div>
              </div>
            </Link>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${accent.pill} px-2 py-0.5 rounded-full w-fit`}>
                {getCategoryShort(product.category)}
              </span>
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-sm leading-snug mb-1 hover:text-orange-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-100 text-gray-200"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">{product.rating?.toFixed(1)}</span>
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <div>
                  <div className="text-base font-bold text-gray-900">${product.priceUSD.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">€{product.priceEUR.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-medium hover:bg-orange-600 transition-colors"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* ── Back (shown on hover via CSS) ── */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Header */}
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${accent.pill} px-2 py-0.5 rounded-full`}>
                {getCategoryShort(product.category)}
              </span>
              <h3 className="text-white font-bold text-sm mt-2 mb-1 leading-snug">{product.name}</h3>
              <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                {product.description}
              </p>
            </div>

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="my-3">
                <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 font-semibold">Key Benefits</p>
                <ul className="space-y-1">
                  {product.benefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-200">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 bg-gradient-to-r ${accent.glow}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div>
                <div className="text-white font-bold">${product.priceUSD.toFixed(2)}</div>
                <div className="text-gray-400 text-xs">€{product.priceEUR.toFixed(2)}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/products/${product.id}`}>
                  <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors">
                    Details <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-orange-500 text-white text-xs font-medium hover:bg-orange-400 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────

function ListRow({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const accent = getCategoryAccent(product.category);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 flex gap-5 p-4 items-start">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="flex-shrink-0">
        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.imageAlt || product.name}
              className="w-full h-full object-contain p-2"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl opacity-20">🔬</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${accent.pill} px-2 py-0.5 rounded-full`}>
              {getCategoryShort(product.category)}
            </span>
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-sm mt-1.5 mb-1 hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-gray-400 line-clamp-2 mb-2">{product.description}</p>

            {/* Benefits pills */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.benefits.slice(0, 3).map((b, i) => (
                  <span key={i} className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full">
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Price + actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-base font-bold text-gray-900">${product.priceUSD.toFixed(2)}</div>
              <div className="text-xs text-gray-400">€{product.priceEUR.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 5)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-100 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Link href={`/products/${product.id}`}>
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-gray-400 transition-colors">
                  Details
                </button>
              </Link>
              <button
                onClick={() => onAddToCart(product)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-orange-600 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100">
          <div className="aspect-square bg-gray-100" />
          <div className="p-4 space-y-2.5">
            <div className="h-3 bg-gray-100 rounded-full w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-8 bg-gray-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Products() {
  const [sortBy, setSortBy] = useState("name-asc");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product as any, 1);
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "name-asc":   result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc":  result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price-asc":  result.sort((a, b) => a.priceUSD - b.priceUSD); break;
      case "price-desc": result.sort((a, b) => b.priceUSD - a.priceUSD); break;
      case "rating-desc":result.sort((a, b) => b.rating - a.rating); break;
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Shop Peptide Bioregulators & Longevity Supplements | Pure Fire Nutritional</title>
        <meta name="description" content="Browse our full catalog of Khavinson peptide bioregulators, Cytomaxes, Cytogens, Revilab series, and longevity supplements. Exclusive US retailer." />
      </Helmet>
      <Navigation />

      <main className="flex-1">
        {/* Hero Banner */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Our Products</h1>
            <p className="text-gray-500 max-w-2xl">
              Scientifically-backed peptide bioregulators, anti-aging solutions, and nutritional supplements for optimal health and longevity.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Search + Sort + View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white rounded-xl border-gray-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="text-gray-400 w-4 h-4 flex-shrink-0" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white rounded-xl border-gray-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* Grid / List toggle */}
              <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-gray-900 text-white"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-gray-900 text-white"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.value] ?? 0;
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                  }`}
                >
                  {cat.label}
                  <span className={`ml-2 text-xs ${isActive ? "text-gray-300" : "text-gray-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-400 mb-5">
            {loading ? "Loading…" : `${filteredAndSorted.length} product${filteredAndSorted.length !== 1 ? "s" : ""}`}
          </p>

          {/* Product Display */}
          {loading ? (
            <GridSkeleton />
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">No products found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or category filter.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              >
                Clear filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredAndSorted.map((product) => (
                <FlipCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredAndSorted.map((product) => (
                <ListRow key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
