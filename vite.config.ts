// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { externalizeDeps } from "vite-plugin-externalize-deps";

export default defineConfig({
  plugins: [
    /* React 19 uses the same plugin – nothing extra to do */
    react(),
    externalizeDeps(),
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
      /*  🔑 leave React to the host app  */
      external: ["react", "react-dom"],
      output: {
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
    emptyOutDir: true,
    sourcemap: true,
  },
});
