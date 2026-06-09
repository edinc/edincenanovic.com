# Implementation Plan — edincenanovic.com (terminal-style personal site)

> A custom, **from-scratch** terminal-themed personal site to replace the current
> WordPress site at <https://edincenanovic.com/>. Presentation-first now, blog-ready
> for later. Built on open-source tooling, deployed free via GitHub Pages + GitHub
> Actions. This plan operationalizes the two prior research reports in
> `~/.copilot/session-state/.../files/research/`.

---

## 1. Goals & Non-Goals

### Goals
- **Local-first workflow** — build and iterate the design entirely on `localhost` first; **defer all deployment, GitHub Actions, `CNAME`, and DNS until the design is approved**.
- **Presentation page** (bio + role + social links) as the primary surface — feature parity with the current site on day one.
- **Blog-ready** architecture so adding posts later is just dropping a Markdown file (no re-platforming).
- **Terminal / geeky aesthetic** that stays clean and readable (not a gimmick).
- **100% open-source stack**, no WordPress, no database, content in Git as Markdown.
- **Free hosting** on **GitHub Pages**, **deployed via GitHub Actions** on push to `main`.
- **Custom theme authored from scratch** — no third-party Astro/Hugo theme; all layouts, components, and CSS are ours.
- Fast, accessible (WCAG AA), high Lighthouse, SEO-friendly (sitemap, RSS, OG tags).

### Non-Goals (for v1)
- **No interactive terminal / shell** — the terminal style is purely an aesthetic; there are no typed commands or REPL behavior.
- No comments, full-text search, or analytics in v1 (designed-for, added later).
- No headless CMS / GUI editor (Markdown-in-repo is the workflow).
- No bulk WordPress content migration unless meaningful post history exists (assumed minimal).

---

## 2. Tech Stack Decision

**Chosen: Astro 5 (TypeScript), hand-authored theme.**

| Decision | Choice | Rationale |
|---|---|---|
| Generator | **Astro 5** | Node 20 already installed → buildable & verifiable locally (`npm run build`); component model makes a bespoke terminal UI easy; native Markdown/MDX content collections for "blog later"; ships ~zero JS by default → great performance/SEO. Prior research flagged Astro as the "bespoke custom design" path, which matches "build a theme from scratch". |
| Theme | **From scratch** | No AstroPaper/third-party theme. We author all layouts, components, and CSS so it is genuinely *our* theme. |
| Styling | **Plain CSS + design tokens** (CSS custom properties) | No Tailwind/framework dependency; keeps it simple, geeky, and fully owned; easy theming (dark/light). |
| Content | **Markdown/MDX content collection** | Type-safe front matter via Zod schema; posts are plain files in `src/content/blog/`. |
| Fonts | **JetBrains Mono** via `@fontsource-variable` (self-hosted, OFL) | Authentic monospace terminal look, no external font CDN, privacy-friendly. Fallback to system mono stack. |
| Hosting | **GitHub Pages** | Free; native GitHub Actions deploy; custom apex+`www` domain with free HTTPS. (Cloudflare Pages noted as alternative.) |
| CI/CD | **GitHub Actions** (`withastro/action` + `actions/deploy-pages`) | Push to `main` → build → deploy. |

**Alternatives considered:** Hugo + `hugo-theme-terminal` (fastest pre-made terminal look, but that's *using* a theme, not building one, and Hugo binary isn't installed); plain HTML/CSS (truest "from scratch" but painful for "blog later"). Astro is the best balance of *from-scratch ownership* + *blog-ready* + *verifiable*.

> **Risk/assumption:** `@fontsource` + Astro packages install fine on Node 20. If `npm install` fails offline, fall back to a system monospace stack (no functional impact).

---

## 3. Design System (terminal aesthetic)

Informed by research on popular dev sites (minimalism, strong typography, dark-mode, post cards, subtle motion — Brittany Chiang / leerob / Josh Comeau) and terminal-UI best practices (accessible contrast, prompt element, blinking cursor).

