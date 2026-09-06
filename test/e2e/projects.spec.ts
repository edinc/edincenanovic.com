import { test, expect } from "@playwright/test";

test("projects appears in the nav and links to /projects", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("navigation").getByRole("link", { name: "projects" });
  await expect(link).toHaveCount(1);
  await link.click();
  await expect(page).toHaveURL(/\/projects\/?$/);
});

test("projects page renders six tiles with launched products first", async ({
  page,
}) => {
  await page.goto("/projects/");
  await expect(page.locator("h1")).toHaveText("projects");

  const cards = page.locator(".project-card");
  await expect(cards).toHaveCount(6);
  await expect(page.locator(".page-intro")).toContainText("6 projects");
  await expect(page.locator(".page-intro")).toContainText("iPhone & web apps");

  // A repo tile links to its GitHub repo.
  const azure = page.locator(".project-card", {
    hasText: "Azure Platform Engineering Landing Zone",
  });
  await expect(azure.locator("a.project-card__link")).toHaveAttribute(
    "href",
    /github\.com\//
  );

  await expect(cards.first().locator("h2")).toHaveText("Folge");
  await expect(cards.nth(1).locator("h2")).toHaveText("Sports Dispatch");
});

test("every project tile shows a preview image with alt text", async ({
  page,
}) => {
  await page.goto("/projects/");
  // One media frame per project; the landing-zone tile ships a 2nd (dark) variant.
  await expect(page.locator(".project-card__media")).toHaveCount(6);
  const imgs = page.locator(".project-card__img");
  await expect(imgs).toHaveCount(7);
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

for (const { title, url } of [
  { title: "Folge", url: "https://getfolge.app/" },
  { title: "Sports Dispatch", url: "https://sportsdispatch.app/" },
]) {
  test(`${title} links to its live site and hides git clone`, async ({ page }) => {
    await page.goto("/projects/");
    const card = page.locator(".project-card", {
      has: page.getByRole("heading", { name: title, exact: true }),
    });
    await expect(card).toHaveCount(1);
    const titleLink = card.locator("a.project-card__link");
    await expect(titleLink).toHaveAttribute("href", url);
    await expect(titleLink).toHaveAttribute("target", "_blank");
    await expect(titleLink).toHaveAttribute("rel", "noopener noreferrer");
    await expect(card).not.toContainText("git clone");
    const action = card.getByRole("link", { name: `Open ${title}`, exact: true });
    await expect(action).toContainText("open project");
    await expect(action).not.toContainText("open ./demo");
    await expect(action).toHaveAttribute("href", url);
    await expect(action).toHaveAttribute("target", "_blank");
    await expect(action).toHaveAttribute("rel", "noopener noreferrer");
  });
}

test("Folge displays its optimized marketing image", async ({ page }) => {
  await page.goto("/projects/");
  const image = page.getByRole("img", { name: /^Folge promo card/ });
  await expect(image).toHaveAttribute("src", /\/_astro\/folge\..*\.webp$/);
  await expect(image).toHaveAttribute("srcset", /420w.*640w.*860w/);
  await expect(image).toHaveAttribute("loading", "eager");
  await expect(image).toHaveAttribute("fetchpriority", "high");
  await expect
    .poll(() =>
      image.evaluate(
        (el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0
      )
    )
    .toBe(true);
});

for (const width of [320, 620, 621, 1280]) {
  test(`projects grid fits with tags on their own row at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/projects/");
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    for (const card of await page.locator(".project-card").all()) {
      const tags = await card.locator(".project-card__tags").boundingBox();
      expect(tags).not.toBeNull();
      for (const item of await card
        .locator(".project-card__lang, .project-card__stars")
        .all()) {
        const box = await item.boundingBox();
        expect(box).not.toBeNull();
        expect(tags!.y).toBeGreaterThanOrEqual(box!.y + box!.height);
      }
    }
  });
}

test("projects page keeps a valid heading order (single h1, h2 tiles)", async ({
  page,
}) => {
  await page.goto("/projects/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h2")).toHaveCount(6);
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
  expect(data.mainEntity.itemListElement).toHaveLength(6);
  expect(data.mainEntity.itemListElement[0]).toMatchObject({
    "@type": "ListItem",
    position: 1,
    name: "Folge",
    url: "https://getfolge.app/",
    description: expect.stringContaining("iPhone tracker for TV shows and movies"),
  });
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    data.description
  );
  expect(data.description).toContain("iPhone and web apps");
});
