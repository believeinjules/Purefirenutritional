import { Helmet } from "react-helmet-async";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSearch, useLocation } from "wouter";
import SystemIntro from "@/components/guidance/SystemIntro";
import { SHOP_SYSTEMS, SYSTEM_FILTER_PREFIX, getSystem, productInSystem } from "@/data/systems";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  ProductGridCard,
  ProductListRow,
} from "@/components/ProductListingCard";
import { fetchProducts, Product } from "@/lib/productsStorage";
import FreeShippingBanner from "@/components/shop/FreeShippingBanner";
import { useReviewSummaries } from "@/lib/reviewsApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "All Products", value: "all" },
  { label: "Peptide Bioregulators", value: "PEPTIDE BIOREGULATORS" },
  { label: "Anti-Aging & Longevity", value: "ANTI AGING-LONGEVITY" },
  { label: "Nutritional Supplements", value: "NUTRITIONAL SUPPLEMENTS" },
];

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
  // Approved-review summaries only (empty until reviews are approved).
  const reviewSummaries = useReviewSummaries();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Shop by system: /products?system=<id> shares the category filter state.
  const search = useSearch();
  const [, navigate] = useLocation();
  const systemParam = new URLSearchParams(search).get("system");
  const activeSystem = activeCategory.startsWith(SYSTEM_FILTER_PREFIX)
    ? getSystem(activeCategory.slice(SYSTEM_FILTER_PREFIX.length))
    : undefined;
  useEffect(() => {
    const system = getSystem(systemParam);
    if (system) setActiveCategory(SYSTEM_FILTER_PREFIX + system.id);
    else setActiveCategory((c) => (c.startsWith(SYSTEM_FILTER_PREFIX) ? "all" : c));
  }, [systemParam]);
  const selectCollection = (value: string) => {
    setActiveCategory(value);
    if (value.startsWith(SYSTEM_FILTER_PREFIX)) {
      navigate(`/products?system=${value.slice(SYSTEM_FILTER_PREFIX.length)}`, { replace: true });
    } else if (systemParam) {
      navigate("/products", { replace: true });
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "all") {
      const system = activeCategory.startsWith(SYSTEM_FILTER_PREFIX)
        ? getSystem(activeCategory.slice(SYSTEM_FILTER_PREFIX.length))
        : undefined;
      result = result.filter((p) => (system ? productInSystem(p, system) : p.category === activeCategory));
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
      case "rating-desc":
        // Real approved-review averages (then count); unreviewed products keep A–Z order.
        result.sort((a, b) => {
          const ra = reviewSummaries[a.id];
          const rb = reviewSummaries[b.id];
          return (
            (rb?.average ?? 0) - (ra?.average ?? 0) ||
            (rb?.count ?? 0) - (ra?.count ?? 0) ||
            a.name.localeCompare(b.name)
          );
        });
        break;
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy, reviewSummaries]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Shop Peptide Bioregulators & Longevity Supplements | Pure Fire Nutritional</title>
        <meta name="description" content="Browse our full catalog of Khavinson peptide bioregulators, Cytomaxes, Cytogens, Revilab series, and longevity supplements. Authorized US retailer." />
      </Helmet>
      <Navigation />
      <FreeShippingBanner />

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
                  type="button"
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
                  type="button"
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
                  type="button"
                  key={cat.value}
                  onClick={() => selectCollection(cat.value)}
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

          {/* Shop by system */}
          <div className="flex flex-wrap items-center gap-2 -mt-4 mb-8" aria-label="Shop by system">
            <span className="text-xs uppercase tracking-widest text-gray-400 mr-1">Shop by system</span>
            {SHOP_SYSTEMS.map((system) => {
              const value = SYSTEM_FILTER_PREFIX + system.id;
              const isActive = activeCategory === value;
              return (
                <button
                  type="button"
                  key={system.id}
                  onClick={() => selectCollection(isActive ? "all" : value)}
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    isActive
                      ? "bg-orange-50 text-orange-800 border-orange-200"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                  }`}
                >
                  {system.name}
                </button>
              );
            })}
          </div>

          {activeSystem && <SystemIntro system={activeSystem} />}

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
                <ProductGridCard key={product.id} product={product} reviewSummary={reviewSummaries[product.id]} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredAndSorted.map((product) => (
                <ProductListRow key={product.id} product={product} reviewSummary={reviewSummaries[product.id]} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
