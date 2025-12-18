import { useState } from "react";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
  recommendations: Array<{
    product: Product;
    reason?: string;
  }>;
}

export default function FrequentlyBoughtTogether({
  currentProduct,
  recommendations
}: FrequentlyBoughtTogetherProps) {
  // Track which products are selected (current product always selected)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set([currentProduct.id])
  );
  const { addToCart } = useCart();

  if (recommendations.length === 0) {
    return null;
  }

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (productId === currentProduct.id) {
      // Current product cannot be deselected
      return;
    }
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedProducts.has(currentProduct.id)) {
      total += currentProduct.priceUSD;
    }
    recommendations.forEach(({ product }) => {
      if (selectedProducts.has(product.id)) {
        total += product.priceUSD;
      }
    });
    return total.toFixed(2);
  };

  const handleAddAllToCart = () => {
    const productsToAdd: Product[] = [];
    
    if (selectedProducts.has(currentProduct.id)) {
      productsToAdd.push(currentProduct);
    }
    
    recommendations.forEach(({ product }) => {
      if (selectedProducts.has(product.id)) {
        productsToAdd.push(product);
      }
    });

    productsToAdd.forEach(product => {
      addToCart(product);
    });

    toast.success(
      `Added ${productsToAdd.length} ${productsToAdd.length === 1 ? 'product' : 'products'} to cart`
    );
  };

  return (
    <Card className="p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Frequently Bought Together</h2>
      <p className="text-muted-foreground mb-6">
        Customers who bought this item also purchased these complementary products
      </p>

      <div className="space-y-4">
        {/* Current Product */}
        <div className="flex items-start gap-4 p-4 border rounded-lg bg-accent/5">
          <Checkbox
            checked={selectedProducts.has(currentProduct.id)}
            onCheckedChange={() => toggleProduct(currentProduct.id)}
            className="mt-1"
            disabled
          />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{currentProduct.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {currentProduct.description}
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  This item
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${currentProduct.priceUSD.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {recommendations.map(({ product, reason }) => (
          <div key={product.id} className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors">
            <Checkbox
              checked={selectedProducts.has(product.id)}
              onCheckedChange={() => toggleProduct(product.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {product.description}
                  </p>
                  {reason && (
                    <p className="text-sm font-medium text-primary mt-1">
                      <Plus className="inline w-3 h-3 mr-1" />
                      {reason}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${product.priceUSD.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total and Add to Cart */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Total for {selectedProducts.size} {selectedProducts.size === 1 ? 'item' : 'items'}
            </p>
            <p className="text-3xl font-bold">${calculateTotal()}</p>
          </div>
          <Button
            size="lg"
            onClick={handleAddAllToCart}
            disabled={selectedProducts.size === 0}
            className="gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add Selected to Cart
          </Button>
        </div>
        {selectedProducts.size > 1 && (
          <p className="text-sm text-muted-foreground text-center">
            Save time by adding complementary products together
          </p>
        )}
      </div>
    </Card>
  );
}
