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
  const product = getProductById(id || "");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Initialize selected variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
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

  const recommendationIds = getRecommendations(product.id).slice(0, 4);
  const relatedProducts = recommendationIds
    .map(rec => getProductById(rec.productId))
    .filter(prod => prod !== null) as typeof products;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <main className="flex-1">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/products" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft size={20} />
            Back to Products
          </Link>
        </div>

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="flex justify-center items-start">
              <ProductImageGallery images={currentImages} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4">{product.category}</p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < (product.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews || 0} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="border-b pb-6">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-3xl font-bold text-blue-600">${currentPrice.toFixed(2)}</span>
                  <span className="text-lg text-gray-500">€{currentPriceEUR.toFixed(2)}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Key Benefits</h3>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 1 && (
                <div>
                  <h3 className="font-semibold mb-3">Select Option</h3>
                  <VariantSelector
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    onVariantChange={setSelectedVariant}
                  />
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex gap-4">
                <div className="flex items-center border rounded-lg bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <Button
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: currentPrice,
                      quantity,
                      image: currentImage,
                      variant: selectedVariant?.name
                    });
                    toast.success('Added to cart!');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6"
                >
                  <ShoppingCart className="mr-2" size={20} />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleWishlistToggle}
                  variant="outline"
                  className="px-6"
                >
                  <Heart
                    size={20}
                    className={inWishlist ? "fill-red-500 text-red-500" : ""}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Frequently Bought Together */}
          <div className="mt-16">
            <FrequentlyBoughtTogether productId={product.id} />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(prod => (
                  <Link key={prod.id} href={`/products/${prod.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardContent className="p-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold truncate">{prod.name}</h3>
                          <p className="text-blue-600 font-bold mt-2">${prod.priceUSD.toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
