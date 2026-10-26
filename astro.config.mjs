import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import yaml from "@rollup/plugin-yaml";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  vite: {
      plugins: [yaml()],
      resolve: {
        // tsconfig "paths" only cover JS/TS imports; Sass @use needs a Vite alias
        alias: {
          "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
        },
      },
	},

  site: "https://ogreifv2.sachagreif.com",
  prefetch: true,
  integrations: [
    mdx(),
    sitemap({
      // skip the root locale-detection page and the 404 page
      filter: (page) =>
        page !== "https://ogreifv2.sachagreif.com/" && !page.endsWith("/404/"),
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-US", fr: "fr-FR" },
      },
    }),
  ],
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
      // src/pages/index.astro handles the redirect itself
      redirectToDefaultLocale: false,
    },
  },
});