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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-bold">Product: {product?.name || 'Not found'}</h1>
      </main>
      <Footer />
    </div>
  );
}
