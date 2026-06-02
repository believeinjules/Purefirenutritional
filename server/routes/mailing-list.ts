import { Router, Request, Response } from "express";
import { adminDb } from "../lib/firebase.js";
import { logError, logAPICall } from "../logger.js";

const router = Router();

// POST /api/mailing-list/subscribe
router.post("/subscribe", async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { email, name, source = "website" } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const ref = adminDb.collection("mailing_list").doc(email.toLowerCase());
    const existing = await ref.get();

    if (existing.exists) {
      const data = existing.data()!;
      if (data.subscribed) {
        return res.json({ message: "Already subscribed", alreadySubscribed: true });
      }
      // Resubscribe
      await ref.update({
        subscribed: true,
        subscribedAt: new Date().toISOString(),
        unsubscribedAt: null,
      });
      return res.json({ message: "Successfully resubscribed!", success: true });
    }

    // New subscription
    await ref.set({
      email: email.toLowerCase(),
      name: name || null,
      source,
      subscribed: true,
      confirmed: false,
      subscribedAt: new Date().toISOString(),
    });

    logAPICall({
      endpoint: "/api/mailing-list/subscribe",
      method: "POST",
      statusCode: 200,
      responseTime: Date.now() - startTime,
    });

    res.json({ message: "Successfully subscribed!", success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: "/api/mailing-list/subscribe",
      context: "Mailing list subscription",
    });

    logAPICall({
      endpoint: "/api/mailing-list/subscribe",
      method: "POST",
      statusCode: 500,
      responseTime: Date.now() - startTime,
      error: errorMessage,
    });

    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// POST /api/mailing-list/unsubscribe
router.post("/unsubscribe", async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const ref = adminDb.collection("mailing_list").doc(email.toLowerCase());
    await ref.update({
      subscribed: false,
      unsubscribedAt: new Date().toISOString(),
    });

    logAPICall({
      endpoint: "/api/mailing-list/unsubscribe",
      method: "POST",
      statusCode: 200,
      responseTime: Date.now() - startTime,
    });

    res.json({ message: "Successfully unsubscribed", success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: "/api/mailing-list/unsubscribe",
      context: "Mailing list unsubscribe",
    });

    logAPICall({
      endpoint: "/api/mailing-list/unsubscribe",
      method: "POST",
      statusCode: 500,
      responseTime: Date.now() - startTime,
      error: errorMessage,
    });

    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

export default router;