- **Type:** JetBrains Mono (variable), base `16px`, line-height ~`1.65`, readable measure ~`72ch`.
- **Color:** GitHub-like, accessible palette. **Avoid harsh `#00FF00` on black** (poor for long reading). Dark default:
  - bg `#0d1117`, surfaces `#161b22`, text `#c9d1d9`, strong `#f0f6fc`, muted `#8b949e`, border `#30363d`.
  - accents: green `#3fb950` (prompt), blue `#58a6ff` (links), amber `#d29922` (highlights), red `#f85149` (danger).
  - Light theme via `[data-theme="light"]` token overrides.
- **Terminal motifs:**
  - Prompt lines: `edin@edincenanovic.com:~$ <command>` with green `PS1`.
  - Sections framed as commands: `whoami`, `cat about.md`, `ls ~/socials`, `ls ~/posts`.
  - Blinking block cursor (CSS, disabled under `prefers-reduced-motion`).
  - A "terminal window" card with traffic-light chrome dots for the hero.
- **Motion:** subtle only (cursor blink, card hover-lift); all gated behind `prefers-reduced-motion`.
- **No interactivity:** the terminal look is **purely visual/aesthetic** — static markup styled to evoke a shell. No command input, no fake REPL, no typed commands. Everything is real, static HTML.
- **Accessibility:** semantic HTML, skip-link, visible `:focus-visible`, AA contrast. The prompt/command motifs are decorative (`aria-hidden` where appropriate) so screen readers read the actual headings and content, not the `$` decorations.
- **Theme toggle:** dark/light, persisted to `localStorage`, respects `prefers-color-scheme`, inline no-flash script in `<head>`.

---

## 4. Information Architecture

| Route | Purpose |
|---|---|
| `/` | Presentation/home: hero (`whoami`), bio (`cat about.md`), socials (`ls ~/socials`), latest posts (`ls ~/posts`). All static — the commands are styling, not inputs. |
| `/blog` | Post index (cards: title, date, description, tags). |
| `/blog/<slug>` | Individual post (prose + metadata). |
| `/rss.xml` | RSS feed. |
| `/404` | Terminal-style "command not found" page. |
| `/sitemap-index.xml` | Auto-generated sitemap. |

Nav: `home`, `blog` (+ theme toggle). Footer: social row + "built with Astro, hosted on GitHub Pages" + repo link ("how this site is built" — a researched pattern).

---

## 5. Project Structure (target)

```
/
├── .github/workflows/deploy.yml      # [STAGE B] GitHub Pages via Actions
├── .gitignore
├── astro.config.mjs                  # site URL, mdx + sitemap, shiki highlight
├── package.json
├── tsconfig.json
├── README.md                         # theme + authoring + deploy docs
├── public/
│   ├── favicon.svg                   # terminal-prompt glyph
│   ├── CNAME                         # [STAGE B] edincenanovic.com
│   └── robots.txt                    # [STAGE B]
└── src/
    ├── consts.ts                     # SITE config: name, bio, role, socials, nav, repo
    ├── content.config.ts             # blog collection + Zod schema
    ├── styles/global.css             # design tokens + terminal styles
    ├── components/
    │   ├── BaseHead.astro            # meta/SEO/OpenGraph/canonical
    │   ├── Header.astro              # sticky nav + theme toggle
    │   ├── Footer.astro
    │   ├── Prompt.astro              # reusable `$ command` line
    │   ├── ThemeToggle.astro         # dark/light + no-flash script
    │   ├── SocialLinks.astro
    │   └── PostCard.astro
    ├── layouts/
    │   ├── BaseLayout.astro
    │   └── PostLayout.astro
    ├── content/blog/
    │   ├── hello-world.md            # sample post
    │   └── leaving-wordpress.md      # sample post
    └── pages/
        ├── index.astro
        ├── 404.astro
        ├── rss.xml.js
        └── blog/
            ├── index.astro
            └── [...slug].astro
```

