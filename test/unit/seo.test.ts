import { describe, it, expect } from "vitest";
import {
  personWebSiteGraph,
  blogPostingSchema,
  type SiteInfo,
} from "../../src/lib/seo";

const site: SiteInfo = {
  name: "Edin Cenanovic",
  role: "Solution Architect",
  tagline: "Solution Architect into DevOps, Developer Productivity.",
  locale: "en",
};

describe("personWebSiteGraph", () => {
  const graph = personWebSiteGraph("https://edincenanovic.com/", site, [
    "https://github.com/edinc",
  ]);
  const nodes = graph["@graph"] as Array<Record<string, unknown>>;

  it("emits a Person + WebSite @graph in order", () => {
    expect(graph["@context"]).toBe("https://schema.org");
    expect(nodes.map((n) => n["@type"])).toEqual(["Person", "WebSite"]);
  });

  it("links WebSite.publisher to the Person @id", () => {
    const [person, website] = nodes;
    expect((website.publisher as Record<string, unknown>)["@id"]).toBe(
      person["@id"]
    );
  });

  it("carries sameAs onto the Person", () => {
    expect(nodes[0].sameAs).toContain("https://github.com/edinc");
  });

  it("is JSON-serializable", () => {
    expect(() => JSON.stringify(graph)).not.toThrow();
  });
});

describe("blogPostingSchema", () => {
  const base = {
    title: "Hello",
    description: "Desc",
    canonical: "https://edincenanovic.com/blog/hello/",
    origin: "https://edincenanovic.com/",
    author: "Edin Cenanovic",
    locale: "en",
    datePublished: new Date("2026-06-09T00:00:00Z"),
  };

  it("falls back dateModified to datePublished", () => {
    const s = blogPostingSchema(base);
    expect(s.datePublished).toBe("2026-06-09T00:00:00.000Z");
    expect(s.dateModified).toBe(s.datePublished);
  });

  it("uses dateModified when provided", () => {
    const s = blogPostingSchema({
      ...base,
      dateModified: new Date("2026-07-01T00:00:00Z"),
    });
    expect(s.dateModified).toBe("2026-07-01T00:00:00.000Z");
  });

  it("omits keywords when there are no tags", () => {
    expect(blogPostingSchema(base)).not.toHaveProperty("keywords");
    expect(blogPostingSchema({ ...base, tags: [] })).not.toHaveProperty(
      "keywords"
    );
  });

  it("joins tags into keywords when present", () => {
    const s = blogPostingSchema({ ...base, tags: ["devops", "astro"] });
    expect(s.keywords).toBe("devops, astro");
  });
});
