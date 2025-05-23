import { defineConfig } from "vite";

import { externalizeDeps } from "vite-plugin-externalize-deps";
import react from "@vitejs/plugin-react";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
    },
    emptyOutDir: true,
    sourcemap: true,
  },
  plugins: [react(), externalizeDeps()],
});
