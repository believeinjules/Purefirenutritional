import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from 'sonner';
import { getProductById, products } from "@/data/products";
import { getRecommendations } from "@/data/productRecommendations";
import FrequentlyBoughtTogether from "@/components/FrequentlyBoughtTogether";
import ProductImageGallery from "@/components/ProductImageGallery";
import VariantSelector from "@/components/VariantSelector";
import type { ProductVariant } from "@/data/products";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  console.log('ProductDetail mounted with id:', id);
  const product = getProductById(id || "");
  console.log('Product loaded:', product);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Initialize selected variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Select first in-stock variant by default
      const firstInStock = product.variants.find(v => v.inStock) || product.variants[0];
      setSelectedVariant(firstInStock);
    }
  }, [product]);

  // Get current price and image based on variant selection
  const currentPrice = selectedVariant ? selectedVariant.priceUSD : product?.priceUSD || 0;
  const currentPriceEUR = selectedVariant ? selectedVariant.priceEUR : product?.priceEUR || 0;
  const currentImage = selectedVariant?.image || product?.image;
  const currentImages = selectedVariant?.images || (currentImage ? [currentImage] : product?.images || []);
  const { addToCart } = useCart();
  const { addItem, removeItem, isItemInWishlist } = useWishlist();
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (product) {
      setInWishlist(isItemInWishlist(product.id));
    }
  }, [product, isItemInWishlist]);

  const handleWishlistToggle = async () => {
    if (!product) return;
    try {
      if (inWishlist) {
        await removeItem(product.id);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await addItem({
          id: product.id,
          name: product.name,
          price: currentPrice,
          image: currentImage
        });
        setInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = product
    ? products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4)
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back Button */}
          <Link href="/products" className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Product Image Gallery */}
            <div className="bg-white rounded-lg shadow p-8">
              <ProductImageGallery
                images={currentImages}
                productName={product.name}
                altText={selectedVariant?.imageAlt || product.imageAlt}
              />
            </div>

            {/* Product Info */}
            <div>
              <span className="text-orange-600 font-medium text-sm uppercase tracking-wide">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold mt-2 mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">({product.rating})</span>
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-orange-600">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className="text-gray-500 ml-2">
                  €{currentPriceEUR.toFixed(2)}
                </span>
              </div>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && selectedVariant && (
                <div className="mb-6">
                  <VariantSelector
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    onVariantChange={setSelectedVariant}
                  />
                </div>
              )}

              {/* Benefits */}
              {product.benefits && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Key Benefits:</h3>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-600" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart and Wishlist */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
                  disabled={!!(selectedVariant && !selectedVariant.inStock)}
                  onClick={() => {
                    const size = selectedVariant?.name.includes("60") ? "60" : "20";
                    addToCart(product, quantity, size as "20" | "60");
                  }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - ${(currentPrice * quantity).toFixed(2)}
                </Button>
                <Button
                  size="lg"
                  variant={inWishlist ? "default" : "outline"}
                  className={`py-6 ${inWishlist ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Frequently Bought Together */}
          {(() => {
            const recs = getRecommendations(product.id)
              .map(rec => {
                const p = getProductById(rec.productId);
                return p ? { product: p, reason: rec.reason } : null;
              })
              .filter((item) => item !== null) as Array<{ product: typeof product; reason?: string }>;
            return <FrequentlyBoughtTogether currentProduct={product} recommendations={recs} />;
          })()}


          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map(p => (
                  <Card key={p.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-32 rounded mb-3 flex items-center justify-center">
                        <span className="text-gray-400 text-xs text-center px-2">{p.name}</span>
                      </div>
                      <Link href={`/product/${p.id}`}>
                        <h3 className="font-semibold hover:text-orange-600 transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                      </Link>
                      <p className="text-orange-600 font-bold">${p.priceUSD.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
