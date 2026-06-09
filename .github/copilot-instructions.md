# Copilot instructions — edincenanovic.com

Project context for anyone (human or AI) changing this repository. The **process
is owned by** [`AGENTS.md`](../AGENTS.md) (workflow, testing, the three-review
protocol, guardrails) — this file is the **project map + conventions**, and
restates only the workflow non-negotiables so a Copilot session that loads only
this file still knows the hard rules.

## What this is

A custom, terminal-themed personal site for Edin Cenanovic. Built from scratch —
**no site template/theme**. Ships as a fully static site (Stage B target:
GitHub Pages). Fast, accessible, JS-light.

## Tech stack

- **Astro 5** (`output: "static"`) + **TypeScript** (strict).
- **Plain CSS** with custom properties — no Tailwind/UI framework.
- **Content collections** (MDX) for the blog, validated with Zod.
- `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/mdx`.
- Tests: **Vitest** (unit) + **Playwright** (E2E).
- Font: `@fontsource-variable/jetbrains-mono`. No client UI framework.

## Project structure

```
src/
  components/      Astro components (Header, Footer, PostCard, BaseHead, …)
  layouts/         BaseLayout (shell) + PostLayout (blog post)
  pages/           Routes: index, blog/, 404, rss.xml.js
  lib/             Pure, framework-agnostic TS logic (UNIT-TESTED)
  content/blog/    Markdown/MDX posts
  styles/global.css  Design tokens + primitives
  consts.ts        Single source of truth for ALL site content
  content.config.ts  Blog collection schema (Zod)
test/
  unit/            Vitest specs for src/lib
  e2e/             Playwright specs (regression guards)
public/            Static assets served as-is (robots.txt, favicon, …)
```

## Commands

```bash
npm run dev        # dev server (localhost:4321)
npm run build      # production build to dist/
npm run check      # astro check (types + template diagnostics)
npm run test       # unit + e2e
npm run test:unit  # Vitest only
npm run test:e2e   # Playwright only (builds + previews on 4322)
```

A change is "green" only when `npm run check`, `npm run build`, and `npm run test`
all pass with **0 errors / 0 warnings**.

## Conventions

- **Content lives in `src/consts.ts`** (name, role, bio, socials, nav, SITE
  metadata). Do not hardcode copy in components — edit `consts.ts`.
- **Logic lives in `src/lib/`** as pure functions and is unit-tested. Components
  import from `src/lib`; they should contain markup + styling, not business
  logic. When you add non-trivial logic to a component, extract it to `src/lib`
  and write a unit test.
- **Design tokens** (colors, spacing, widths) are CSS custom properties in
  `global.css`. Reuse tokens; don't introduce one-off magic numbers.
- **Accessibility matters**: preserve heading order (no skipped levels), keep
  skip-link contrast ≥ AA, keep tap targets reasonable, prefer semantic HTML.
- **SEO**: canonical URLs, JSON-LD (via `src/lib/seo.ts`), and `name=`-based
  Twitter meta are load-bearing — covered by E2E tests.
- Keep client JS minimal and inline only where needed (theme no-flash, 404 path,
  copy buttons). No frameworks.

## Mandatory workflow

The full, authoritative process lives in [`AGENTS.md`](../AGENTS.md) — §1 workflow,
§2 testing, §3 the three-review protocol, §4 guardrails. **Read it before changing
code.** The non-negotiables, in brief:

- **Branch first** — never commit to `main`.
- **Tests with every change** — unit tests for `src/lib`, Playwright for
  UI/SEO/layout; encode every fixed bug as a regression test.
- **Three independent reviews** — security, code-review, quality — before "done".
- **No regressions** — `npm run check && npm run build && npm run test` all green.
- **No merge to `main` without maintainer approval.**
- **Commits** — conventional subject + the required `Co-authored-by` trailer
  (see `AGENTS.md` §4).

Goal: **never introduce a regression.** When in doubt, add a test that proves the
behavior, then make the change.
