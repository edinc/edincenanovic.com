/**
 * Navigation helpers.
 */

/**
 * Whether a nav link should be marked active for the current pathname.
 *
 * The home link ("/") only matches the exact root; every other link matches
 * when the current path is at or beneath it (e.g. "/blog" is active on
 * "/blog/" and "/blog/some-post/").
 */
export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
