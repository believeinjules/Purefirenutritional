// SSR-safe re-export of react-helmet-async (handles CJS default export)
// This file is only aliased in the SSR build to avoid named export issues with CJS
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("react-helmet-async");
export const Helmet = pkg.Helmet;
export const HelmetProvider = pkg.HelmetProvider;
export const HelmetData = pkg.HelmetData;
export default pkg;
