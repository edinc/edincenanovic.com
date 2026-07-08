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
  await expect(cards).toHaveCount(5);

  // A repo tile links to its GitHub repo.
  const azure = page.locator(".project-card", {
    hasText: "Azure Platform Engineering Landing Zone",
  });
  await expect(azure.locator("a.project-card__link")).toHaveAttribute(
    "href",
    /github\.com\//
  );

  // The flagship Sports Dispatch product is pinned first, shown with a human title.
  await expect(cards.first().locator("h2")).toHaveText("Sports Dispatch");
});

test("every project tile shows a preview image with alt text", async ({
  page,
}) => {
  await page.goto("/projects/");
  // One media frame per project; the landing-zone tile ships a 2nd (dark) variant.
  await expect(page.locator(".project-card__media")).toHaveCount(5);
  const imgs = page.locator(".project-card__img");
  await expect(imgs).toHaveCount(6);
  // No decorative-but-unlabelled images: each carries non-empty alt text.
  for (const alt of await imgs.evaluateAll((els) =>
    els.map((e) => e.getAttribute("alt"))
  )) {
    expect(alt && alt.trim().length).toBeGreaterThan(0);
  }
});

test("a repo project's demo exposes an open ./demo link", async ({ page }) => {
  await page.goto("/projects/");
  const azure = page.locator(".project-card", {
    hasText: "Azure Platform Engineering Landing Zone",
  });
  const demo = azure.locator(".project-card__action--demo");
  await expect(demo).toContainText("open ./demo");
  await expect(demo).toHaveAttribute("href", /github\.io/);
});

test("a closed-source product tile links to the live site and hides git clone", async ({
  page,
}) => {
  await page.goto("/projects/");
  const card = page.locator(".project-card", { hasText: "Sports Dispatch" });
  await expect(card).toHaveCount(1);
  // The title links to the live app, not a GitHub repo.
  await expect(card.locator("a.project-card__link")).toHaveAttribute(
    "href",
    "https://sportsdispatch.app/"
  );
  // No "git clone" affordance for a project without a public repo.
  await expect(card).not.toContainText("git clone");
  // Its primary action reads "open project", not "open ./demo".
  const action = card.locator(".project-card__action--demo");
  await expect(action).toContainText("open project");
  await expect(action).not.toContainText("open ./demo");
  await expect(action).toHaveAttribute("href", "https://sportsdispatch.app/");
});

test("projects page keeps a valid heading order (single h1, h2 tiles)", async ({
  page,
}) => {
  await page.goto("/projects/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h2")).toHaveCount(5);
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
