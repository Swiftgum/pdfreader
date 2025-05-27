// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { externalizeDeps } from "vite-plugin-externalize-deps";

const externals = [
  // → ALL the ways a bundler can reach React
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom",
  "react-dom/client",
];

export default defineConfig({
  plugins: [
    react(),
    externalizeDeps({ exclude: externals }),   // don’t double-externalize
  ],

  resolve: { alias: { "@": "/src" } },

  build: {
    lib: {
      entry: "src/index.ts",
      name: "PdfReader",
      fileName: (format) => `pdfreader.${format}.js`,
      formats: ["es", "cjs"],
    },

    rollupOptions: {
      external: externals,                     // 🔑 nothing React goes in bundle
      output: {
        globals: {                             // for potential UMD builds
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },

    emptyOutDir: true,
    sourcemap: true,
  },
});
