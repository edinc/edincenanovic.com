# edincenanovic.com

[![CI](https://github.com/edinc/edincenanovic.com/actions/workflows/ci.yml/badge.svg)](https://github.com/edinc/edincenanovic.com/actions/workflows/ci.yml)
[![Deploy](https://github.com/edinc/edincenanovic.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/edinc/edincenanovic.com/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Content: CC BY-NC-ND 4.0](https://img.shields.io/badge/content-CC%20BY--NC--ND%204.0-lightgrey.svg)](LICENSE-content)
[![Built with Astro](https://img.shields.io/badge/built%20with-Astro-BC52EE.svg)](https://astro.build)

A custom, **terminal-themed** personal site for Edin Cenanovic — built from
scratch with [Astro](https://astro.build) (no third-party theme). The shell
aesthetic is purely visual: every page is real, static HTML with minimal JS.
Presentation-first today, blog-ready by design.

## Stack

- **[Astro 5](https://astro.build)** (`output: "static"`) + **TypeScript** (strict)
- **Plain CSS** with custom-property design tokens — no Tailwind/UI framework
- **Content collections** (Markdown/MDX) for the blog, validated with **Zod**
- `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/mdx`
- **JetBrains Mono** via `@fontsource-variable` (self-hosted)
- Tests: **Vitest** (unit) + **Playwright** (E2E)

## Local development

Requires **Node 20+** and npm.

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:4321
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## Project structure

```
src/
  components/        Astro components (Header, Footer, PostCard, BaseHead, …)
  layouts/           BaseLayout (shell) + PostLayout (blog post)
  pages/             Routes: index, blog/, 404, rss.xml.js
  lib/               Pure, framework-agnostic TS logic (unit-tested)
  content/blog/      Markdown/MDX posts
  styles/global.css  Design tokens + terminal primitives
  consts.ts          Single source of truth for ALL site content
  content.config.ts  Blog collection schema (Zod)
test/
  unit/              Vitest specs for src/lib
  e2e/               Playwright regression specs
public/              Static assets served as-is (CNAME, robots.txt, favicon, …)
```

See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for the
full project map and conventions.

## Add a blog post

1. Create `src/content/blog/my-post.md` (the filename becomes the URL slug).
2. Add front matter:
   ```md
   ---
   title: "My post title"
   description: "One-line summary for cards, SEO and RSS."
   pubDate: 2026-06-10
   tags: ["devops", "astro"]
   draft: false
   ---

   Your Markdown content here.
   ```
3. `npm run dev` to preview. Set `draft: true` to keep it out of production
   builds. That's the entire workflow — no database, no CMS.

## Change site content

All copy — name, role, bio, social links, nav, and site metadata — lives in
[`src/consts.ts`](src/consts.ts). Edit that one file; components stay
presentational. Design tokens (colors, spacing, widths) are CSS custom
properties in [`src/styles/global.css`](src/styles/global.css).

## Testing

```bash
npm run check      # astro check (types + template diagnostics)
npm run test       # unit + e2e
npm run test:unit  # Vitest only
npm run test:e2e   # Playwright only (builds + previews on :4322)
```

A change is "green" only when `npm run check`, `npm run build`, and
`npm run test` all pass with **0 errors / 0 warnings**. CI
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the same gate on
every push and pull request.

## Deployment

Hosted on **GitHub Pages**, deployed by GitHub Actions
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) on every push to
`main`. Requires a **public** repo (GitHub Free) or GitHub Pro for private Pages.

Deployment happens in two phases, controlled by the `DEPLOY_TARGET` build env in
`astro.config.mjs`:

### Phase 1 — temporary project URL (current)

The deploy workflow sets `DEPLOY_TARGET=project`, which builds with
`site: https://edinc.github.io` and `base: /edincenanovic.com` and publishes to
the GitHub Pages **project URL**:

```
https://edinc.github.io/edincenanovic.com/
```

This lets us verify the live pipeline before touching DNS. No `CNAME` is shipped
in this phase. **One-time setup:** repo **Settings → Pages → Build and deployment
→ Source = "GitHub Actions"**.

### Phase 2 — custom domain cutover (later)

When the design is verified on the project URL:

1. Remove `DEPLOY_TARGET` from `deploy.yml` (the default build targets the apex
   domain root: `site: https://edincenanovic.com`, no `base`).
2. Add `public/CNAME` containing `edincenanovic.com` (served from `/`).
3. At your registrar, add apex `A`/`AAAA` records → the
   [GitHub Pages IP addresses][pages-apex] and a `www` `CNAME` →
   `edinc.github.io`; keep the existing site live until DNS propagates.
4. Enable **Settings → Pages → Enforce HTTPS** once the certificate is issued.

Apply these via a PR and merge to `main`; each push re-runs the deploy workflow.

[pages-apex]: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain

> Internal links and `public/` asset references use the `withBase()` helper
> (`src/lib/url.ts`) so they resolve correctly under both the project sub-path
> and the apex root.

## Contributing & agents

This repo uses an explicit, test-first workflow (feature branch → tests → three
independent reviews → no regressions). If you (or an AI agent) are changing the
code, read these first:

- [`AGENTS.md`](AGENTS.md) — the authoritative workflow, testing rules, and
  review protocol.
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — project
  map and conventions.

## License

This project is **dual-licensed**:

- **Code** — [MIT](LICENSE) (components, layouts, styles, config, build tooling).
- **Content** — [CC BY-NC-ND 4.0](LICENSE-content) (blog writing and images
  under `src/content/` and `src/assets/`): share with credit, no commercial use,
  no derivatives.
