# Firebase Authorized Domains

Sign-in will fail on production if the site hostname is not listed in Firebase Auth.

## Add these domains

In [Firebase Console](https://console.firebase.google.com/) → your Pure Fire project → **Authentication** → **Settings** → **Authorized domains**, add:

- `www.purefirenutritional.com`
- `purefirenutritional.com` (apex)

Also keep any existing entries you need (`localhost`, the default `*.firebaseapp.com` hosting domain, and your Vercel preview host if you use Firebase Auth on previews).

## Why this matters

Firebase Auth only accepts `signIn*` flows from hostnames on this allowlist. After adding apex + `www`, users can log in from both URLs without `auth/unauthorized-domain` errors.

No code deploy is required for this change — it is Console-only.
