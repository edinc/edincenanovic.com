/**
 * Cloudflare Web Analytics — gating logic for the cookieless beacon.
 *
 * Kept pure and framework-agnostic so it is unit-tested in isolation; the
 * component layer (BaseHead) just renders the beacon when this returns a token.
 */

/**
 * Decide whether to emit the Cloudflare Web Analytics beacon, and with which
 * token.
 *
 * The beacon only loads in **production** builds (never from `npm run dev`, so
 * local browsing doesn't pollute the stats), and only when a non-empty token is
 * configured. Returns the trimmed token when analytics should load, otherwise
 * `null`.
 *
 * @param rawToken      The configured beacon token (public; ships in page HTML).
 * @param isProduction  Whether this is a production build (`import.meta.env.PROD`).
 */
export function cloudflareBeaconToken(
  rawToken: string,
  isProduction: boolean
): string | null {
  const token = rawToken.trim();
  if (!isProduction || token === "") return null;
  return token;
}
