// .storybook/main.ts (or main.js)
import { resolve } from "path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)", "../src/**/*.mdx"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-docs",
    "@storybook/addon-storysource",
    "@chromatic-com/storybook",
    "@storybook/addon-mdx-gfm"
  ],

  framework: { name: "@storybook/react-vite", options: {} },
  staticDirs: ["../static"],

  /** 🔑 customise the Vite config Storybook spins up */
  viteFinal: async (viteConfig) => {
    /* a) serve the *repo* root, not `.storybook` */
    viteConfig.root = resolve(__dirname, "..");

    /* b) keep your existing alias so "@/…"' still works */
    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias || {}),
      "@": resolve(__dirname, "../src"),
    };
    
    return viteConfig;
  },

  docs: {
    autodocs: true
  },

  typescript: {
    reactDocgen: "react-docgen-typescript"
  }
};

export default config;
