/**
 * Blog post collection helpers.
 *
 * Kept framework-agnostic (no `astro:content` import) so they are trivially
 * unit-testable: they operate on any entry shaped like `{ data: { ... } }`.
 */

export type Dated = { data: { pubDate: Date } };
export type Draftable = { data: { draft?: boolean } };

/** Sort comparator: newest `pubDate` first. */
export function byPubDateDesc(a: Dated, b: Dated): number {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

/**
 * Whether an entry is visible in the current environment.
 *
 * Drafts are hidden in production builds but visible during local development
 * so work-in-progress posts can be previewed.
 */
export function isVisible<T extends Draftable>(entry: T, isProd: boolean): boolean {
  return !(isProd && entry.data.draft);
}

/**
 * Whether an entry may appear in syndication (RSS).
 *
 * Drafts are always excluded from feeds, regardless of environment.
 */
export function isSyndicated<T extends Draftable>(entry: T): boolean {
  return !entry.data.draft;
}
