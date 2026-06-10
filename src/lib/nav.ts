/**
 * Navigation helpers.
 */

import type { NavItem } from "../consts";

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

/**
 * Filter nav items by feature flags: an item with a `feature` is shown only
 * when that flag is enabled; items without one are always shown.
 */
export function visibleNav(
  items: readonly NavItem[],
  features: Readonly<Record<string, boolean>>
): NavItem[] {
  return items.filter((item) => !item.feature || features[item.feature] === true);
}
