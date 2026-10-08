import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePeppy } from "./_lib/peppy/handler.js";

/** POST /api/peppy — see api/_lib/peppy/handler.ts. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  return handlePeppy(req, res);
}
