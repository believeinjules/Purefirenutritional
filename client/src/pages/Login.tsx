import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

/** Allow only same-origin relative paths (no protocol-relative //evil). */
function safeNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return "/dashboard";
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return "/dashboard";
  }
  return decoded;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { signIn, user, resendVerificationEmail, refreshUser } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error(error.message || "Failed to sign in");
        return;
      }

      // Best-effort refresh so a failed reload never leaves the form hung.
      let refreshed: { emailVerified?: boolean } | null = null;
      try {
        refreshed = await refreshUser();
      } catch {
        toast.message(
          "Signed in, but we couldn’t refresh verification status. Use Resend on your dashboard if needed."
        );
      }

      toast.success("Successfully signed in!");
      if (refreshed && !refreshed.emailVerified) {
        toast.message(
          "Please verify your email — you can resend from your dashboard."
        );
      }
      const params = new URLSearchParams(window.location.search);
      setLocation(safeNextPath(params.get("next")));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    const { error, sent } = await resendVerificationEmail();
    setResending(false);
    if (error) {
      toast.error(error.message || "Couldn’t send verification email.");
      return;
    }
    if (sent) {
      toast.success("Verification email sent. Check inbox and spam.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {user && !user.emailVerified && (
                <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-950 space-y-2">
                  <p>
                    You’re signed in but your email isn’t verified yet.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-orange-300"
                    disabled={resending}
                    onClick={handleResend}
                  >
                    {resending ? "Sending…" : "Resend verification email"}
                  </Button>
                </div>
              )}

              <div className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-orange-600 hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
