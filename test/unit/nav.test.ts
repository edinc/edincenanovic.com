import { describe, it, expect } from "vitest";
import { isActive } from "../../src/lib/nav";

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
