import { test, expect } from "@playwright/test";

test("projects appears in the nav and links to /projects", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("navigation").getByRole("link", { name: "projects" });
  await expect(link).toHaveCount(1);
  await link.click();
  await expect(page).toHaveURL(/\/projects\/?$/);
});

test("projects page renders a tile per project with a working repo link", async ({
  page,
}) => {
  await page.goto("/projects/");
  await expect(page.locator("h1")).toHaveText("projects");

  const cards = page.locator(".project-card");
  await expect(cards).toHaveCount(4);

  // Every tile links to its GitHub repo.
  const first = page.locator("a.project-card__link").first();
  await expect(first).toHaveAttribute("href", /github\.com\//);

  // Featured Azure platform project is pinned first, shown with a human title.
  await expect(cards.first().locator("h2")).toHaveText(
    "Azure Platform Engineering Landing Zone"
  );
});

test("every project tile shows a preview image with alt text", async ({
  page,
}) => {
  await page.goto("/projects/");
  // One media frame per project; the landing-zone tile ships a 2nd (dark) variant.
  await expect(page.locator(".project-card__media")).toHaveCount(4);
  const imgs = page.locator(".project-card__img");
  await expect(imgs).toHaveCount(5);
  // No decorative-but-unlabelled images: each carries non-empty alt text.
  for (const alt of await imgs.evaluateAll((els) =>
    els.map((e) => e.getAttribute("alt"))
  )) {
    expect(alt && alt.trim().length).toBeGreaterThan(0);
  }
});

test("a demo project exposes an open ./demo link", async ({ page }) => {
  await page.goto("/projects/");
  const demo = page.locator(".project-card__action--demo").first();
  await expect(demo).toHaveAttribute("href", /github\.io/);
});

test("projects page keeps a valid heading order (single h1, h2 tiles)", async ({
  page,
}) => {
  await page.goto("/projects/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h2")).toHaveCount(4);
});

test("projects page emits a CollectionPage JSON-LD", async ({ page }) => {
  await page.goto("/projects/");
  const raw = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  const data = JSON.parse(raw!);
  expect(data["@type"]).toBe("CollectionPage");
  expect(data.mainEntity["@type"]).toBe("ItemList");
});
