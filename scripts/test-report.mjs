/**
 * Build a Markdown test-results summary (a table) from the JUnit XML reports
 * produced by vitest and Playwright in CI, for posting as a sticky PR comment.
 *
 * The pure helpers are exported for unit testing; `main()` wires up file IO and
 * runs only when the script is executed directly (not when imported by tests).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Hidden marker used to find and update the single sticky PR comment. */
export const MARKER = "<!-- ci-test-results -->";

/**
 * Read the aggregate counts from the root `<testsuites>` element of a JUnit XML
 * document. Missing attributes default to 0.
 */
export function parseJUnit(xml) {
  const attr = (tag, name) => {
    const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
    return m ? Number(m[1]) || 0 : 0;
  };
  // Sum counts across every child <testsuite>. This is robust for both reporters:
  // vitest only emits `skipped` on the child suites, not on the root <testsuites>,
  // so reading the root alone would silently count skipped tests as passed.
  const suites = [...xml.matchAll(/<testsuite\b[^>]*>/g)].map((m) => m[0]);
  const sum = (name) => suites.reduce((total, tag) => total + attr(tag, name), 0);
  // Prefer the root <testsuites> wall-clock time; fall back to the summed time.
  const root = (xml.match(/<testsuites\b[^>]*>/) || [""])[0];
  return {
    tests: sum("tests"),
    failures: sum("failures"),
    errors: sum("errors"),
    skipped: sum("skipped"),
    time: attr(root, "time") || sum("time"),
  };
}

/** Format a duration in seconds compactly: `37ms`, `5.3s`, `1m 02s`. */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0ms";
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/**
 * Render the Markdown comment body (prefixed with the sticky marker) from a list
 * of named suites. A suite with a `null` result is shown as "did not run".
 *
 * @param {{ name: string, result: ReturnType<typeof parseJUnit> | null }[]} suites
 * @param {string} [sha] commit SHA for the footer
 */
export function renderComment(suites, sha) {
  const footer = sha
    ? `\n\n<sub>Results for commit \`${sha.slice(0, 7)}\`.</sub>`
    : "";
  const present = suites.filter((s) => s.result);

  if (present.length === 0) {
    return `${MARKER}\n### 🧪 Test results\n\n⚠️ No test results were produced — an earlier step may have failed.${footer}`;
  }

  const totals = present.reduce(
    (acc, { result }) => ({
      tests: acc.tests + result.tests,
      failed: acc.failed + result.failures + result.errors,
      skipped: acc.skipped + result.skipped,
      time: acc.time + result.time,
    }),
    { tests: 0, failed: 0, skipped: 0, time: 0 }
  );
  const passed = totals.tests - totals.failed - totals.skipped;
  const heading =
    totals.failed === 0
      ? `✅ **All ${totals.tests} tests passed**`
      : `❌ **${totals.failed} of ${totals.tests} tests failed**`;

  const row = (name, r) => {
    if (!r) return `| ${name} | — | — | — | — | _did not run_ |`;
    const failed = r.failures + r.errors;
    const ok = r.tests - failed - r.skipped;
    return `| ${name} | ${r.tests} | ${ok} | ${failed} | ${r.skipped} | ${formatDuration(r.time)} |`;
  };

  const table = [
    "| Suite | Tests | ✅ Passed | ❌ Failed | ⏭️ Skipped | ⏱️ Duration |",
    "| :-- | --: | --: | --: | --: | --: |",
    ...suites.map((s) => row(s.name, s.result)),
    `| **Total** | **${totals.tests}** | **${passed}** | **${totals.failed}** | **${totals.skipped}** | **${formatDuration(totals.time)}** |`,
  ].join("\n");

  return `${MARKER}\n### 🧪 Test results\n\n${heading}\n\n${table}${footer}`;
}

function main() {
  const sources = [
    { name: "Unit (Vitest)", path: "reports/vitest-junit.xml" },
    { name: "E2E (Playwright)", path: "reports/playwright-junit.xml" },
  ];
  const suites = sources.map(({ name, path }) => ({
    name,
    result: existsSync(path) ? parseJUnit(readFileSync(path, "utf8")) : null,
  }));
  const body = renderComment(suites, process.env.GITHUB_SHA);
  mkdirSync("reports", { recursive: true });
  writeFileSync("reports/comment.md", `${body}\n`);
  process.stdout.write(`${body}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
