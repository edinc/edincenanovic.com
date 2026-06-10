/**
 * Central site configuration.
 *
 * Everything that is "content" about the person/site lives here so the rest of
 * the codebase stays presentational. To update the bio, role, or social links,
 * edit this file — nothing else needs to change.
 */

export interface SocialLink {
  /** Human label, e.g. "GitHub". */
  name: string;
  /** Lowercase handle/command-style label shown in the terminal UI. */
  handle: string;
  /** Absolute URL. */
  href: string;
  /** Inline SVG path data (24x24 viewBox) for the icon. */
  icon: string;
}

/**
 * Feature flags for progressively-revealed sections. Flip a flag to `true` to
 * surface that section everywhere at once (nav, home, routes, feed, sitemap);
 * flip it back to hide it without deleting any code.
 */
export const FEATURES: Record<"blog", boolean> = {
  /** Blog: nav link, home "latest posts", /blog, /blog/<slug>, and RSS feed. */
  blog: false,
};

/**
 * Analytics configuration. The Cloudflare Web Analytics beacon is cookieless
 * and privacy-friendly (no consent banner needed). The token is **public** — it
 * ships in the page HTML for every visitor — so it lives in source, not a
 * secret. The beacon only loads in production builds (see `src/lib/analytics.ts`
 * and `BaseHead.astro`); set the token to an empty string to disable analytics.
 */
export const ANALYTICS = {
  /** Cloudflare Web Analytics beacon token. Empty string disables the beacon. */
  cloudflareToken: "9c0afd2eb9e44c0e9c1517b3e413a4ea",
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** Show this item only when the named feature flag is enabled. */
  feature?: keyof typeof FEATURES;
}

export const SITE = {
  /** Used in <title>, OpenGraph, structured data. */
  name: "Edin Cenanovic",
  /** Bare domain — also the shell hostname in prompts. */
  domain: "edincenanovic.com",
  /** Shell username used in the decorative prompt (user@host:~$). */
  user: "edin",
  /** Short role/title. */
  role: "Solution Architect",
  /** One-line tagline for meta description fallbacks. */
  tagline:
    "Solution Architect into DevOps, Developer Productivity, Open Source & Cloud-Native.",
  /** Full bio paragraph shown on the home page. */
  bio: "Welcome to my personal website! I'm a Solution Architect currently working at Microsoft, with a passion for all things DevOps, Developer Productivity, Open Source, and Cloud-Native technologies. With over 15 years of experience in the tech industry, I've worked with a variety of companies and organizations to help them achieve their goals and maximize their potential.",
  /** Default OpenGraph/Twitter card image (under /public). */
  ogImage: "/og-default.svg",
  /** Repo that builds this site (footer "how this site is built" link). */
  repo: "https://github.com/edinc/edincenanovic.com",
  /** Default locale for <html lang> and OG. */
  locale: "en",
} as const;

export const NAV: NavItem[] = [
  { label: "home", href: "/" },
  { label: "blog", href: "/blog", feature: "blog" },
];

export const SOCIALS: SocialLink[] = [
  {
    name: "GitHub",
    handle: "github.com/edinc",
    href: "https://github.com/edinc",
    icon: "M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z",
  },
  {
    name: "LinkedIn",
    handle: "in/edincenanovic",
    href: "https://www.linkedin.com/in/edincenanovic/",
    icon: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z",
  },
  {
    name: "Twitter",
    handle: "@ecenanovic",
    href: "https://twitter.com/ecenanovic",
    icon: "M18.9 1.5h3.68l-8.04 9.19L24 22.5h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.5h7.59l5.24 6.93L18.9 1.5zm-1.29 18.8h2.04L6.48 3.59H4.29L17.61 20.3z",
  },
  {
    name: "Instagram",
    handle: "@ecenanovic",
    href: "https://www.instagram.com/ecenanovic/",
    icon: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38C1.36 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.08 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.38.66-.66 1.08-1.33 1.38-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.12C21.32 1.36 20.65.94 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-10.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z",
  },
];
