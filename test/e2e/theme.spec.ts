import { test, expect } from "@playwright/test";

test("theme toggle flips the theme and persists across reloads", async ({
  page,
}) => {
  await page.goto("/");
  const html = page.locator("html");
  const initial = await html.getAttribute("data-theme");

  await page.locator("#theme-toggle").click();
  const toggled = await html.getAttribute("data-theme");
  expect(toggled).not.toBe(initial);

  await page.reload();
  expect(await page.locator("html").getAttribute("data-theme")).toBe(toggled);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
    toggled
  );
});
