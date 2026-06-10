/**
 * Base-path-aware URL helpers.
 *
 * The site is normally served from the domain root ("/"), but a temporary
 * GitHub Pages *project* deploy serves it from a sub-path
 * (e.g. "/edincenanovic.com/"). Internal links and references to files in
 * `public/` must therefore be prefixed with Astro's configured `base`
 * (exposed as `import.meta.env.BASE_URL`) so they resolve in both cases.
 */

/**
 * Join a base path with a root-relative path, avoiding double slashes.
 *
 * @param base A base path such as Astro's `import.meta.env.BASE_URL`. May or
 *   may not have a trailing slash (e.g. "/", "/edincenanovic.com/",
 *   "/edincenanovic.com").
 * @param path A root-relative path; a leading slash is added if missing
 *   (e.g. "/blog", "/favicon.svg").
 * @returns The combined path, e.g. "/edincenanovic.com/blog".
 */
export function joinBase(base: string, path: string): string {
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  // Collapse any leading slashes to exactly one so a stray "//host" input can
  // never produce a protocol-relative (off-site) URL.
  const rootedPath = `/${path.replace(/^\/+/, "")}`;
  return `${trimmedBase}${rootedPath}`;
}

/**
 * Prefix a root-relative path with the site's configured base path. Use for
 * every internal link and `public/` asset reference so they resolve whether the
 * site is served from the domain root or a project sub-path.
 */
export function withBase(path: string): string {
  return joinBase(import.meta.env.BASE_URL, path);
}

/**
 * Strip the configured base path from a pathname, yielding a root-relative
 * path. The inverse of {@link joinBase}; use it before comparing the current
 * `Astro.url.pathname` (which includes the base) against root-relative link
 * targets such as the entries in `NAV`.
 *
 * @param base A base path such as Astro's `import.meta.env.BASE_URL`.
 * @param pathname A pathname that may be prefixed with `base`.
 */
export function stripBasePath(base: string, pathname: string): string {
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  if (trimmedBase && pathname.startsWith(trimmedBase)) {
    const rest = pathname.slice(trimmedBase.length);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname;
}

/** Strip the site's configured base path from a pathname. */
export function withoutBase(pathname: string): string {
  return stripBasePath(import.meta.env.BASE_URL, pathname);
}
