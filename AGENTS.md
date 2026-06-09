# AGENTS.md — operating manual for AI agents

This is the **operating manual** for AI coding agents working in
`edincenanovic.com`. Read [`.github/copilot-instructions.md`](.github/copilot-instructions.md)
first for the project map, stack, structure, and conventions — this file does not
repeat them. Here we define **how you work**: the workflow, the review protocol,
the testing rules, and how to extend the agent setup itself.

The single overriding goal: **deliver working changes with zero regressions.**

---

## 1. The workflow (every task)

Follow this order. Do not skip steps.

1. **Understand & plan.** Read the relevant files. For anything non-trivial,
   write down the approach and get a critique before coding (see §3).
2. **Create a feature branch.** Never work on `main`. Name it for the change:
   `feat/portrait`, `fix/header-overflow`, `chore/test-scaffold`, etc.
3. **Implement** the smallest complete change that fully solves the task. Put
   logic in `src/lib/` (pure, testable); keep components to markup + styling;
   keep copy in `src/consts.ts`.
4. **Write tests** (§2). Every behavioral change ships with tests. Encode any
   bug you fix as a regression test so it can't return.
5. **Verify green locally:**
   ```bash
   npm run check && npm run build && npm run test
   ```
   All three must pass with 0 errors / 0 warnings.
6. **Run three independent reviews** (§3) and address (or explicitly defer) the
   findings.
7. **Open a PR.** Summarize what changed, the tests added, and the review
   results. **Do not merge to `main` without maintainer approval.**

---

## 2. Testing rules

Two layers — use the right one (or both):

- **Vitest unit tests** (`test/unit/`) for everything in `src/lib/`. Logic must
  be pure and framework-agnostic so it's trivially testable. If you add logic to
  a component, **extract it to `src/lib/` and unit-test it** rather than leaving
  it untested in the template.
- **Playwright E2E** (`test/e2e/`) for rendered behavior: layout/responsive
  guards, theme persistence, SEO/meta/JSON-LD, 404 behavior, heading order.
  E2E runs against a production build previewed on port **4322** (the dev server
  uses 4321, so both can run at once).

Rules of thumb:

- New `src/lib` function ⇒ new unit test covering its branches/edge cases.
- New or changed UI/SEO/layout behavior ⇒ new or updated E2E spec.
- Fixed a bug ⇒ add a test that fails before the fix and passes after.
- A refactor that must not change output ⇒ verify identical output (build +
  `astro check` + compare rendered HTML/JSON-LD) and keep the covering tests.

Commands: `npm run test` (both), `npm run test:unit`, `npm run test:e2e`,
`npm run test:watch` (unit watch).

---

## 3. Three-independent-review protocol

Before a change is "done", run **three independent review agents** in parallel.
They are independent so they catch different classes of problems. At minimum:

1. **Security review** — secrets, injection (HTML/JSON-LD/`set:html`),
   dependency advisories, unsafe inline scripts, supply-chain risks.
2. **Code review** — correctness, dead/duplicated code, type safety, build/check
   cleanliness, that the change matches intent and conventions.
3. **Quality review** — accessibility (heading order, contrast, tap targets,
   landmarks), SEO (canonical, robots, JSON-LD, OG/Twitter meta), and
   performance (payload, images, blocking work).

For each review: collect findings, then **fix** them or **record why deferred**
(with rationale). Re-run the test suite after fixes. A change that introduces a
new High/Critical finding is not shippable until resolved.

> Practical tip: launch the three reviews as background agents in parallel,
> consolidate their findings into a single list, then act on it.

---

## 4. Guardrails

- **Branch before you build.** No direct commits to `main`.
- **No regressions.** If you can't show check + build + test all green, the task
  isn't finished.
- **Follow the project conventions** — content in `consts.ts`, logic in
  `src/lib/`, tokens in `global.css`, minimal JS. The full, authoritative list is
  in [`.github/copilot-instructions.md`](.github/copilot-instructions.md#conventions).
- **Don't commit build/test output.** `dist/`, `test-results/`,
  `playwright-report/`, `coverage/`, `playwright/.cache/` are git-ignored — keep
  them that way and clean up scratch artifacts.
- **Commits:** conventional-commit subject + the trailer
  `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`.

---

## 5. Agent development

How to evolve this setup itself.

- **Single source per topic.** `.github/copilot-instructions.md` owns **project
  context + conventions** (and restates only the workflow *non-negotiables* in
  brief). `AGENTS.md` (this file) owns the **authoritative process** — workflow,
  testing, review protocol, guardrails. Put each rule in exactly one place and
  link to it; don't copy detail between the files. When you change the process,
  edit it **here** and check the brief list in `copilot-instructions.md` still
  matches.
- **Changing the workflow or review protocol** (e.g. adding a fourth review,
  changing required checks): edit it **here** (the authoritative source), update
  the brief non-negotiables list in `copilot-instructions.md` only if a
  non-negotiable changed, and call it out in the PR so the maintainer can approve
  the new process.
- **Adding a tool/script** (new npm script, new test type, CI): update the
  Commands section in `copilot-instructions.md`, reference it from §2 here if it
  affects testing, wire it into `npm run test`/CI where appropriate, and add
  `.gitignore` entries for any new output dirs.
- **New `src/lib` modules** should stay pure and get unit tests in the same
  change. New components/pages with user-visible behavior should get E2E
  coverage.
- **When adding CI**, mirror the local gate: `npm run check`, `npm run build`,
  `npm run test`. Keep E2E's preview port (4322) distinct from dev (4321).
- **Keep instructions truthful.** If structure, commands, or conventions change,
  update these docs in the same PR so future agents aren't misled.
