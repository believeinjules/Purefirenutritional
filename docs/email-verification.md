# Email verification (Firebase Auth)

Pure Fire sends Firebase **email address verification** after signup via `sendEmailVerification` (Spark plan is enough — no Blaze / custom SMTP required for the default Firebase mailer).

## User flow

1. **Signup** → account created → verification email sent (toast only claims “we sent…” when the send succeeds). If send fails, toast shows a clear failure and points to **Resend**; the dashboard banner uses neutral copy (never asserts a link was sent).
2. User opens the link → lands on `/auth/action?mode=verifyEmail&oobCode=…` → app calls `applyActionCode`, reloads the user, and only shows success when `emailVerified === true` (failed reload → error, UI unblocked).
3. **Resend** is available on the dashboard banner (and login if already signed in but unverified).

Continue URL defaults to `https://www.purefirenutritional.com/auth/action` (or `VITE_PUBLIC_SITE_URL` / current origin). That host must be under **Authentication → Settings → Authorized domains**.

## Ops notes

- Ask users to check **spam / junk** if the message is missing.
- Customize subject/body later: **Firebase Console → Authentication → Templates → Email address verification**.
- This feature only *sends* and *completes* verification emails. Admin UI rules around `emailVerified` are handled separately and should not be mixed into this change.

# Password reset (Firebase Auth)

- **Sign in → Forgot password?** opens a small form that calls `sendPasswordResetEmail` with continue URL `https://www.purefirenutritional.com/login` (`handleCodeInApp: false`), so the link opens **Firebase's hosted reset page**, which then offers "Continue" back to sign-in.
- The form always shows the same neutral message ("If an account exists for that email, we've sent a reset link."), including for unknown emails. Only typos (`auth/invalid-email`), rate limits (`auth/too-many-requests`), and network errors show a different message.
- If the continue URL is rejected (host not under **Authorized domains**, e.g. a preview), the link is still sent without a continue URL.
- If the Password reset template's action URL is ever customized to `/auth/action`, that page forwards `mode=resetPassword` / `recoverEmail` links to the hosted page at `https://<VITE_FIREBASE_AUTH_DOMAIN>/__/auth/action`.
- Customize subject/body/sender name: **Firebase Console → Authentication → Templates → Password reset**.
