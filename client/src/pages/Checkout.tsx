import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CreditCard, Lock, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { getCartLineUnitUSD } from "@shared/product-prices";
import { bundleLabel } from "@shared/bundle-pricing";
import { SHIPPING_RULE_SENTENCE } from "@/lib/shippingCopy";
import { shippingCentsForMerchandiseUSD } from "@shared/shipping-rate";

function formatCheckoutUSD(amount: number | undefined | null): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "Price unavailable";
  return `$${amount.toFixed(2)}`;
}

export default function Checkout() {
  const { items, getTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
  });
  const subtotal = getTotal();
  const shippingCents = shippingCentsForMerchandiseUSD(subtotal);
  const shippingLabel = shippingCents === 0 ? "Free" : formatCheckoutUSD(shippingCents / 100);
  const orderTotal = subtotal + shippingCents / 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      // Create checkout session with backend API
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            size: item.size,
            // Bundle size only (2 | 3). The server computes the bundle price.
            ...(item.bundle ? { bundle: item.bundle } : {}),
            // price intentionally omitted as sole source — server looks up catalog
          })),
          customerEmail: formData.email,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !body.url) {
        // 400s carry a shopper-readable reason (e.g. a size that is no longer sold)
        throw new Error(
          response.status === 400 && body.error
            ? body.error
            : "There was an error starting checkout. Please try again."
        );
      }

      // Redirect to Stripe Checkout (keep the button disabled while navigating)
      window.location.href = body.url;
      return;
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "There was an error starting checkout. Please try again."
      );
    }
    setIsProcessing(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center px-4">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Add a product to your cart before checking out.
            </p>
            <Link href="/products">
              <Button className="bg-brand-gradient">
                Browse Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/cart" className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Stripe collects the ship-to name and address on the next page.
                  </p>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Lock className="w-4 h-4" />
                    Secure payment powered by Stripe
                  </div>
                  <p className="text-sm text-gray-500">
                    You will be redirected to Stripe's secure checkout to complete your payment.
                  </p>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">📦 Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 space-y-2">
                  <p>Orders ship from the US. If an item is not in stock, please allow about two extra weeks, since some products are made in Germany, Italy, or Latvia.</p>
                  <p className="text-sm">{SHIPPING_RULE_SENTENCE}</p>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Items */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {items.map((item) => {
                      const unit = getCartLineUnitUSD(item.product, item.size, item.bundle);
                      const lineTotal =
                        typeof unit === "number" && Number.isFinite(unit)
                          ? unit * item.quantity
                          : undefined;
                      return (
                      <div key={`${item.product.id}-${item.size || "20"}-${item.bundle ?? 1}`} className="flex justify-between text-sm">
                        <span>
                          {item.product.name}{item.size ? ` (${item.size})` : ""}
                          {item.bundle ? ` — ${bundleLabel(item.bundle)}` : ""} × {item.quantity}
                        </span>
                        <span>{formatCheckoutUSD(lineTotal)}</span>
                      </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCheckoutUSD(getTotal())}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{shippingLabel}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-orange-600">{formatCheckoutUSD(orderTotal)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-lg py-6"
                    onClick={handleCheckout}
                    disabled={isProcessing || !formData.email}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Complete Order
                      </>
                    )}
                  </Button>

                  {checkoutError && (
                    <p role="alert" className="text-sm text-red-600 text-center mt-3">
                      {checkoutError}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
