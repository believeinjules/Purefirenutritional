import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "wouter";
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Heart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from 'sonner';
import { fetchProductById, Product } from "@/lib/productsStorage";
import ProductImageGallery from "@/components/ProductImageGallery";
import VariantSelector from "@/components/VariantSelector";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState(false);

  const { addToCart } = useCart();
  const { addItem, removeItem, isItemInWishlist } = useWishlist();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchProductById(id);
      setProduct(data);
      if (data?.variants?.length) {
        const firstInStock = data.variants.find((v: any) => v.inStock) || data.variants[0];
        setSelectedVariant(firstInStock);
      }
      if (data) setInWishlist(isItemInWishlist(data.id));
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Link href="/products"><Button>Back to Products</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPrice = selectedVariant?.priceUSD ?? product.priceUSD;
  const currentPriceEUR = selectedVariant?.priceEUR ?? product.priceEUR;
  const currentImage = selectedVariant?.image || product.image;
  const currentImages = selectedVariant?.images || (currentImage ? [currentImage] : product.images || []);

  const handleWishlistToggle = async () => {
    try {
      if (inWishlist) {
        await removeItem(product.id);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await addItem({ id: product.id, name: product.name, price: currentPrice, image: currentImage });
        setInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const getCategoryAccent = () => {
    switch (product.category) {
      case "PEPTIDE BIOREGULATORS": return "bg-orange-50 border-orange-200 text-orange-800";
      case "ANTI AGING-LONGEVITY": return "bg-purple-50 border-purple-200 text-purple-800";
      case "NUTRITIONAL SUPPLEMENTS": return "bg-emerald-50 border-emerald-200 text-emerald-800";
      default: return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>{product.name} | Pure Fire Nutritional</title>
        <meta name="description" content={`${product.name} — ${product.description?.slice(0, 150) ?? "Premium peptide bioregulator from Pure Fire Nutritional."}`.replace(/\s+/g, " ").trim()} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description ?? "",
          "brand": { "@type": "Brand", "name": "Pure Fire Nutritional" },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": currentPrice.toFixed(2),
            "availability": (selectedVariant ? selectedVariant.inStock : product.in_stock) !== false
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            "url": `https://www.purefirenutritional.com/products/${product.id}`
          }
        })}</script>
      </Helmet>
      <Navigation />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Back */}
          <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 text-sm transition-colors">
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          {/* Top grid: image + purchase info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">

            {/* Image gallery */}
            <ProductImageGallery images={currentImages} productName={product.name} />

            {/* Purchase panel */}
            <div className="space-y-5">
              {/* Category badge */}
              <span className={`inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${getCategoryAccent()}`}>
                {product.category}
              </span>

              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

              {/* Stars */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className={i < Math.floor(product.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                ))}
                <span className="text-sm text-gray-400 ml-1">{product.rating}</span>
              </div>

              {/* Price */}
              <div className="border-t border-b py-4">
                <div className="text-3xl font-bold text-gray-900">${currentPrice.toFixed(2)}</div>
                <div className="text-sm text-gray-400 mt-0.5">€{currentPriceEUR.toFixed(2)}</div>
              </div>

              {/* Variant selector */}
              {product.variants && product.variants.length > 1 && (
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              )}

              {/* Quantity + Add to cart */}
              <div className="flex gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-semibold text-sm min-w-[2rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <Button
                  onClick={() => {
                    addToCart({ id: product.id, name: product.name, price: currentPrice, quantity, image: currentImage, variant: selectedVariant?.name });
                    toast.success('Added to cart!');
                  }}
                  className="flex-1 bg-gray-900 hover:bg-orange-600 transition-colors"
                >
                  <ShoppingCart className="mr-2" size={16} />
                  Add to Cart
                </Button>
                <Button onClick={handleWishlistToggle} variant="outline" size="icon">
                  <Heart size={16} className={inWishlist ? "fill-red-500 text-red-500" : ""} />
                </Button>
              </div>

              {/* Usage callout */}
              {product.usage && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Recommended Usage</p>
                  <p className="text-sm text-blue-800 leading-relaxed">{product.usage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail sections below the fold */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: description + ingredients */}
            <div className="lg:col-span-2 space-y-8">

              {product.description && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">About This Product</h2>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </section>
              )}

              {product.ingredients && product.ingredients.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Active Ingredients</h2>
                  <ul className="space-y-2">
                    {product.ingredients.map((ingredient, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400" />
                        <span className="text-gray-700">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Series / product line info */}
              {product.seriesInfo && (
                <section className="bg-gray-50 border border-gray-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={16} className="text-gray-400 flex-shrink-0" />
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">About This Product Line</h2>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{product.seriesInfo}</p>
                </section>
              )}
            </div>

            {/* Right: benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Key Benefits</h2>
                <ul className="space-y-2.5">
                  {product.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
