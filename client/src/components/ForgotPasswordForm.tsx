import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { passwordResetOutcome } from "@/lib/passwordReset";

type Props = {
  /** Prefill from the sign-in email field. */
  initialEmail?: string;
  onBack: () => void;
};

/**
 * Small "Forgot password?" form. Always confirms with neutral copy so it
 * never reveals whether an email has an account.
 */
export default function ForgotPasswordForm({ initialEmail = "", onBack }: Props) {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (sentMessage) doneRef.current?.focus();
  }, [sentMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    try {
      const { error: sendError } = await sendPasswordReset(email.trim());
      const outcome = passwordResetOutcome(sendError);
      if (outcome.kind === "sent") setSentMessage(outcome.message);
      else setError(outcome.message);
    } finally {
      setSending(false);
    }
  };

  if (sentMessage) {
    return (
      <div className="space-y-4">
        <div
          ref={doneRef}
          tabIndex={-1}
          role="status"
          className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900 outline-none"
        >
          <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-green-700" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">{sentMessage}</p>
            <p>Check your inbox and spam folder. The link opens a page where you can choose a new password.</p>
          </div>
        </div>
        <Button type="button" className="w-full" onClick={onBack}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Reset your password">
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          ref={emailRef}
          id="forgot-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={sending}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "forgot-email-error" : undefined}
        />
        {error && (
          <p id="forgot-email-error" role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={sending || !email.trim()}>
        {sending ? "Sending link…" : "Send reset link"}
      </Button>

      <div className="text-center text-sm">
        <button type="button" onClick={onBack} className="text-orange-600 hover:underline">
          Back to sign in
        </button>
      </div>
    </form>
  );
}
