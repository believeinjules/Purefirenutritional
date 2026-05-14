import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      ...(isSsrBuild && {
        "react-helmet-async": path.resolve(__dirname, "client/src/lib/helmet-ssr.ts"),
      }),
    },
  },
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client", "public"),
  build: isSsrBuild
    ? {
        outDir: path.resolve(__dirname, "dist/server"),
        emptyOutDir: true,
        rollupOptions: {
          input: path.resolve(__dirname, "client/src/entry-server.tsx"),
          output: { format: "esm", entryFileNames: "entry-server.js" },
        },
      }
    : {
        outDir: path.resolve(__dirname, "dist"),
        emptyOutDir: true,
        rollupOptions: {
          output: {
            chunkSizeWarningLimit: 1000,
          },
        },
      },
}));
