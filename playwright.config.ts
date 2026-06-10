import { defineConfig, devices } from "@playwright/test";

// Run E2E against a production build served by `astro preview` on a port that
// is distinct from the dev server (4321), so both can run side by side.
const PORT = 4322;

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // In CI: GitHub annotations for inline failures + JUnit XML so the workflow
  // can publish a test-results summary comment on the PR.
  reporter: process.env.CI
    ? [["github"], ["junit", { outputFile: "test-results/playwright-junit.xml" }]]
    : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
