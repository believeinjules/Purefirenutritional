import { useState, useId, type MouseEvent } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import {
  CartSize,
  getDefaultCartSize,
  getSizeOptions,
  hasMultipleSizes,
  SizeOption,
} from "@/lib/productSize";

/** Minimal product shape needed for listing ATC (storage + static catalog). */
export type QuickAddProduct = {
  id: string;
  name: string;
  priceUSD: number;
  priceEUR: number;
  sizes?: number;
  image?: string;
  variants?: Array<{
    id: string;
    name: string;
    priceUSD: number;
    priceEUR: number;
    inStock?: boolean;
  }>;
  [key: string]: unknown;
};

interface QuickAddToCartProps {
  product: QuickAddProduct;
  /** Optional override; defaults to CartContext.addToCart */
  onAddToCart?: (
    product: QuickAddProduct,
    quantity: number,
    size: CartSize
  ) => void;
  className?: string;
  fullWidth?: boolean;
  /** Compact styling for grid cards */
  compact?: boolean;
  label?: string;
}

/**
 * Listing-page Add to Cart.
 * - Multiple sizes/variants → opens on-page size dialog, then adds (no navigation).
 * - Single size / no variants → adds immediately (no navigation).
 */
export default function QuickAddToCart({
  product,
  onAddToCart,
  className = "",
  fullWidth = false,
  compact = false,
  label = "Add",
}: QuickAddToCartProps) {
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);
  const options = getSizeOptions(product);
  const needsChooser = hasMultipleSizes(product);
  const [selectedSize, setSelectedSize] = useState<CartSize>(
    () => getDefaultCartSize(product)
  );
  const groupId = useId();

  const commit = (size: CartSize) => {
    if (onAddToCart) {
      onAddToCart(product, 1, size);
    } else {
      addToCart(product as any, 1, size);
    }
    toast.success(`${product.name} added to cart`);
    setOpen(false);
  };

  const handleTriggerClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!needsChooser) {
      commit(getDefaultCartSize(product));
      return;
    }
    setSelectedSize(getDefaultCartSize(product));
    setOpen(true);
  };

  const selected: SizeOption | undefined =
    options.find((o) => o.size === selectedSize) ?? options[0];

  const triggerClass = compact
    ? `flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-medium hover:bg-orange-600 transition-colors ${fullWidth ? "w-full justify-center" : ""} ${className}`
    : `${fullWidth ? "w-full" : ""} ${className}`;

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={handleTriggerClick}
          className={triggerClass}
          aria-label={
            needsChooser
              ? `Choose size and add ${product.name} to cart`
              : `Add ${product.name} to cart`
          }
        >
          <ShoppingCart className="w-3.5 h-3.5" aria-hidden />
          {label}
        </button>
      ) : (
        <Button
          type="button"
          onClick={handleTriggerClick}
          className={triggerClass}
          aria-label={
            needsChooser
              ? `Choose size and add ${product.name} to cart`
              : `Add ${product.name} to cart`
          }
        >
          <ShoppingCart className="w-4 h-4 mr-2" aria-hidden />
          {label === "Add" ? "Add to Cart" : label}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Select Size</DialogTitle>
            <DialogDescription>
              Choose the size for {product.name}. You will stay on this page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <RadioGroup
              value={selectedSize}
              onValueChange={(value) => setSelectedSize(value as CartSize)}
              aria-label={`Size options for ${product.name}`}
            >
              {options.map((opt) => {
                const inputId = `${groupId}-${opt.size}-${opt.variantId ?? "x"}`;
                return (
                  <div
                    key={inputId}
                    className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <RadioGroupItem value={opt.size} id={inputId} />
                    <Label htmlFor={inputId} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium">{opt.label}</div>
                          {opt.size === "60" && (
                            <div className="text-sm text-gray-500">Best value</div>
                          )}
                          {opt.size === "20" && options.length > 1 && (
                            <div className="text-sm text-gray-500">Standard size</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-600">
                            ${opt.priceUSD.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            €{opt.priceEUR.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-orange-600">
                ${selected?.priceUSD.toFixed(2) ?? "—"}
              </div>
              <div className="text-sm text-gray-500">
                €{selected?.priceEUR.toFixed(2) ?? "—"}
              </div>
            </div>
            <Button
              type="button"
              onClick={() => commit(selectedSize)}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" aria-hidden />
              Add to Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
