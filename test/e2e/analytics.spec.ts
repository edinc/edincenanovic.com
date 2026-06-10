import { test, expect } from "@playwright/test";
import { ANALYTICS } from "../../src/consts";

test("cloudflare web analytics beacon is wired into the production build", async ({
  page,
}) => {
  // Keep the test hermetic — don't actually reach out to Cloudflare's CDN.
  await page.route("https://static.cloudflareinsights.com/**", (route) =>
    route.abort()
  );
  await page.goto("/");

  const beacon = page.locator(
    'script[src="https://static.cloudflareinsights.com/beacon.min.js"]'
  );
  await expect(beacon).toHaveCount(1);
  // The public token rides along in the data-cf-beacon JSON attribute.
  await expect(beacon).toHaveAttribute(
    "data-cf-beacon",
    new RegExp(`"token":\\s*"${ANALYTICS.cloudflareToken}"`)
  );
});
