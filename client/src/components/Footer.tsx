import { Link } from "wouter";
import { Flame, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await fetch("/api/mailing-list/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadySubscribed) {
          toast.info("You're already subscribed!");
        } else {
          toast.success("Successfully subscribed to our newsletter!");
          setEmail("");
        }
      } else {
        toast.error(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-orange-600 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="w-8 h-8" />
            <h3 className="text-2xl font-bold">Stay Updated</h3>
          </div>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Get exclusive access to new products, health insights, and special offers. 
            Join thousands of health enthusiasts on their longevity journey.
          </p>
          <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white text-gray-900"
              disabled={isSubscribing}
            />
            <Button 
              type="submit" 
              variant="secondary"
              disabled={isSubscribing}
              className="bg-white text-orange-600 hover:bg-gray-100"
            >
              {isSubscribing ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          <p className="text-white/70 text-sm mt-3">
            No spam, unsubscribe at any time.
          </p>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">Pure Fire Nutritional</span>
            </div>
            <p className="text-gray-400 mb-4">
              Premium Health & Longevity
            </p>
            <p className="text-gray-400 text-sm">
              Leading provider of scientifically-backed supplements, anti-aging solutions, and exclusive Khavinson peptide bioregulators for optimal health and longevity.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/science" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Science & Research
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-orange-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-orange-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="text-gray-400 hover:text-orange-500 transition-colors">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Product Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=NUTRITIONAL+SUPPLEMENTS" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Nutritional Supplements
                </Link>
              </li>
              <li>
                <Link href="/products?category=ANTI+AGING-LONGEVITY" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Anti-Aging & Longevity
                </Link>
              </li>
              <li>
                <Link href="/products?category=PEPTIDE+BIOREGULATORS" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Peptide Bioregulators
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="w-5 h-5 text-orange-500" />
                <a href="mailto:info@purefirenutritional.com" className="hover:text-orange-500 transition-colors">
                  info@purefirenutritional.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="w-5 h-5 text-orange-500" />
                <a href="tel:+13155677931" className="hover:text-orange-500 transition-colors">
                  (315) 567-7931
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span>505 Brighton Beach Ave 2nd FL<br />Brooklyn, NY 11234</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Pure Fire Nutritional. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-orange-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="/shipping" className="text-gray-400 hover:text-orange-500 transition-colors">
                Shipping Info
              </Link>
              <Link href="/returns" className="text-gray-400 hover:text-orange-500 transition-colors">
                Returns
              </Link>
            </div>
          </div>
          
          {/* FDA Disclaimer */}
          <p className="text-gray-500 text-xs mt-6 text-center">
            FDA Disclaimer: These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease. Individual results may vary. Consult your healthcare provider before use, especially if you are pregnant, nursing, have a medical condition, or are taking medications. Keep out of reach of children.
          </p>
        </div>
      </div>
    </footer>
  );
}
