import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const { clearCart } = useCart();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session_id");
    
    if (id) {
      setSessionId(id);
      fetchOrderDetails(id);
    } else {
      setLoading(false);
    }

    // Clear the cart after successful payment
    clearCart();
  }, [clearCart]);

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/stripe/session/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-gradient-to-b from-green-50 to-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order is being processed.
            </p>
          </div>

          {/* Order Details */}
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-500">Loading order details...</p>
              </CardContent>
            </Card>
          ) : orderDetails ? (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                  <CardDescription>Order #{sessionId?.slice(0, 8)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderDetails.customer_email && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium">{orderDetails.customer_email}</p>
                      </div>
                      {orderDetails.customer_details?.name && (
                        <div>
                          <p className="text-sm text-gray-600">Customer Name</p>
                          <p className="font-medium">{orderDetails.customer_details.name}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">Order Status</p>
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-600">Processing</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${((orderDetails.amount_total || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-blue-800">
                    📧 A confirmation email has been sent to <strong>{orderDetails.customer_email}</strong>
                  </p>
                  <p className="text-sm text-blue-800">
                    🎁 Your order will be carefully packed and shipped soon
                  </p>
                  <p className="text-sm text-blue-800">
                    📦 You'll receive a tracking number via email when your order ships
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-600">Unable to load order details</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => setLocation("/products")}
              className="sm:w-auto"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-gradient-to-r from-orange-500 to-rose-500 sm:w-auto"
            >
              View Orders
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at{" "}
              <a href="mailto:support@purefirenutritional.com" className="text-orange-600 font-medium">
                support@purefirenutritional.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
