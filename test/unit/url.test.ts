import { describe, it, expect } from "vitest";
import { joinBase, stripBasePath, withBase, withoutBase } from "../../src/lib/url";

describe("joinBase", () => {
  it("returns the path unchanged at the root base", () => {
    expect(joinBase("/", "/")).toBe("/");
    expect(joinBase("/", "/blog")).toBe("/blog");
    expect(joinBase("/", "/favicon.svg")).toBe("/favicon.svg");
  });

  it("prefixes a sub-path base (with trailing slash)", () => {
    expect(joinBase("/edincenanovic.com/", "/")).toBe("/edincenanovic.com/");
    expect(joinBase("/edincenanovic.com/", "/blog")).toBe("/edincenanovic.com/blog");
    expect(joinBase("/edincenanovic.com/", "/blog/hello/")).toBe(
      "/edincenanovic.com/blog/hello/"
    );
  });

  it("prefixes a sub-path base without a trailing slash", () => {
    expect(joinBase("/edincenanovic.com", "/blog")).toBe("/edincenanovic.com/blog");
  });

  it("adds a leading slash to the path when missing", () => {
    expect(joinBase("/", "blog")).toBe("/blog");
    expect(joinBase("/edincenanovic.com/", "rss.xml")).toBe("/edincenanovic.com/rss.xml");
  });

  it("never produces a double slash between base and path", () => {
    const out = joinBase("/edincenanovic.com/", "/sitemap-index.xml");
    expect(out).toBe("/edincenanovic.com/sitemap-index.xml");
    expect(out).not.toContain("//");
  });

  it("collapses leading slashes so it cannot emit a protocol-relative URL", () => {
    expect(joinBase("/", "//evil.com")).toBe("/evil.com");
    expect(joinBase("/edincenanovic.com/", "//evil.com")).toBe(
      "/edincenanovic.com/evil.com"
    );
  });
});

describe("withBase", () => {
  it("uses the configured BASE_URL (root in the test environment)", () => {
    // Vitest builds with Astro's default base ("/").
    expect(withBase("/")).toBe("/");
    expect(withBase("/blog")).toBe("/blog");
    expect(withBase("/favicon.svg")).toBe("/favicon.svg");
  });
});

describe("stripBasePath", () => {
  it("is a no-op at the root base", () => {
    expect(stripBasePath("/", "/")).toBe("/");
    expect(stripBasePath("/", "/blog/")).toBe("/blog/");
  });

  it("removes a sub-path base prefix (with trailing slash)", () => {
    expect(stripBasePath("/edincenanovic.com/", "/edincenanovic.com/")).toBe("/");
    expect(stripBasePath("/edincenanovic.com/", "/edincenanovic.com/blog/")).toBe("/blog/");
  });

  it("removes a sub-path base prefix (without trailing slash)", () => {
    expect(stripBasePath("/edincenanovic.com", "/edincenanovic.com/blog/")).toBe("/blog/");
  });

  it("leaves a pathname that does not start with the base unchanged", () => {
    expect(stripBasePath("/edincenanovic.com/", "/other/")).toBe("/other/");
  });
});

describe("withoutBase", () => {
  it("uses the configured BASE_URL (root in the test environment)", () => {
    expect(withoutBase("/")).toBe("/");
    expect(withoutBase("/blog/")).toBe("/blog/");
  });
});
