import { defineConfig } from "vite";

import { analyzer } from "vite-bundle-analyzer";
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
    rollupOptions: {
      external: [/^react($|\/)/],
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
  plugins: [react()],
});
