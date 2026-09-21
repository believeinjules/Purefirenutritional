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
