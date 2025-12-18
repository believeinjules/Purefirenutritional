import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function MailingListSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

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
          toast.success("Successfully subscribed! Check your email for confirmation.");
          setEmail("");
        }
      } else {
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
  );
}
