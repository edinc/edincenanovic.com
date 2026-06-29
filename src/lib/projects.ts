/**
 * Project showcase helpers.
 *
 * Pure, framework-agnostic functions so the ordering and display logic is
 * trivially unit-testable: they operate on any item shaped like a `Project`.
 */

export type Featurable = { featured?: boolean };

/**
 * Pin featured projects to the top while otherwise preserving the authored
 * order in `PROJECTS`. Stable: two items with the same `featured` value keep
 * their original relative order, so the curated list stays predictable.
 */
export function sortProjects<T extends Featurable>(projects: readonly T[]): T[] {
  return projects
    .map((project, index) => ({ project, index }))
    .sort((a, b) => {
      const fa = a.project.featured ? 1 : 0;
      const fb = b.project.featured ? 1 : 0;
      return fb - fa || a.index - b.index;
    })
    .map(({ project }) => project);
}

/**
 * Derive the `owner/repo` slug from a GitHub repository URL, used for the
 * tile's "git clone" affordance. Falls back to the trimmed URL if it isn't a
 * recognisable GitHub path.
 */
export function repoSlug(repoUrl: string): string {
  const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/);
  return match ? match[1] : repoUrl;
}
