import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let app: App | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function getAdminApp(): App | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "[firebase] Admin credentials missing — Admin SDK features disabled"
    );
    return null;
  }

  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else {
      app = getApps()[0]!;
    }
  }

  return app;
}

export function getAdminDb(): Firestore | null {
  const adminApp = getAdminApp();
  if (!adminApp) return null;
  if (!db) {
    db = getFirestore(adminApp);
  }
  return db;
}

export function getAdminAuth(): Auth | null {
  const adminApp = getAdminApp();
  if (!adminApp) return null;
  if (!auth) {
    auth = getAuth(adminApp);
  }
  return auth;
}
