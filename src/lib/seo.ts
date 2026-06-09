/**
 * Structured-data (JSON-LD) builders.
 *
 * Pure functions that return plain objects so they can be unit-tested without
 * rendering Astro components.
 */

export interface SiteInfo {
  name: string;
  role: string;
  tagline: string;
  locale: string;
}

/**
 * schema.org @graph for the home page: the Person plus the WebSite they
 * publish. `origin` must be an absolute URL ending in a slash, e.g.
 * "https://edincenanovic.com/".
 */
export function personWebSiteGraph(
  origin: string,
  site: SiteInfo,
  sameAs: string[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${origin}#person`,
        name: site.name,
        url: origin,
        jobTitle: site.role,
        description: site.tagline,
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${origin}#website`,
        url: origin,
        name: site.name,
        description: site.tagline,
        inLanguage: site.locale,
        publisher: { "@id": `${origin}#person` },
      },
    ],
  };
}

export interface ArticleInfo {
  title: string;
  description: string;
  /** Absolute canonical URL of the article. */
  canonical: string;
  /** Absolute site origin (ends with a slash). */
  origin: string;
  author: string;
  locale: string;
  datePublished: Date;
  dateModified?: Date;
  tags?: string[];
}

/** schema.org BlogPosting for a single article. */
export function blogPostingSchema(a: ArticleInfo): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.description,
    url: a.canonical,
    mainEntityOfPage: a.canonical,
    datePublished: a.datePublished.toISOString(),
    dateModified: (a.dateModified ?? a.datePublished).toISOString(),
    inLanguage: a.locale,
    author: { "@type": "Person", name: a.author, url: a.origin },
    publisher: { "@type": "Person", name: a.author, url: a.origin },
    ...(a.tags && a.tags.length > 0 ? { keywords: a.tags.join(", ") } : {}),
  };
}
