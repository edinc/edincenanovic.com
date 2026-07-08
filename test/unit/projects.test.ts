import { describe, it, expect } from "vitest";
import { sortProjects, repoSlug, projectHref } from "../../src/lib/projects";

describe("sortProjects", () => {
  const items = [
    { name: "a" },
    { name: "b", featured: true },
    { name: "c" },
    { name: "d", featured: true },
  ];

  it("pins featured projects first, preserving authored order within groups", () => {
    expect(sortProjects(items).map((p) => p.name)).toEqual(["b", "d", "a", "c"]);
  });

  it("is stable when nothing is featured (keeps input order)", () => {
    const plain: { name: string; featured?: boolean }[] = [
      { name: "x" },
      { name: "y" },
      { name: "z" },
    ];
    expect(sortProjects(plain).map((p) => p.name)).toEqual(["x", "y", "z"]);
  });

  it("does not mutate the input array", () => {
    const input = [...items];
    sortProjects(input);
    expect(input.map((p) => p.name)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("repoSlug", () => {
  it("extracts owner/repo from a github URL", () => {
    expect(repoSlug("https://github.com/edinc/terminal-config")).toBe(
      "edinc/terminal-config"
    );
  });

  it("tolerates a trailing slash and .git suffix", () => {
    expect(repoSlug("https://github.com/edinc/terminal-config/")).toBe(
      "edinc/terminal-config"
    );
    expect(repoSlug("https://github.com/edinc/terminal-config.git")).toBe(
      "edinc/terminal-config"
    );
  });

  it("falls back to the input for non-github URLs", () => {
    expect(repoSlug("https://example.com/x")).toBe("https://example.com/x");
  });
});

describe("projectHref", () => {
  it("prefers the public repo as the primary link", () => {
    expect(
      projectHref({ repo: "https://github.com/edinc/x", demo: "https://x.app/" })
    ).toBe("https://github.com/edinc/x");
  });

  it("falls back to the live site when there is no repo (closed-source product)", () => {
    expect(projectHref({ demo: "https://sportsdispatch.app/" })).toBe(
      "https://sportsdispatch.app/"
    );
  });

  it("throws when a project has neither a repo nor a demo", () => {
    expect(() => projectHref({})).toThrow();
  });
});
