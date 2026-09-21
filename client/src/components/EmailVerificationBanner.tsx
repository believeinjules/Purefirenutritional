import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail } from "lucide-react";

/**
 * On-brand banner for signed-in users who have not verified email yet.
 * Offers a resend that only toasts success after Firebase accepts the send.
 */
export default function EmailVerificationBanner() {
  const { user, resendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);

  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    const { error, sent } = await resendVerificationEmail();
    setSending(false);

    if (error) {
      toast.error(
        error.message ||
          "Couldn’t send verification email. Try again in a moment."
      );
      return;
    }
    if (sent) {
      toast.success(
        "Verification email sent. Check your inbox (and spam folder)."
      );
    } else {
      toast.message("Your email is already verified.");
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-orange-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Mail className="w-5 h-5 mt-0.5 shrink-0 text-orange-600" />
          <div>
            <p className="font-medium">Verify your email</p>
            <p className="text-sm text-orange-900/80">
              We sent a link to <span className="font-medium">{user.email}</span>.
              Check spam if you don’t see it. You can resend anytime.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-orange-300 bg-white text-orange-800 hover:bg-orange-100 shrink-0"
          disabled={sending}
          onClick={handleResend}
        >
          {sending ? "Sending…" : "Resend email"}
        </Button>
      </div>
    </div>
  );
}
