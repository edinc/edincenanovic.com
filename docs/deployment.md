# Deployment & custom domain

The site is hosted on **GitHub Pages**, deployed by GitHub Actions
([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)) on every push
to `main`. Requires a **public** repo (GitHub Free) or GitHub Pro for private
Pages.

The build target is controlled by the `DEPLOY_TARGET` env in
[`astro.config.mjs`](../astro.config.mjs).

## Custom domain (current)

The deploy workflow builds with the default target — `site:
https://edincenanovic.com`, no `base` — and ships `public/CNAME`
(`edincenanovic.com`). The site is served from the apex domain root:

```
https://edincenanovic.com/
```

### DNS

The domain points at GitHub Pages with apex `A` records → the
[GitHub Pages IP addresses][pages-apex] and a `www` `CNAME` → `edinc.github.io`:

| Type  | Host  | Value             |
| ----- | ----- | ----------------- |
| A     | `@`   | `185.199.108.153` |
| A     | `@`   | `185.199.109.153` |
| A     | `@`   | `185.199.110.153` |
| A     | `@`   | `185.199.111.153` |
| CNAME | `www` | `edinc.github.io` |

### One-time GitHub setup

**Settings → Pages → Source = "GitHub Actions"**, **Custom domain =
`edincenanovic.com`**, then enable **Enforce HTTPS** once the certificate is
issued (GitHub provisions it automatically after DNS resolves to Pages).

## Pre-DNS verification (optional)

Setting `DEPLOY_TARGET=project` builds with `site: https://edinc.github.io` and
`base: /edincenanovic.com`, publishing to the temporary GitHub Pages **project
URL** (`https://edinc.github.io/edincenanovic.com/`). Useful for verifying the
pipeline without touching DNS; not used by the current workflow.

> Internal links and `public/` asset references use the `withBase()` helper
> ([`src/lib/url.ts`](../src/lib/url.ts)) so they resolve correctly under both
> the project sub-path and the apex root.

## Making changes

Apply deploy changes via a PR and merge to `main`; each push re-runs the deploy
workflow.

[pages-apex]: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain
