import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // React 17+ automatic runtime, so .tsx components can be rendered in tests.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  test: {
    include: [
      "shared/**/*.test.ts",
      "server/**/*.test.ts",
      "client/src/**/*.test.ts",
      "client/src/**/*.test.tsx",
      "api/**/*.test.ts",
    ],
  },
});
