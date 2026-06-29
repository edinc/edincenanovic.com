// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { FEATURES } from "./src/consts";

// Deploy-target toggle (see README "Deployment"):
//   • default               → custom-domain build: served at the domain root,
//                              canonical URLs on https://edincenanovic.com.
//   • DEPLOY_TARGET=project  → temporary GitHub Pages *project* URL
//                              https://edinc.github.io/edincenanovic.com/ for
//                              pre-DNS verification; sets the matching `base` so
//                              asset/link paths resolve under the sub-path.
const projectPages = process.env.DEPLOY_TARGET === "project";

// https://astro.build/config
export default defineConfig({
  // Production URL of the site. Used for canonical URLs, sitemap and RSS.
  site: projectPages ? "https://edinc.github.io" : "https://edincenanovic.com",
  base: projectPages ? "/edincenanovic.com" : undefined,
  integrations: [
    mdx(),
    // Drop hidden sections from the sitemap (blog and projects are flag-gated).
    sitemap({
      filter: (page) =>
        (FEATURES.blog || !/\/blog(\/|$)/.test(page)) &&
        (FEATURES.projects || !/\/projects(\/|$)/.test(page)),
    }),
  ],
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
