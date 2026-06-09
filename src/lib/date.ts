/**
 * Date formatting helpers.
 */

/** Format a date as e.g. "Jun 9, 2026". */
export function formatDate(date: Date, locale = "en-US"): string {
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
