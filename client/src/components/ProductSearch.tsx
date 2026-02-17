import { useState, useEffect, useMemo } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { fetchProducts, Product } from '@/lib/productsStorage';

interface ProductSearchProps {
  onResultsChange: (results: Product[]) => void;
  initialCategory?: string;
}

export default function ProductSearch({ onResultsChange, initialCategory }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Extract unique categories and benefits
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const allBenefits = useMemo(() => {
    const benefits = new Set<string>();
    products.forEach(p => {
      if (p.benefits) {
        p.benefits.forEach(b => benefits.add(b));
      }
    });
    return Array.from(benefits).sort();

  }, []);

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDescription = product.description?.toLowerCase().includes(query);
        const matchesBenefits = product.benefits?.some(b => b.toLowerCase().includes(query));
        if (!matchesName && !matchesDescription && !matchesBenefits) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Price range filter
      if (product.priceUSD < priceRange[0] || product.priceUSD > priceRange[1]) {
        return false;
      }

      // Rating filter
      if (product.rating < minRating) {
        return false;
      }

      // Benefits filter
      if (selectedBenefits.length > 0) {
        const hasMatchingBenefit = selectedBenefits.some(benefit =>
          product.benefits?.some(b => b.toLowerCase().includes(benefit.toLowerCase()))
        );
        if (!hasMatchingBenefit) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, priceRange, minRating, selectedBenefits]);

  // Update parent component when results change
  useEffect(() => {
    onResultsChange(filteredProducts);
  }, [filteredProducts, onResultsChange]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 200]);
    setMinRating(0);
    setSelectedBenefits([]);
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits(prev =>
      prev.includes(benefit)
        ? prev.filter(b => b !== benefit)
        : [...prev, benefit]
    );
  };

  const activeFilterCount = [
    searchQuery !== '',
    selectedCategory !== 'all',
    priceRange[0] !== 0 || priceRange[1] !== 200,
    minRating > 0,
    selectedBenefits.length > 0
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products, benefits, or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
              <SheetDescription>
                Refine your search with advanced filters
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  min={0}
                  max={200}
                  step={5}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mt-2"
                />
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Minimum Rating: {minRating > 0 ? `${minRating}+ stars` : 'Any'}
                </label>
                <Slider
                  min={0}
                  max={5}
                  step={0.5}
                  value={[minRating]}
                  onValueChange={(value) => setMinRating(value[0])}
                  className="mt-2"
                />
              </div>

              {/* Benefits Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Health Benefits</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {allBenefits.slice(0, 15).map(benefit => (
                    <Badge
                      key={benefit}
                      variant={selectedBenefits.includes(benefit) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleBenefit(benefit)}
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
                disabled={activeFilterCount === 0}
              >
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary">
              Search: "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory('all')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(priceRange[0] !== 0 || priceRange[1] !== 200) && (
            <Badge variant="secondary">
              ${priceRange[0]}-${priceRange[1]}
              <button
                onClick={() => setPriceRange([0, 200])}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {minRating > 0 && (
            <Badge variant="secondary">
              {minRating}+ stars
              <button
                onClick={() => setMinRating(0)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedBenefits.map(benefit => (
            <Badge key={benefit} variant="secondary">
              {benefit}
              <button
                onClick={() => toggleBenefit(benefit)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
}
