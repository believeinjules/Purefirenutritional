import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { stripePromise } from "@/lib/stripe";

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      // Create checkout session with backend API
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.product.name,
            description: item.product.description,
            price: item.product.priceUSD * (item.size === "60" ? 2.5 : 1),
            quantity: item.quantity,
            image: item.product.image,
            size: item.size
          })),
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (error) {
      console.error("Checkout error:", error);
      alert("There was an error processing your payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Complete!</h1>
            <p className="text-gray-600 mb-6">Thank you for your purchase.</p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-orange-500 to-rose-500">
                Continue Shopping
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
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
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
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span>
                          {item.product.name} × {item.quantity}
                        </span>
                        <span>${(item.product.priceUSD * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-orange-600">${getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-lg py-6"
                    onClick={handleCheckout}
                    disabled={isProcessing || !formData.email || !formData.firstName}
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
