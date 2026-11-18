import { auth, isFirebaseConfigured } from "./firebase";

/**
 * Call a protected /api/admin/* route with the signed-in user's Firebase ID
 * token. The server checks ADMIN_EMAILS + email_verified (api/_lib/admin-auth.ts)
 * and uses the Admin SDK, so Firestore rules can stay locked for browsers.
 */
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured");
  }
  const user = auth?.currentUser;
  if (!user) {
    throw new Error("You must be signed in as an admin");
  }

  const idToken = await user.getIdToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
      Authorization: `Bearer ${idToken}`,
    },
  });

  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (HTTP ${res.status})`);
  }
  return body;
}

/** Download a protected /api/admin/* file (e.g. CSV) with the admin's ID token. */
export async function adminDownload(path: string, fallbackName: string): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured");
  const user = auth?.currentUser;
  if (!user) throw new Error("You must be signed in as an admin");
  const idToken = await user.getIdToken();
  const res = await fetch(path, { headers: { Authorization: `Bearer ${idToken}` } });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body?.error || `Request failed (HTTP ${res.status})`);
  }
  const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") || "")?.[1] || fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
