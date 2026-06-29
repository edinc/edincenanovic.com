# cf-analytics canvas extension

A GitHub Copilot CLI **canvas extension** that renders this site's
[Cloudflare Web Analytics](https://developers.cloudflare.com/analytics/web-analytics/)
(RUM) — visits, page views, top pages, referrers and countries — in a side panel,
querying the Cloudflare GraphQL Analytics API.

It is a local developer tool, **not** part of the Astro site build: nothing here
ships to `dist/` or runs in the browser. Copilot CLI auto-discovers extensions in
`.github/extensions/`, so committing it here makes the "Cloudflare Analytics"
canvas available in every session opened on this repo.

## Configuration (secrets stay local)

No credentials live in this folder or anywhere in git. At runtime the extension
reads config in priority order:

1. Environment variables: `CF_API_TOKEN`, `CF_ACCOUNT_TAG`, `CF_SITE_TAG`
2. A local file at `~/.copilot/extensions/cf-analytics/.config.json`:

   ```json
   {
     "apiToken": "<cloudflare-api-token-with-Account-Analytics-Read>",
     "accountTag": "<your-cloudflare-account-id>",
     "siteTag": "<rum-site-tag-NOT-the-page-beacon-token>",
     "siteLabel": "edincenanovic.com"
   }
   ```

See [`config.example.json`](./config.example.json) for the template. Create a
**read-only** Cloudflare API token (permission: `Account · Account Analytics ·
Read`). The `siteTag` is the RUM site identifier — **not** the page beacon token
embedded in the site's HTML.

If it isn't configured, the canvas shows setup instructions instead of data.
