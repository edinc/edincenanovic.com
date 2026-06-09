import { describe, it, expect } from "vitest";
import { byPubDateDesc, isVisible, isSyndicated } from "../../src/lib/posts";

const mk = (iso: string, draft = false) => ({
  data: { pubDate: new Date(iso), draft },
});

describe("byPubDateDesc", () => {
  it("sorts newest first", () => {
    const jan = mk("2026-01-01");
    const jun = mk("2026-06-01");
    const dec = mk("2025-12-01");
    expect([jan, jun, dec].sort(byPubDateDesc)).toEqual([jun, jan, dec]);
  });
});

describe("isVisible", () => {
  it("hides drafts in production", () => {
    expect(isVisible(mk("2026-01-01", true), true)).toBe(false);
  });

  it("shows drafts in development", () => {
    expect(isVisible(mk("2026-01-01", true), false)).toBe(true);
  });

  it("always shows published posts", () => {
    expect(isVisible(mk("2026-01-01", false), true)).toBe(true);
    expect(isVisible(mk("2026-01-01", false), false)).toBe(true);
  });
});

describe("isSyndicated", () => {
  it("excludes drafts regardless of environment", () => {
    expect(isSyndicated(mk("2026-01-01", true))).toBe(false);
    expect(isSyndicated(mk("2026-01-01", false))).toBe(true);
  });
});
