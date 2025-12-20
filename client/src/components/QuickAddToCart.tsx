import { useState } from "react";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuickAddToCartProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, size: "20" | "60") => void;
  className?: string;
  fullWidth?: boolean;
}

export default function QuickAddToCart({
  product,
  onAddToCart,
  className = "",
  fullWidth = false,
}: QuickAddToCartProps) {
  const [open, setOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<"20" | "60">("20");

  const handleAddToCart = () => {
    const quantity = 1; // Always add 1 item, size multiplier is handled in cart context
    onAddToCart(product, quantity, selectedSize);
    setOpen(false);
  };

  // Calculate prices based on size
  const price20USD = product.priceUSD;
  const price20EUR = product.priceEUR;
  const price60USD = price20USD * 2.5; // 2.5x for 60 capsules
  const price60EUR = price20EUR * 2.5;

  const currentPriceUSD = selectedSize === "20" ? price20USD : price60USD;
  const currentPriceEUR = selectedSize === "20" ? price20EUR : price60EUR;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`${fullWidth ? "w-full" : ""} ${className}`}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Size</DialogTitle>
          <DialogDescription>
            Choose the size for {product.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={selectedSize} onValueChange={(value) => setSelectedSize(value as "20" | "60")}>
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="20" id="size-20" />
              <Label htmlFor="size-20" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">20 Capsules</div>
                    <div className="text-sm text-gray-500">Standard size</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">${price20USD.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">€{price20EUR.toFixed(2)}</div>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="60" id="size-60" />
              <Label htmlFor="size-60" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">60 Capsules</div>
                    <div className="text-sm text-gray-500">Best value</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">${price60USD.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">€{price60EUR.toFixed(2)}</div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold text-orange-600">
              ${currentPriceUSD.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">€{currentPriceEUR.toFixed(2)}</div>
          </div>
          <Button onClick={handleAddToCart} size="lg" className="bg-green-600 hover:bg-green-700">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
