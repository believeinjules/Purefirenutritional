import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Star, ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { fetchProducts, Product } from "@/lib/productsStorage";

const CATEGORIES = [
  { label: "All Products", value: "all" },
  { label: "Peptide Bioregulators", value: "PEPTIDE BIOREGULATORS" },
  { label: "Anti-Aging & Longevity", value: "ANTI AGING-LONGEVITY" },
  { label: "Nutritional Supplements", value: "NUTRITIONAL SUPPLEMENTS" },
];

const getCategoryAccent = (category: string) => {
  switch (category) {
    case "PEPTIDE BIOREGULATORS":
      return { badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" };
    case "ANTI AGING-LONGEVITY":
      return { badge: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-400" };
    case "NUTRITIONAL SUPPLEMENTS":
      return { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" };
    default:
      return { badge: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-400" };
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

export default function Products() {
  const [sortBy, setSortBy] = useState("name-asc");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        result.sort((a, b) => a.priceUSD - b.priceUSD);
        break;
      case "price-desc":
        result.sort((a, b) => b.priceUSD - a.priceUSD);
        break;
      case "rating-desc":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
          {/* Search + Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="text-gray-400 w-4 h-4 flex-shrink-0" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white">
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
          <p className="text-sm text-gray-500 mb-4">
            {loading ? "Loading..." : `${filteredAndSorted.length} product${filteredAndSorted.length !== 1 ? "s" : ""}`}
          </p>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-8 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">No products found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or category filter.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAndSorted.map((product) => {
                const accent = getCategoryAccent(product.category);
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    {/* Image */}
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="aspect-square bg-gray-50 relative overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.imageAlt || product.name}
                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl opacity-30">🔬</span>
                          </div>
                        )}
                        {/* Category dot */}
                        <span className={`absolute top-2 left-2 w-2 h-2 rounded-full ${accent.dot}`} />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <span className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${accent.badge.split(" ").slice(1).join(" ")}`}>
                        {getCategoryShort(product.category)}
                      </span>
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold text-sm leading-snug mb-1 hover:text-orange-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2 flex-1">
                        {product.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">{product.rating}</span>
                      </div>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <div className="text-base font-bold text-gray-900">
                            ${product.priceUSD.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">€{product.priceEUR.toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => {
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.priceUSD,
                              quantity: 1,
                              image: product.image,
                            });
                          }}
                          className="p-2 rounded-lg bg-gray-900 text-white hover:bg-orange-600 transition-colors"
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
