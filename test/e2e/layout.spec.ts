import { test, expect } from "@playwright/test";

// Regression guard: the mobile header overflow that was fixed must stay fixed.
for (const width of [320, 360, 414]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("content column stays a fixed width and centered on wide screens", async ({
  page,
}) => {
  await page.goto("/");
  const widthAt = async (vw: number) => {
    await page.setViewportSize({ width: vw, height: 900 });
    const box = await page.locator("main.container").boundingBox();
    expect(box).not.toBeNull();
    return box!;
  };

  const at1440 = await widthAt(1440);
  const at1920 = await widthAt(1920);

  // Locked: the column does not grow as the viewport grows.
  expect(Math.round(at1440.width)).toBe(Math.round(at1920.width));
  // Not full-bleed.
  expect(at1440.width).toBeLessThan(1000);
  // Centered at the widest viewport (equal gutters).
  const left = at1920.x;
  const right = 1920 - (at1920.x + at1920.width);
  expect(Math.abs(left - right)).toBeLessThanOrEqual(2);
});

test("bio text matches the hero box width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const hero = await page.locator(".hero .window").boundingBox();
  const bio = await page.locator(".bio").boundingBox();
  expect(hero).not.toBeNull();
  expect(bio).not.toBeNull();
  expect(Math.round(bio!.width)).toBe(Math.round(hero!.width));
});

test("footer exposes a working contact email as a mailto link", async ({
  page,
}) => {
  await page.goto("/");
  const email = page.locator(".site-footer__email");
  await expect(email).toHaveText("cenanovice@gmail.com");
  await expect(email).toHaveAttribute("href", "mailto:cenanovice@gmail.com");
  // The old address that looked like a real (but dead) inbox must not resurface.
  await expect(page.locator(".site-footer")).not.toContainText(
    "edin@edincenanovic.com"
  );
});
