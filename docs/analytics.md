# Analytics & monitoring

Visitor analytics use
**[Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/)** — free,
**cookieless** (no consent banner) and privacy-friendly. It reports visitors,
page views, top pages, referrers, and countries / devices / browsers / OS, plus
Core Web Vitals.

## How it's wired

- A single deferred **beacon** script is added to every page's `<head>` by
  [`src/components/BaseHead.astro`](../src/components/BaseHead.astro).
- It loads from Cloudflare's CDN — **no DNS or nameserver change is required**;
  the site stays on GitHub Pages.
- The beacon **only loads in production builds**. Local `npm run dev` never
  beacons, so your own browsing doesn't pollute the stats. The gating lives in
  [`src/lib/analytics.ts`](../src/lib/analytics.ts) (`cloudflareBeaconToken`,
  unit-tested) and an E2E test asserts the beacon ships in the production build.

## The token

The beacon **token** is stored in `ANALYTICS.cloudflareToken` in
[`src/consts.ts`](../src/consts.ts). It is **public** — it ships in the page HTML
for every visitor — so it is not a secret and lives in source. Set it to an empty
string to disable analytics entirely.

## Add, rotate or replace the token

1. In the [Cloudflare dashboard](https://dash.cloudflare.com/) → **Web
   Analytics**, add (or open) the site for `edincenanovic.com` and choose the JS
   snippet option.
2. Copy the token — the value inside `data-cf-beacon='{"token": "…"}'`.
3. Update `ANALYTICS.cloudflareToken` in `src/consts.ts` and ship via a PR.

## Viewing the stats

Open the **Web Analytics** section of the Cloudflare dashboard and select
`edincenanovic.com`. Data appears shortly after the first production visits.
