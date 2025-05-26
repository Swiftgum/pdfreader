import "../src/styles/tailwind.css";
import React from "react";
import type { Preview, Decorator } from "@storybook/react";

/* ------------------------------------------------------------------
   1.  Pick any tiny PDF to satisfy the viewer. Put it in /static
       (because staticDirs: ["../static"]) or import one from node_modules.
   -----------------------------------------------------------------*/
import samplePdf from "../static/brochure.pdf?url";     // vite ?url loader

/* 2.  Import the provider component from your library ---------------*/
import { Root } from "../src/components";             // adjust path if needed

/* 3.  Decorator: wrap every story (and autodocs) in <Root> ----------*/
const withPdfProvider: Decorator = (Story) => (
  <Root fileURL={samplePdf}>
    <Story />
  </Root>
);

/* 4.  Storybook global preview config --------------------------------*/
const preview: Preview = {
  decorators: [withPdfProvider],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    /* If you still don't want auto-docs for low-level components
       that only make sense inside Root, add:
       docs: { disable: true }
       in their individual *.stories.* files. */
  },
};

export default preview;