---

## 6. Content Model (blog collection)

`src/content.config.ts` — Astro 5 glob loader + Zod schema:

```ts
title: string
description: string
pubDate: date (coerced)
updatedDate?: date
draft: boolean = false      // hidden from prod builds
tags: string[] = []
```

- Posts live in `src/content/blog/*.md(x)`; filename → slug.
- Adding a post later = create one Markdown file with front matter. That is the entire "blog later" workflow.

---

## 7. Deployment & Domain

- **Workflow:** `.github/workflows/deploy.yml` triggers on push to `main`; builds with Astro; publishes with `actions/deploy-pages`. Enable Pages → "GitHub Actions" source in repo settings.
- **Custom domain:** `public/CNAME` = `edincenanovic.com`; set `site: "https://edincenanovic.com"` in `astro.config.mjs`.
- **DNS cutover (low-risk):**
  1. Ship to the temporary `*.github.io` Pages URL and verify.
  2. Add apex `A`/`AAAA` (GitHub Pages IPs) + `www` `CNAME`; keep WordPress live until DNS propagates.
  3. Enable "Enforce HTTPS" once the cert is issued.
- **Alternative:** Cloudflare Pages (deploy via Git integration or `wrangler` in Actions) if faster edge/CDN is wanted later.

---

## 8. WordPress Migration

- Current visible content = bio + 4 social links → **hand-author** the home page (fastest, cleanest).
- If older posts exist: use `wordpress-to-hugo-exporter` (Markdown + front matter) or WordPress WXR export → convert; then drop into `src/content/blog/` and fix front matter, links, and images. (Deferred; not required for v1.)

---

## 9. Phased Roadmap (with acceptance criteria)

> **Local-first principle:** Everything in **Stage A runs only on `localhost`** via `npm run dev`.
> **No deployment artifacts are created in Stage A** — no GitHub Actions workflow, no `CNAME`,
> no Pages settings, no DNS changes, no pushing/publishing. We iterate on the design locally until
> you're happy. **Stage B (deployment) only begins after your explicit sign-off.**

---

### STAGE A — Local MVP & design iteration  _(local only, nothing deployed)_

**Definition of MVP:** the **presentation home page** with the terminal aesthetic and dark/light
toggle, rendering your real bio + social links, running on `localhost`. That's the minimum needed
for you to look at it, judge the design, and request tweaks. The blog engine and polish come after,
still locally, before any deployment.

#### A0 — Scaffold & tooling (local)
- Create `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`; `npm install`.
- **AC:** `npm run dev` serves a placeholder page on `localhost`; `npm run build` succeeds.

#### A1 — Design system & layout shell (local)
- `global.css` (tokens, terminal primitives), `BaseLayout`, `BaseHead`, `Header`, `Footer`, `ThemeToggle` (no-flash).
- **AC:** dark/light toggle works and persists; skip-link + focus styles present; no flash/layout shift.

#### A2 — Presentation home — **THE MVP** (local)
- `consts.ts` (real bio + socials), `index.astro` hero (`whoami`/`cat about.md`/`ls ~/socials`), `Prompt`, `SocialLinks`, `favicon.svg`.
- **AC:** Home shows your real info (bio + Instagram/LinkedIn/Twitter/GitHub) in terminal style; responsive 320px→desktop; basic a11y (headings, contrast, labels). **→ first design review happens here.**

#### ⟳ A2.5 — Design iteration loop (local)
- You review on `localhost`; I tweak palette, type, spacing, layout, flourishes until you're satisfied.
- **AC:** you explicitly say the look & feel is good. _(This is the loop you asked for.)_

#### A3 — Blog engine (blog-ready, still local)
- `content.config.ts`, `PostLayout`, `PostCard`, `blog/index.astro`, `blog/[...slug].astro`, 2 sample posts, `rss.xml.js`, sitemap integration.
- **AC:** `/blog` lists posts; post pages render Markdown w/ code highlighting; `/rss.xml` + sitemap build locally; drafts excluded in prod build.

