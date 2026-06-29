// Extension: cf-analytics
// A Copilot CLI canvas that renders Cloudflare Web Analytics (RUM) for a site,
// querying the Cloudflare GraphQL Analytics API.
//
// Secrets never live in this file or the repo. Config is read at runtime from
// (in priority order):
//   1. env vars  CF_API_TOKEN, CF_ACCOUNT_TAG, CF_SITE_TAG
//   2. a local file  $COPILOT_HOME/extensions/cf-analytics/.config.json
//      { "apiToken": "...", "accountTag": "...", "siteTag": "...", "siteLabel": "..." }
// The API token is a real secret — keep it in env or that local file, never in git.

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { joinSession, createCanvas, CanvasError } from "@github/copilot-sdk/extension";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CF_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";
// NOTE: the GraphQL `siteTag` is NOT the page beacon token. It's a separate
// RUM site identifier; discover it by grouping rumPageloadEventsAdaptiveGroups
// by `siteTag` with no siteTag filter, or via the RUM site_info API. Provide it
// via .config.json (`siteTag`) or the CF_SITE_TAG env var — no value is bundled
// here so this file is safe to commit to a public repo.
const DEFAULT_SITE_TAG = "";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function configPath() {
  const home = process.env.COPILOT_HOME || join(homedir(), ".copilot");
  return join(home, "extensions", "cf-analytics", ".config.json");
}

function loadConfig() {
  let file = {};
  try {
    file = JSON.parse(readFileSync(configPath(), "utf8"));
  } catch {
    /* no local config file — fall back to env / defaults */
  }
  return {
    apiToken: process.env.CF_API_TOKEN || file.apiToken || "",
    accountTag: process.env.CF_ACCOUNT_TAG || file.accountTag || "",
    siteTag: process.env.CF_SITE_TAG || file.siteTag || DEFAULT_SITE_TAG,
    siteLabel: file.siteLabel || "edincenanovic.com",
  };
}

function rangeWindow(input) {
  const until = new Date();
  const since = new Date(until);
  let range = input;
  let seriesDim;
  if (range === "24h") {
    since.setUTCHours(since.getUTCHours() - 24);
    seriesDim = "datetimeHour";
  } else if (range === "30d") {
    since.setUTCDate(since.getUTCDate() - 30);
    seriesDim = "date";
  } else {
    range = "7d";
    since.setUTCDate(since.getUTCDate() - 7);
    seriesDim = "date";
  }
  return { range, since: since.toISOString(), until: until.toISOString(), seriesDim };
}

function buildQuery({ accountTag, siteTag, since, until, seriesDim }) {
  const f = `siteTag: "${siteTag}", datetime_geq: "${since}", datetime_leq: "${until}"`;
  return `{
  viewer {
    accounts(filter: { accountTag: "${accountTag}" }) {
      totals: rumPageloadEventsAdaptiveGroups(filter: { ${f} }, limit: 1) {
        count
        sum { visits }
      }
      series: rumPageloadEventsAdaptiveGroups(filter: { ${f} }, limit: 500, orderBy: [${seriesDim}_ASC]) {
        count
        sum { visits }
        dimensions { ts: ${seriesDim} }
      }
      pages: rumPageloadEventsAdaptiveGroups(filter: { ${f} }, limit: 15, orderBy: [count_DESC]) {
        count
        sum { visits }
        dimensions { k: requestPath }
      }
      referrers: rumPageloadEventsAdaptiveGroups(filter: { ${f} }, limit: 15, orderBy: [count_DESC]) {
        count
        dimensions { k: refererHost }
      }
      countries: rumPageloadEventsAdaptiveGroups(filter: { ${f} }, limit: 15, orderBy: [count_DESC]) {
        count
        sum { visits }
        dimensions { k: countryName }
      }
    }
  }
}`;
}

function setupHtml() {
  const p = configPath();
  return [
    "<strong>Connect Cloudflare Web Analytics</strong>",
    "<p>Create a read-only API token and save it locally — it never enters the repo.</p>",
    "<ol>",
    "<li>Cloudflare dashboard → <strong>My Profile → API Tokens → Create Token</strong> → custom token with permission <code>Account · Account Analytics · Read</code>, scoped to your account.</li>",
    "<li>Grab your <strong>Account ID</strong> (Account Home, or the dashboard URL).</li>",
    "<li>Create <code>" + escapeHtml(p) + "</code>:</li>",
    "</ol>",
    "<pre>{\n  \"apiToken\": \"&lt;your-token&gt;\",\n  \"accountTag\": \"&lt;your-account-id&gt;\",\n  \"siteTag\": \"&lt;rum-site-tag (NOT the page beacon token)&gt;\"\n}</pre>",
    "<p>Then press ↻. (Or set <code>CF_API_TOKEN</code> and <code>CF_ACCOUNT_TAG</code> as env vars instead.)</p>",
  ].join("");
}

