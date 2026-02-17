import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        setInWishlist(isItemInWishlist(data.id));
      }
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
          <div className="text-center">
            <p className="text-gray-600">Loading product...</p>
          </div>
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
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link href="/products" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft size={20} />
            Back to Products
          </Link>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image */}
            <ProductImageGallery images={currentImages} productName={product.name} />

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-600">{product.category}</p>
                <div className="flex items-center gap-2 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < (product.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>

              <div className="border-b pb-6">
                <div className="text-3xl font-bold text-blue-600">${currentPrice.toFixed(2)}</div>
                <div className="text-lg text-gray-500">€{currentPriceEUR.toFixed(2)}</div>
              </div>

              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}

              {product.benefits?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Key Benefits</h3>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.variants && product.variants.length > 1 && (
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              )}

              {/* Quantity & Buttons */}
              <div className="flex gap-4">
                <div className="flex items-center border rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3">
                    <Minus size={20} />
                  </button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3">
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
                  className="flex-1 bg-blue-600"
                >
                  <ShoppingCart className="mr-2" size={20} />
                  Add to Cart
                </Button>
                <Button onClick={handleWishlistToggle} variant="outline">
                  <Heart size={20} className={inWishlist ? "fill-red-500 text-red-500" : ""} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