#### A4 — Geeky polish (static only, still local)
- Decorative terminal flourishes: prompt lines, blinking cursor, "terminal window" chrome dots, `$`-styled section headers — all static, no interactivity.
- 404 "command not found" page (static, terminal-styled).
- **AC:** flourishes are decorative (`aria-hidden`); reduced-motion respected; no JS required for content.

#### A5 — Local verification
- `npm run build` clean; preview via `astro preview` / browser canvas; keyboard nav + both themes + responsive spot-check.
- **AC:** clean build, no console errors, AA contrast in both themes.

### ✅ APPROVAL GATE — design sign-off
> **Nothing below this line starts until you say "I like it, let's deploy."**
> Up to this point the repo contains only source code that runs locally; there are **no**
> workflows, no `CNAME`, no DNS, and nothing is published anywhere.

---

### STAGE B — Deployment & automation  _(only after sign-off)_

#### B1 — Deploy config & docs
- Add `.github/workflows/deploy.yml`, `public/CNAME`, `public/robots.txt`; rewrite `README.md` (authoring + deploy + customization docs). Set Pages source → "GitHub Actions".
- **AC:** workflow builds & deploys to the temporary `*.github.io` Pages URL; README documents "add a post" and "change config" in <5 steps.

#### B2 — Custom domain & DNS cutover
- Confirm `site` URL + `CNAME`; add apex `A`/`AAAA` + `www` `CNAME`; keep WordPress live until DNS propagates; enable "Enforce HTTPS".
- **AC:** `https://edincenanovic.com` serves the new site with a valid cert.

#### B3 — Post-deploy verification
- Sanity-check the live URL: Lighthouse, links, RSS, sitemap, both themes, social/OG previews.
- **AC:** live site matches local; no regressions.

---

## 10. Verification & Quality Gates
- **Build:** `npm run build` is the primary gate after each phase.
- **Visual:** preview via browser canvas (responsive + both themes).
- **A11y:** keyboard-only pass, focus visibility, contrast, reduced-motion; confirm decorative prompt/cursor glyphs are ignored by screen readers.
- **SEO:** title/description/OG/canonical per page; sitemap + RSS present.

---

## 11. Future Enhancements (post-v1)
- Comments: **giscus** (GitHub Discussions) or **utterances** (Issues) — no DB.
- Search: **Pagefind** (static) once there are several posts.
- Analytics: GoatCounter / Plausible CE / Cloudflare Web Analytics (privacy-friendly).
- Per-post dynamic OG images; tag archive pages; reading time.

---

## 12. Assumptions & Open Questions
- **Stack preference:** assuming Astro (vs Hugo) — both meet requirements; Astro chosen for from-scratch ownership + verifiability. _Flag if Hugo is preferred._
- **Aesthetic:** confirmed — terminal look is **purely visual**. No interactive terminal/shell anywhere; command/prompt styling is decorative only.
- **Content volume:** assuming negligible WordPress post history (couldn't access wp-admin) → hand-rebuild over bulk migration.
- **Domain/registrar:** exact DNS records depend on current registrar; verify at cutover.
- **Email/contact:** current site exposes no email; contact = social links unless you provide one.
- **Commits:** will not commit/push without explicit instruction.

---

## 13. References (from prior research)
- Astro docs / GitHub Pages deploy: <https://docs.astro.build/en/guides/deploy/github/>
- Terminal aesthetics & a11y: terminal CSS patterns, WebAIM contrast.
- Inspiration: emmabostian/developer-portfolios, brittanychiang.com, leerob.com (next-mdx-blog), Josh Comeau.
- Hosting comparison & WordPress export: see `files/research/i-want-to-create-a-new-personal-site-the.md`.
- Theme/build details & popular-site analysis: see `files/research/can-you-build-me-a-theme-from-scratch-ba.md`.
