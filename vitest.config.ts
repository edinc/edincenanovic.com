/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// Astro's getViteConfig wires up the same resolve/aliases the site uses, so
// unit tests import from src/ exactly as the app does.
export default getViteConfig({
  test: {
    include: ["test/unit/**/*.{test,spec}.ts"],
    environment: "node",
    // Emit JUnit XML in CI so the workflow can publish results to the PR.
    reporters: process.env.CI ? ["default", "junit"] : ["default"],
    outputFile: { junit: "./test-results/vitest-junit.xml" },
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      reporter: ["text", "html"],
    },
  },
});
