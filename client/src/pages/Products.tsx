import { useState, useMemo, useEffect } from "react";
import PageSeo from "@/components/seo/PageSeo";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link, useSearch, useLocation } from "wouter";
import { BODY_SYSTEMS, LIST_PAGE_PATH, systemPath } from "@/data/bodySystems";
import SystemIntro from "@/components/guidance/SystemIntro";
import { SHOP_SYSTEMS, SYSTEM_FILTER_PREFIX, getSystem, productInSystem } from "@/data/systems";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  ProductGridCard,
  ProductListRow,
} from "@/components/ProductListingCard";
import { fetchProducts, Product } from "@/lib/productsStorage";
import { products as catalogProducts } from "@/data/products";
import FreeShippingBanner from "@/components/shop/FreeShippingBanner";
import { useReviewSummaries } from "@/lib/reviewsApi";
import {
  FormulaExplainer,
  FormulaTypeFilter,
  PillRadio,
  filterLegend,
  formulaTypeCounts,
  matchesFormulaType,
  type FormulaTypeFilterValue,
} from "@/components/shop/FormulaTypeParts";
import { FORMULA_EXPLAINER_ID } from "@/data/formulaType";

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
  const [formulaType, setFormulaType] = useState<FormulaTypeFilterValue>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const activeFilterCount = (formulaType !== "all" ? 1 : 0) + (activeCategory !== "all" ? 1 : 0);
  // /products#understanding-the-formulas (linked from the Bonomarlot page) opens the panel.
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash !== `#${FORMULA_EXPLAINER_ID}`) return;
      setExplainerOpen(true);
      requestAnimationFrame(() => document.getElementById(FORMULA_EXPLAINER_ID)?.scrollIntoView());
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);
  // Build-time prerender (no window): list the code catalog so the static HTML
  // links every product page. In the browser this starts empty and loads as before.
  const isPrerender = typeof window === "undefined";
  const [products, setProducts] = useState<Product[]>(() =>
    isPrerender ? (catalogProducts as unknown as Product[]) : []
  );
  const [loading, setLoading] = useState(!isPrerender);
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

    if (formulaType !== "all") result = result.filter((p) => matchesFormulaType(p.id, formulaType));

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
  }, [products, activeCategory, formulaType, searchQuery, sortBy, reviewSummaries]);

  const typeCounts = useMemo(() => formulaTypeCounts(products.map((p) => p.id)), [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageSeo
        title="Shop Peptide Bioregulators & Longevity Supplements | Pure Fire Nutritional"
        description="Browse our full catalog of Khavinson peptide bioregulators, Cytomaxes, Cytogens, Revilab series, and longevity supplements. Authorized US retailer."
        path="/products"
        type="website"
      />
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
                aria-label="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white rounded-xl border-gray-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="text-gray-400 w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger aria-label="Sort products" className="w-48 bg-white rounded-xl border-gray-200">
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
                  className={`p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center transition-colors ${
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
                  className={`p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center transition-colors ${
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

          {/* Filters (preview): one disclosure holds Formula type + the existing category,
              system and body-system choices that used to sit in four chip rows. */}
          <div className="mb-6">
            <button
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="shop-filters"
              onClick={() => setFiltersOpen((o) => !o)}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
              data-testid="filters-toggle"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              Filters
              {activeFilterCount > 0 && (
                <span className="text-xs text-gray-500">({activeFilterCount})</span>
              )}
            </button>
            <div
              id="shop-filters"
              hidden={!filtersOpen}
              className="mt-3 bg-white rounded-2xl border border-gray-100 p-5 space-y-5"
              data-testid="filters-panel"
            >
              <FormulaTypeFilter
                value={formulaType}
                onChange={setFormulaType}
                counts={typeCounts}
                onExplain={() => setExplainerOpen(true)}
              />

              <fieldset>
                <legend className={filterLegend}>Category</legend>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <PillRadio
                      key={cat.value}
                      name="shop-category"
                      value={cat.value}
                      checked={activeCategory === cat.value}
                      onChange={() => selectCollection(cat.value)}
                      label={cat.label}
                      count={categoryCounts[cat.value] ?? 0}
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className={filterLegend}>Shop by system</legend>
                <div className="flex flex-wrap gap-2">
                  {SHOP_SYSTEMS.map((system) => {
                    const value = SYSTEM_FILTER_PREFIX + system.id;
                    return (
                      <PillRadio
                        key={system.id}
                        name="shop-system"
                        value={value}
                        checked={activeCategory === value}
                        onChange={() => selectCollection(value)}
                        label={system.name}
                      />
                    );
                  })}
                </div>
              </fieldset>

              {/* Shop by body system: links to the /products/system/<slug> pages + the list page (routes unchanged) */}
              <nav aria-label="Shop by body system" data-testid="body-system-row">
                <span className={filterLegend}>Shop by body system</span>
                <div className="flex flex-wrap gap-2">
                  {BODY_SYSTEMS.map((s) => (
                    <Link
                      key={s.slug}
                      href={systemPath(s.slug)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                    >
                      {s.name}
                    </Link>
                  ))}
                  <Link
                    href={LIST_PAGE_PATH}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                  >
                    Khavinson Peptides List
                  </Link>
                </div>
              </nav>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setFormulaType("all"); selectCollection("all"); }}
                  className="text-sm text-orange-600 hover:underline min-h-[44px]"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <FormulaExplainer open={explainerOpen} onToggle={setExplainerOpen} className="mb-8" />

          {activeSystem && <SystemIntro system={activeSystem} />}

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-5">
            {loading ? "Loading…" : `${filteredAndSorted.length} product${filteredAndSorted.length !== 1 ? "s" : ""}`}
          </p>

          <h2 className="sr-only">Product list</h2>
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
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); setFormulaType("all"); }}
              >
                Clear filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredAndSorted.map((product, i) => (
                <ProductGridCard key={product.id} eager={i < 2} product={product} reviewSummary={reviewSummaries[product.id]} formulaPreview />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredAndSorted.map((product) => (
                <ProductListRow key={product.id} product={product} reviewSummary={reviewSummaries[product.id]} formulaPreview />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