function notConfigured() {
  const err = new Error(setupHtml());
  err.code = "not_configured";
  return err;
}

async function fetchStats(rangeInput) {
  const cfg = loadConfig();
  if (!cfg.apiToken || !cfg.accountTag) throw notConfigured();

  const win = rangeWindow(rangeInput);
  const query = buildQuery({ accountTag: cfg.accountTag, siteTag: cfg.siteTag, ...win });

  const res = await fetch(CF_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.apiToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = json && json.errors ? ": " + json.errors.map((e) => e.message).join("; ") : "";
    throw new Error(`Cloudflare API HTTP ${res.status}${detail}`);
  }
  if (json.errors && json.errors.length) throw new Error(json.errors.map((e) => e.message).join("; "));

  const acct = json.data && json.data.viewer && json.data.viewer.accounts && json.data.viewer.accounts[0];
  if (!acct) throw new Error("No account data returned — check the account ID (accountTag).");

  const totals = (acct.totals && acct.totals[0]) || { count: 0, sum: { visits: 0 } };
  const mapRows = (arr) =>
    (arr || []).map((g) => ({ key: g.dimensions.k, count: g.count, visits: g.sum ? g.sum.visits : undefined }));

  return {
    site: cfg.siteLabel,
    range: win.range,
    visits: (totals.sum && totals.sum.visits) || 0,
    pageViews: totals.count || 0,
    series: (acct.series || []).map((g) => ({ ts: g.dimensions.ts, visits: g.sum ? g.sum.visits : 0, count: g.count })),
    pages: mapRows(acct.pages),
    referrers: mapRows(acct.referrers),
    countries: mapRows(acct.countries),
    updatedAt: new Date().toISOString(),
  };
}

// One loopback HTTP server per open canvas instance (stateless — config and
// data are read per request, so editing config.json takes effect on refresh).
const servers = new Map();

function sendJson(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

async function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      if (url.pathname === "/api/stats") {
        const range = url.searchParams.get("range") || "7d";
        try {
          const data = await fetchStats(range);
          sendJson(res, 200, { ok: true, data });
        } catch (e) {
          sendJson(res, 200, { ok: false, error: { code: e.code || "error", message: e.message } });
        }
        return;
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(readFileSync(join(__dirname, "index.html")));
    } catch {
      res.statusCode = 500;
      res.end("error");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  return { server, url: `http://127.0.0.1:${port}/` };
}

const session = await joinSession({
  canvases: [
    createCanvas({
      id: "cf-analytics",
      displayName: "Cloudflare Analytics",
      description:
        "Cloudflare Web Analytics dashboard for edincenanovic.com — visits, page views, top pages, referrers and countries.",
      actions: [
        {
          name: "refresh",
          description:
            "Fetch the latest Cloudflare Web Analytics summary (visits, page views, top pages) for a time range.",
          inputSchema: {
            type: "object",
            properties: { range: { type: "string", enum: ["24h", "7d", "30d"] } },
          },
          handler: async (ctx) => {
            const range = (ctx.input && ctx.input.range) || "7d";
            try {
              const d = await fetchStats(range);
              return {
                site: d.site,
                range: d.range,
                visits: d.visits,
                pageViews: d.pageViews,
                topPages: d.pages.slice(0, 5).map((p) => ({ path: p.key, views: p.count })),
                topCountries: d.countries.slice(0, 5).map((c) => ({ country: c.key, views: c.count })),
              };
            } catch (e) {
              if (e.code === "not_configured") {
                throw new CanvasError(
                  "not_configured",
                  "Cloudflare analytics isn't configured yet — open the canvas for setup steps."
                );
              }
              throw new CanvasError("error", e.message);
            }
          },
        },
      ],
      open: async (ctx) => {
        let entry = servers.get(ctx.instanceId);
        if (!entry) {
          entry = await startServer();
          servers.set(ctx.instanceId, entry);
        }
        return { title: "Cloudflare Analytics", url: entry.url };
      },
      onClose: async (ctx) => {
        const entry = servers.get(ctx.instanceId);
        if (entry) {
          servers.delete(ctx.instanceId);
          await new Promise((resolve) => entry.server.close(() => resolve()));
        }
      },
    }),
  ],
});

session.log?.("cf-analytics canvas ready", { level: "debug", ephemeral: true });
