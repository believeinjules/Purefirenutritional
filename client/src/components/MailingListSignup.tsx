import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, CheckCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MailingListSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting to subscribe email:", email);
      const response = await fetch("/api/mailing-list/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        if (data.alreadySubscribed) {
          toast.info("You're already subscribed!");
        } else {
          // Show thank you modal
          setSubscribedEmail(email);
          setShowThankYou(true);
          setEmail("");
          toast.success("Successfully subscribed!");
          
          // Auto-close modal after 5 seconds
          setTimeout(() => setShowThankYou(false), 5000);
        }
      } else {
        console.error("Subscription failed:", data);
        toast.error(data.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Stay Updated</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Subscribe to our newsletter for exclusive offers, health tips, and product updates.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>

      {/* Thank You Modal */}
      <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle>Thanks for Joining!</DialogTitle>
              <DialogDescription>
                We're excited to have you with us.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-gray-700 mb-2">
              ✓ A confirmation email is being sent to:
            </p>
            <p className="font-medium text-blue-600 break-all">
              {subscribedEmail}
            </p>
          </div>

          <div className="space-y-2 mt-4 text-sm text-gray-600">
            <p>📧 Check your inbox (and spam folder) for our welcome email</p>
            <p>🎁 Exclusive subscriber-only offers coming soon</p>
            <p>💡 Tips and updates delivered to your inbox</p>
          </div>

          <Button
            onClick={() => setShowThankYou(false)}
            className="w-full mt-6 bg-gradient-to-r from-orange-500 to-rose-500"
          >
            Got It!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
