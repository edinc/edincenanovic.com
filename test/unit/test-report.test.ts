import { describe, it, expect } from "vitest";
import {
  parseJUnit,
  formatDuration,
  renderComment,
  MARKER,
} from "../../scripts/test-report.mjs";

describe("parseJUnit", () => {
  it("sums counts across the child <testsuite> elements", () => {
    const xml = `<?xml version="1.0"?><testsuites name="vitest tests" time="0.04">
      <testsuite name="a" tests="20" failures="0" errors="0" skipped="0" time="0.02"/>
      <testsuite name="b" tests="15" failures="0" errors="0" skipped="0" time="0.02"/>
    </testsuites>`;
    expect(parseJUnit(xml)).toEqual({
      tests: 35,
      failures: 0,
      errors: 0,
      skipped: 0,
      time: 0.04,
    });
  });

  it("sums skipped from child suites (vitest's root omits it)", () => {
    // Regression: vitest emits `skipped` only on child <testsuite>, not the root,
    // so a root-only read would count skipped tests as passed.
    const xml = `<testsuites name="vitest tests" tests="5" failures="0" errors="0" time="0.1">
      <testsuite name="a" tests="3" failures="0" errors="0" skipped="0" time="0.05"/>
      <testsuite name="b" tests="2" failures="0" errors="0" skipped="2" time="0.05"/>
    </testsuites>`;
    expect(parseJUnit(xml)).toMatchObject({ tests: 5, skipped: 2 });
  });

  it("is not fooled by 'tests' appearing inside the root name attribute", () => {
    const xml = '<testsuites name="vitest tests" time="0"><testsuite tests="7"/></testsuites>';
    expect(parseJUnit(xml).tests).toBe(7);
  });

  it("defaults missing attributes to 0 and falls back to summed time", () => {
    const xml = '<testsuites><testsuite tests="3" time="0.2"/></testsuites>';
    expect(parseJUnit(xml)).toEqual({
      tests: 3,
      failures: 0,
      errors: 0,
      skipped: 0,
      time: 0.2,
    });
  });
});

describe("formatDuration", () => {
  it("uses ms under a second, seconds under a minute, and m s above", () => {
    expect(formatDuration(0.037)).toBe("37ms");
    expect(formatDuration(5.3)).toBe("5.3s");
    expect(formatDuration(62)).toBe("1m 02s");
  });

  it("handles zero and invalid input", () => {
    expect(formatDuration(0)).toBe("0ms");
    expect(formatDuration(NaN)).toBe("0ms");
  });
});

describe("renderComment", () => {
  const unit = parseJUnit(
    '<testsuites time="0.04"><testsuite tests="35" failures="0" errors="0" skipped="0" time="0.04"/></testsuites>'
  );
  const e2e = parseJUnit(
    '<testsuites time="5.3"><testsuite tests="11" failures="0" skipped="0" errors="0" time="5.3"/></testsuites>'
  );

  it("renders a passing table with a total row, marker and commit", () => {
    const body = renderComment(
      [
        { name: "Unit (Vitest)", result: unit },
        { name: "E2E (Playwright)", result: e2e },
      ],
      "b9e4b89deadbeef"
    );
    expect(body).toContain(MARKER);
    expect(body).toContain("✅ **All 46 tests passed**");
    expect(body).toContain("| Unit (Vitest) | 35 | 35 | 0 | 0 | 40ms |");
    expect(body).toContain("| E2E (Playwright) | 11 | 11 | 0 | 0 | 5.3s |");
    expect(body).toContain("| **Total** | **46** | **46** | **0** | **0** |");
    expect(body).toContain("`b9e4b89`");
  });

  it("flags failures and marks a missing suite as 'did not run'", () => {
    const failing = parseJUnit(
      '<testsuites time="2"><testsuite tests="4" failures="1" skipped="1" errors="0" time="2"/></testsuites>'
    );
    const body = renderComment([
      { name: "Unit (Vitest)", result: failing },
      { name: "E2E (Playwright)", result: null },
    ]);
    expect(body).toContain("❌ **1 of 4 tests failed**");
    expect(body).toContain("| Unit (Vitest) | 4 | 2 | 1 | 1 | 2.0s |");
    expect(body).toContain("_did not run_");
  });

  it("warns when no results were produced", () => {
    const body = renderComment([{ name: "Unit (Vitest)", result: null }]);
    expect(body).toContain("⚠️ No test results were produced");
  });
});
