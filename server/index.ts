import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { logAIInteraction, logError, logAPICall } from "./logger.js";
import orderRoutes from "./routes/orders.js";
import stripeRoutes from "./routes/stripe.js";
import webhookRoutes from "./routes/webhook.js";
import mailingListRoutes from "./routes/mailing-list.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Webhook route needs raw body for signature verification
  app.use("/api/stripe/webhook", express.raw({ type: 'application/json' }), webhookRoutes);
  
  // Parse JSON bodies for other routes
  app.use(express.json());

  // API Routes
  app.use("/api/orders", orderRoutes);
  app.use("/api/stripe", stripeRoutes);
  app.use("/api/mailing-list", mailingListRoutes);
  
  app.post("/api/ai/recommendations", (req, res) => {
    const startTime = Date.now();
    try {
      const { query, recommendedProductIds = [] } = req.body;
      
      if (!query || typeof query !== "string") {
        logAPICall({
          endpoint: "/api/ai/recommendations",
          method: "POST",
          statusCode: 400,
          responseTime: Date.now() - startTime,
          error: "Query parameter is required"
        });
        return res.status(400).json({ error: "Query parameter is required" });
      }

      // Log AI interaction for quality assurance
      logAIInteraction({
        query,
        recommendedProductIds,
        recommendationCount: recommendedProductIds.length,
        responseTime: Date.now() - startTime
      });

      logAPICall({
        endpoint: "/api/ai/recommendations",
        method: "POST",
        statusCode: 200,
        responseTime: Date.now() - startTime
      });

      res.json({ 
        success: true,
        message: "Recommendation logged successfully",
        query 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logError({
        error: errorMessage,
        stack: errorStack,
        endpoint: "/api/ai/recommendations",
        context: "AI recommendation processing"
      });

      logAPICall({
        endpoint: "/api/ai/recommendations",
        method: "POST",
        statusCode: 500,
        responseTime: Date.now() - startTime,
        error: errorMessage
      });

      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
