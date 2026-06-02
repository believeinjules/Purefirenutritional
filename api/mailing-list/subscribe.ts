import { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, name, source = "website" } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const ref = db.collection("mailing_list").doc(email.toLowerCase());
    const existing = await ref.get();

    if (existing.exists) {
      const data = existing.data()!;
      if (data.subscribed) {
        return res.json({ message: "Already subscribed", alreadySubscribed: true });
      }
      await ref.update({
        subscribed: true,
        subscribedAt: new Date().toISOString(),
        unsubscribedAt: null,
      });
      return res.json({ message: "Successfully resubscribed!", success: true });
    }

    await ref.set({
      email: email.toLowerCase(),
      name: name || null,
      source,
      subscribed: true,
      confirmed: false,
      subscribedAt: new Date().toISOString(),
    });

    res.json({ message: "Successfully subscribed!", success: true });
  } catch (error) {
    console.error("Mailing list subscription error:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
}
