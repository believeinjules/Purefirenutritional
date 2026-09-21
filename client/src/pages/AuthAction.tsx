import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { isEmailVerificationConfirmed } from "@/lib/emailVerification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type Status = "working" | "success" | "error" | "unsupported";

/**
 * Handles Firebase Auth email action links (verifyEmail via oobCode).
 * Continue URL from sendEmailVerification points here with ?mode=&oobCode=.
 */
export default function AuthAction() {
  const { completeEmailVerification, refreshUser, user } = useAuth();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<Status>("working");
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    let cancelled = false;

    const showVerifiedSuccess = () => {
      setStatus("success");
      setMessage("Your email is verified. You’re all set.");
    };

    const showNotVerifiedError = (detail?: string) => {
      setStatus("error");
      setMessage(
        detail ||
          "We couldn’t confirm your email is verified. Sign in and use Resend verification."
      );
    };

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const oobCode = params.get("oobCode");

      // Firebase hosted handler may redirect here after verifying (no oobCode).
      // Query flags alone are not proof — only show success if reload shows emailVerified.
      if (!oobCode && (params.get("verified") === "1" || params.get("emailVerified") === "1")) {
        try {
          const refreshed = await refreshUser();
          if (cancelled) return;
          if (isEmailVerificationConfirmed(refreshed)) {
            setStatus("success");
            setMessage("Your email is verified. Welcome to Pure Fire.");
          } else {
            showNotVerifiedError(
              "We couldn’t confirm your email is verified yet. Sign in and use Resend if you need a new link."
            );
          }
        } catch {
          if (!cancelled) {
            showNotVerifiedError(
              "Couldn’t refresh your account status. Sign in and try again, or use Resend verification."
            );
          }
        }
        return;
      }

      if (mode === "verifyEmail" && oobCode) {
        const { error, verified } = await completeEmailVerification(oobCode);
        if (cancelled) return;
        if (error || !verified) {
          setStatus("error");
          setMessage(
            error?.message ||
              "This verification link is invalid or has expired. Sign in and resend a new one."
          );
          return;
        }
        showVerifiedSuccess();
        return;
      }

      if (mode && mode !== "verifyEmail") {
        if (!cancelled) {
          setStatus("unsupported");
          setMessage("This link type isn’t handled here. Try signing in to your account.");
        }
        return;
      }

      if (!cancelled) {
        setStatus("error");
        setMessage("Missing verification code. Open the link from your email, or request a new one.");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [completeEmailVerification, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Email verification</CardTitle>
            <CardDescription>Pure Fire Nutritional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "working" && (
              <div className="flex items-center gap-3 text-gray-700">
                <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                <p>{message}</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-green-800">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                  <p>{message}</p>
                </div>
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => setLocation(user ? "/dashboard" : "/login")}
                >
                  {user ? "Go to dashboard" : "Sign in"}
                </Button>
              </div>
            )}

            {(status === "error" || status === "unsupported") && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <p>{message}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => setLocation(user ? "/dashboard" : "/login")}
                  >
                    {user ? "Back to dashboard" : "Sign in"}
                  </Button>
                  <p className="text-center text-sm text-gray-600">
                    Need a new link?{" "}
                    <Link href="/login" className="text-orange-600 hover:underline">
                      Sign in
                    </Link>{" "}
                    and use Resend verification.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
