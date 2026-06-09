// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  // Production URL of the site. Used for canonical URLs, sitemap and RSS.
  // (Local-first: this is only consumed at build time; dev runs on localhost.)
  site: "https://edincenanovic.com",
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      // Dual themes so code blocks adapt to the active light/dark theme.
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
  },
});
