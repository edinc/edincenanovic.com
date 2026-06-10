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

test("blog is hidden from the nav and the home page", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "blog" })
  ).toHaveCount(0);
  // The home "latest posts" section (aria-labelledby="posts-heading") is gone.
  await expect(page.locator("#posts-heading")).toHaveCount(0);
});

test("the blog index redirects to home while the blog is hidden", async ({
  request,
}) => {
  const res = await request.get("/blog/");
  expect(res.status()).toBe(200);
  expect(await res.text()).toMatch(/http-equiv=["']?refresh/i);
});
