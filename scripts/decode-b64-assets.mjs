/**
 * Build step 0: decode binary assets stored as base64 text in assets-b64/ into
 * client/public/images/learn/ (the GitHub connector used for deploys can only
 * write text files). `name.ext.b64` -> client/public/images/learn/name.ext.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, "assets-b64");
const out = path.join(root, "client/public/images/learn");
if (fs.existsSync(src)) {
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(src).filter((n) => n.endsWith(".b64"))) {
    const bytes = Buffer.from(fs.readFileSync(path.join(src, f), "utf8").trim(), "base64");
    fs.writeFileSync(path.join(out, f.slice(0, -4)), bytes);
    console.log(`decoded ${f} -> images/learn/${f.slice(0, -4)} (${bytes.length} bytes)`);
  }
}
