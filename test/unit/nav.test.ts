import { describe, it, expect } from "vitest";
import { isActive, visibleNav } from "../../src/lib/nav";
import { stripBasePath } from "../../src/lib/url";
import type { NavItem } from "../../src/consts";

describe("isActive", () => {
  it("matches home only on the exact root", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/blog/", "/")).toBe(false);
    expect(isActive("/about/", "/")).toBe(false);
  });

  it("matches a section link on the section and its descendants", () => {
    expect(isActive("/blog", "/blog")).toBe(true);
    expect(isActive("/blog/", "/blog")).toBe(true);
    expect(isActive("/blog/hello-world/", "/blog")).toBe(true);
  });

  it("does not match unrelated sections", () => {
    expect(isActive("/about/", "/blog")).toBe(false);
    expect(isActive("/", "/blog")).toBe(false);
  });
});

describe("isActive under a project base path", () => {
  // Regression: Astro.url.pathname is base-prefixed under a project sub-path,
  // while NAV hrefs stay root-relative. Header strips the base first; this
  // proves home stays exact-match and sections still match descendants.
  const base = "/edincenanovic.com/";

  it("marks home active only on the base root", () => {
    expect(isActive(stripBasePath(base, "/edincenanovic.com/"), "/")).toBe(true);
    expect(isActive(stripBasePath(base, "/edincenanovic.com/blog/"), "/")).toBe(false);
  });

  it("marks a section active on the section and its descendants", () => {
    expect(isActive(stripBasePath(base, "/edincenanovic.com/blog"), "/blog")).toBe(true);
    expect(isActive(stripBasePath(base, "/edincenanovic.com/blog/hello/"), "/blog")).toBe(
      true
    );
  });
});

describe("visibleNav", () => {
  const nav: NavItem[] = [
    { label: "home", href: "/" },
    { label: "blog", href: "/blog", feature: "blog" },
  ];

  it("hides items whose feature flag is off", () => {
    expect(visibleNav(nav, { blog: false }).map((i) => i.label)).toEqual(["home"]);
  });

  it("shows items whose feature flag is on", () => {
    expect(visibleNav(nav, { blog: true }).map((i) => i.label)).toEqual(["home", "blog"]);
  });

  it("always shows items without a feature, regardless of flags", () => {
    const homeOnly = [{ label: "home", href: "/" }];
    expect(visibleNav(homeOnly, {}).map((i) => i.label)).toEqual(["home"]);
  });
});
