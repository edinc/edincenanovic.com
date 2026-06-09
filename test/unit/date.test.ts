import { describe, it, expect } from "vitest";
import { formatDate } from "../../src/lib/date";

describe("formatDate", () => {
  it("formats a date as 'Mon D, YYYY' in en-US", () => {
    // Construct from local Y/M/D parts (month is 0-indexed) so the assertion
    // is timezone-stable regardless of where the test runs.
    expect(formatDate(new Date(2026, 5, 9))).toBe("Jun 9, 2026");
  });

  it("respects a non-default locale", () => {
    expect(formatDate(new Date(2026, 0, 15), "en-GB")).toBe("15 Jan 2026");
  });
});
