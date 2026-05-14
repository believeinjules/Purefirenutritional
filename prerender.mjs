import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");

const routes = [
  "/",
  "/products",
  "/science",
  "/about",
  "/faq",
  "/ai-assistant",
  "/peptalk",
  "/cart",
  "/wishlist",
];

async function prerender() {
  // Load the SSR bundle built by vite
  const { render } = await import(path.join(distDir, "server/entry-server.js"));

  // Read the client-side HTML template
  const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");

  for (const route of routes) {
    let pageHtml = "";
    let helmet = null;

    try {
      const result = render(route);
      pageHtml = result.html;
      helmet = result.helmet;
    } catch (err) {
      console.warn(`Warning: SSR render failed for ${route}, using shell HTML:`, err.message);
    }

    let page = template
      .replace(`<div id="root"></div>`, `<div id="root">${pageHtml}</div>`);

    if (helmet) {
      if (helmet.title?.toString()) {
        page = page.replace(/<title>.*?<\/title>/, helmet.title.toString());
      }
      if (helmet.meta?.toString()) {
        page = page.replace("</head>", `${helmet.meta.toString()}</head>`);
      }
    }

    // Write to the correct output path
    const outPath =
      route === "/"
        ? path.join(distDir, "index.html")
        : path.join(distDir, route.slice(1), "index.html");

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, page);
    console.log(`Prerendered: ${route} → ${path.relative(distDir, outPath)}`);
  }
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
