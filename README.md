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
- `@astrojs/rss` (blog RSS, when enabled), `@astrojs/sitemap`, `@astrojs/mdx`
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

## Documentation

Task guides live in [`docs/`](docs/):

- **[Authoring content](docs/authoring.md)** — add a blog post, and change site
  copy, bio, social links and design tokens.
- **[Deployment & custom domain](docs/deployment.md)** — GitHub Pages deploy, the
  `DEPLOY_TARGET` build toggle, and the custom-domain / DNS setup.

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
