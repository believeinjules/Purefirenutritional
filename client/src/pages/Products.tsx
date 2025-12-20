import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Grid, List, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductSearch from "@/components/ProductSearch";
import { useCart } from "@/contexts/CartContext";
import QuickAddToCart from "@/components/QuickAddToCart";
import { products as localProducts, Product } from "@/data/products";

export default function Products() {
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchResults, setSearchResults] = useState<Product[]>(localProducts);
  const { addToCart } = useCart();

  const sortedProducts = useMemo(() => {
    let result = [...searchResults];

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
  }, [searchResults, sortBy]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "PEPTIDE BIOREGULATORS":
        return "bg-orange-100 text-orange-800";
      case "ANTI AGING-LONGEVITY":
        return "bg-purple-100 text-purple-800";
      case "NUTRITIONAL SUPPLEMENTS":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Our Products</h1>
            <p className="text-gray-600">
              Discover our comprehensive range of scientifically-backed supplements, anti-aging solutions, and exclusive peptide bioregulators for optimal health and longevity.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <ProductSearch onResultsChange={setSearchResults} />

            {/* Sort and View Controls */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search query.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-pink-100 relative overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.imageAlt || product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl">🔬</span>
                        </div>
                      )}
                      <Badge className={`absolute top-2 right-2 ${getCategoryColor(product.category)}`}>
                        {product.category}
                      </Badge>
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-primary">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">${product.priceUSD}</div>
                        <div className="text-xs text-gray-500">€{product.priceEUR}</div>
                      </div>
                    </div>
                    <QuickAddToCart
                      product={product}
                      onAddToCart={(prod, qty, size) => {
                        addToCart(prod, qty, size || "20");
                      }}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <Link href={`/products/${product.id}`} className="md:w-48 flex-shrink-0">
                      <div className="aspect-square md:h-48 bg-gradient-to-br from-orange-100 to-pink-100 relative overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.imageAlt || product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">🔬</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <CardContent className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <Badge className={`${getCategoryColor(product.category)} mb-2`}>
                            {product.category}
                          </Badge>
                          <Link href={`/products/${product.id}`}>
                            <h3 className="font-semibold text-xl mb-2 hover:text-primary">{product.name}</h3>
                          </Link>
                          <div className="flex items-center gap-1 mb-3">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-primary">${product.priceUSD}</div>
                          <div className="text-sm text-gray-500">€{product.priceEUR}</div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      <QuickAddToCart
                        product={product}
                        onAddToCart={(prod, qty, size) => {
                          addToCart(prod, qty, size || "20");
                        }}
                        className="w-full md:w-auto"
                      />
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
