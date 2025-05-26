import preset from "tailwindcss/preset";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset()],        // ← restores slate/gray/red/…
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/styles/**/*.{css}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",   // 👈 add Storybook dir
  ],
};
