import { test, expect } from "@playwright/test";

test("home emits a Person + WebSite JSON-LD graph", async ({ page }) => {
  await page.goto("/");
  const raw = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(raw).toBeTruthy();
  const data = JSON.parse(raw!);
  const types = (data["@graph"] as Array<{ "@type": string }>).map(
    (n) => n["@type"]
  );
  expect(types).toContain("Person");
  expect(types).toContain("WebSite");
});

test("twitter card meta uses name= not property=", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
  await expect(page.locator('meta[property="twitter:card"]')).toHaveCount(0);
});

test("404 page is noindex and reflects the requested path via JS", async ({
  page,
}) => {
  const res = await page.goto("/this-path-does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );
  // The inline script rewrites the placeholder to the real client path.
  await expect(page.locator("[data-nf-path]").first()).toHaveText(
    /\/this-path-does-not-exist\//
  );
});

test("blog index has a single h1 and no skipped heading levels", async ({
  page,
}) => {
  await page.goto("/blog/");
  await expect(page.locator("h1")).toHaveCount(1);
  // Post titles are h2 now; there should be no h3 jump on this page.
  expect(await page.locator("main h3").count()).toBe(0);
});
