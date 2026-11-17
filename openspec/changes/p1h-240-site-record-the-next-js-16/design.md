# Design — p1h-240-site-record-the-next-js-16

## Context

See `proposal.md` (Why) and `investigation.md` (Affected behavior) for the evidence. This design fixes
what the new document contains and how its structure is checked. A worker can then write it without
re-deciding anything, and the acceptance can tell a correct document from a missing or partial one.

The facts it relies on, all on merge base `6404d70`:
- No route under `app/` carries `force-dynamic`. It was removed in `60a7a1f` (#94), and
  `blockers.md:13-14` is stale.
- `/about` has no smoke test.
- The smoke suite runs against `next dev` (`playwright.config.ts:29-34`).
- No rollback threshold is recorded anywhere.
- The only performance baseline is the issue-70 Lighthouse run for `/`, which predates the upgrade.

## Goals / Non-Goals

**Goals:** one markdown file whose every line has a status and verifiable evidence. Its structure is
fixed so that `grep` can check it.

**Non-Goals:**
- Fixing anything the checklist finds: the stale `blockers.md`, the missing `/about` smoke test, or
  the unmeasured performance.
- Committing Lighthouse output.

## Decisions

### D1 · Three statuses, not two

Every line is `met`, `not met` or `not run`:
- `met` means the evidence is in the repository or was produced by a check run on the PC, and the
  line cites it.
- `not met` means the evidence shows the item is not true today.
- `not run` means the evidence needs something the PC does not have, either a GitHub Actions job or
  a browser. The line names that job or command.

*Alternative weighed:* only met / not met, as the intake words it, which would mark build, smoke and
performance as not met. Rejected. That would assert a failure nobody observed, and `.claude/rules/site.md`
separates "did not run" from "failed". The intake itself uses "not run" for the performance lines, so
this extends its own term rather than inventing one.

### D2 · The document's fixed structure

`docs/specs/next16-migration/validation.md` has these headings, in this order and with this exact
text. Acceptance greps for them.

1. `# Next.js 16 Migration Validation`. Under it: the date written, the `main` commit it describes
   (the merge base of the delivery branch), and links to `readiness.md` and `blockers.md`.
2. `## Status legend`: the three statuses from D1.
3. `## Sign-off checklist`: a table with columns `| # | Item | Status | Evidence |`. Rows:

| # | Item | Status | Evidence the row cites |
|---|---|---|---|
| V1 | Next.js 16 and React 19 resolved on main | met | `package.json:43,48-49`; `package-lock.json`: `next` 16.3.4, `react`/`react-dom` 19.2.4 |
| V2 | Async request API applied to the three codemod routes | met | `app/blog/posts/[...slug]/page.tsx`, `app/blog/tags/[tag]/page.tsx`, `app/blog/posts/page/[page]/page.tsx`: `params: Promise<…>` (lines as in `investigation.md`) |
| V3 | Lint runs through the ESLint CLI with a flat config | met | `package.json:12`, `eslint.config.js`; no `.eslintrc*` tracked |
| V4 | No route carries the temporary `force-dynamic` fallback | met | no match under `app/`; removed by `60a7a1f` (#94); `blockers.md` "Current stabilization state" is stale |
| V5 | `bash scripts/pipeline-check.sh lint` passes | met or not met | the worker's own run: the date, and the merge-base commit the document describes (HEAD before the worker's commit) |
| V6 | `bash scripts/pipeline-check.sh test` passes | met or not met | the worker's own run: the date, and the merge-base commit the document describes (HEAD before the worker's commit) |
| V7 | `npm run build` passes and prerenders `/about` and post pages statically | not run | the route table in the log of GitHub Actions `Required Checks / build` on the PR. The developer confirms that `/about` is marked `○ (Static)` and `/blog/posts/[...slug]` `● (SSG)`, and that neither is marked `ƒ (Dynamic)`. A green job alone does not show this. |
| V8 | Typecheck passes | not run | `Required Checks / typecheck` |
| V9 | Playwright smoke passes | not run | `Playwright Smoke / smoke` |
| V10 | Smoke suite covers every critical route | not met | `/about` (plus the tag and pagination routes) are not visited; the suite runs on the dev server |
| V11 | Rollback triggers agreed by the developer | not met | proposed in the section below; nobody has adopted them |
| V12 | Performance spot-check, `/` | not run | commands in the section below |
| V13 | Performance spot-check, one blog post page | not run | commands in the section below |

   V5 and V6 record what the worker observed when it ran the checks. If one fails, the row says
   `not met` and the task's acceptance fails anyway. They cite the merge-base commit, not "this
   commit". The worker runs the checks before it commits the file, so the commit that holds the
   file cannot be named inside it. V7 to V9 are never written as met by the worker: the developer
   reads them off the PR's Actions run.

   V7's evidence is the route table, not the job's result. The `build` job
   (`required-checks.yml:94-124`) fails only on errors. A route that silently became dynamic would
   still build green. `next build` prints a legend of `○ (Static)`, `● (SSG)` and `ƒ (Dynamic)`
   (`node_modules/next/dist/build/utils.js:514-533`, Next.js 16.3.4). `/about` has no
   `generateStaticParams`, so static shows as `○`. The post route exports `generateStaticParams`
   (`app/blog/posts/[...slug]/page.tsx:151`), so static shows as `●`.

   The table must be machine-checkable, so the worker follows two format rules:
   - Every row begins `| V<n> |`.
   - The Status cell holds exactly one of the plain strings `met`, `not met` or `not run`, with no
     bold, code or extra words. Qualifications go in the Evidence cell.

   The Item cell contains no `|` character. Prettier pads table cells with spaces when it formats
   them. The acceptance regexes allow any number of spaces around each cell.

4. `## Smoke coverage of critical routes`. Critical routes are the routes named by the migration's
   own documents:
   - `/` and one post page: `readiness.md:58`
   - `/about` and `/blog/posts/[...slug]`: `blockers.md:7-9`
   - the three async-params routes: `readiness.md:28-31`
   - `/blog`, the blog landing page

   A table gives route / covered (yes or no) / test, citing the spec's line:
   - `/`: yes, `blog.smoke.spec.ts:10`
   - `/blog`: yes, `:18`
   - `/blog/posts`: yes, `:25`
   - `/blog/posts/[...slug]`: yes, `:29-32` and `:84`
   - `/about`: **no**
   - `/blog/tags/[tag]`: **no**
   - `/blog/posts/page/[page]`: **no**

   Then one sentence: the smoke web server is `npm run dev` (`playwright.config.ts:30`), so a green
   smoke run does not exercise the production prerender that blocker #90 was about. Only the
   route table in the `build` job's log shows that (V7).
5. `## force-dynamic fallback`. Covers:
   - the `git log -S'force-dynamic' -- app` result (added in `13558b9`, removed in `60a7a1f`)
   - that no file under `app/` matches today
   - that `blockers.md`'s "Current stabilization state" and follow-up step 2 are therefore already
     done in code, with step 3 (build) and step 4 (smoke-check `/about`) open as V7 and V10
6. `## Rollback triggers (proposed)`. A note containing the exact phrase `Proposed, not adopted`,
   then one list item per trigger. Each item begins with its bold id, as in
   `- **R1, checks:** …`. Acceptance greps for `^- \*\*R<n>`:
   - **R1, checks:** a required check (`lint`, `typecheck`, `build`, `test`) or the Playwright smoke
     fails on `main`, and the failure traces to the migration. Act by reverting, as
     `readiness.md:79-81` says.
   - **R2, routes:** `/about` or a `/blog/posts/[...slug]` page returns a 5xx in production or
     renders without its article. These are the blocker's routes (`blockers.md:7-9`); the article
     is what the smoke asserts at `blog.smoke.spec.ts:32`.
   - **R3, homepage performance:** the median of three Lighthouse desktop runs on `/` exceeds the
     pre-migration issue-70 baseline by more than 20%. That is LCP above 1404.8 ms (baseline
     1170.7) or FCP above 398.0 ms (baseline 331.7), per
     `docs/perf/homepage-desktop-baseline-issue-70.md:26-27`. Caveat, stated in the document: `/`
     has changed since that baseline, so a breach has to be attributed to the migration before
     anyone reverts.
   - **R4, post-page performance:** no baseline exists. The first V13 run becomes the baseline, and
     no numeric trigger applies until then.
7. `## Performance spot-checks`. Two subsections, `### Homepage (/)` and `### Blog post page`, each
   marked **not run** and each giving the exact commands:

   ```bash
   export OG_API_KEY=local-placeholder   # any non-empty value; the post route throws if it is unset
   npm run build
   npm run serve -- --port 3000          # leave running; use a second terminal for the runs
   mkdir -p /tmp/next16-validation
   for n in 1 2 3; do
     npx -y lighthouse <URL> --preset=desktop --output=json \
       --output-path=/tmp/next16-validation/<name>-run-$n.json --quiet \
       --chrome-flags='--headless=new --no-sandbox'
   done
   ```

   - `<URL>`/`<name>` are `http://127.0.0.1:3000/` / `home`, and
     `http://127.0.0.1:3000/blog/posts/the-missing-layer-in-your-ai-stack-intermediate-knowledge` / `post`.
     That post exists in `data/blog/` and the smoke suite already uses it.
   - The flags are the ones the issue-70 method used (`homepage-desktop-baseline-issue-70.md:16-20`).
   - The document says: record the median FCP, LCP and Speed Index of the three runs and compare
     them against R3.

*Alternatives weighed:*
- A free-form narrative. Rejected: it cannot be checked mechanically.
- Writing the checklist into `readiness.md`. Rejected: only the new file is approved.

### D3 · Proposed rollback numbers: 20% over the pre-migration median

- *Why 20%:* the issue-70 runs spread far more than 5% (FCP 212-599 ms), so a 5% trigger would fire
  on noise. 20% is the margin the repository already used for the #69 targets
  (`homepage-desktop-baseline-issue-70.md:50-52`).
- *Alternatives:*
  - The 5% "fail" rule from #69 (`:55-56`). Rejected as too tight for this variance.
  - Leaving the trigger blank. Rejected: the intake asks for the thresholds. The numbers are marked
    proposed, and adoption is V11, so the developer decides by changing or adopting them. This plan
    does not decide them.

### D4 · Acceptance checks the document, not just the toolchain

`pipeline-check.sh lint` lints only `app components lib layouts scripts` (`package.json:12`).
`test` collects only `components/`, `lib/` and `app/` (`vitest.config.ts:16-20`). Neither can see a
file under `docs/`. Each acceptance therefore starts with `test -f` and `grep` assertions on the
document, then runs the pipeline check the intake names.

Task 1 asserts the following, using the format rules in D2:
- **Headings:** all seven D2 headings, plus the two subsections `### Homepage (/)` and
  `### Blog post page`.
- **Rows:** V1 to V13 are each present, and each has a Status cell of `met`, `not met` or `not run`.
- **Statuses the plan fixes:**
  - V4 is `met`.
  - V7, V8, V9, V12 and V13 are `not run`. They need Actions or a browser, so this cannot change on
    the PC.
  - No row from V7 to V13 is `met`. This is a negated `grep -E`. `not met` does not match, because
    the regex anchors `met` right after the cell separator.
- **Content:** `Proposed, not adopted`, list items R1 to R4, the removal commit `60a7a1f`, `/about`
  and `npx -y lighthouse`.

V10 and V11 are only required not to be `met`. They are not pinned to `not met`: if `main` gains
`/about` smoke coverage before the worker runs, task 1.1 tells the worker to record the current
state.

A separate task checks that nothing outside the document changed, comparing against the merge base
with `origin/main`, never a fixed commit. It asserts the whole diff, not a list of paths that could
miss one (`tsconfig.json`, `playwright.config.ts`, other `docs/` files). Every tracked path that
differs from the merge base must be either `docs/specs/next16-migration/validation.md` or under
`openspec/changes/p1h-240-site-record-the-next-js-16/`. So must every untracked, non-ignored path.

Untracked paths are listed with top-level dot-entries excluded (`':(exclude,glob).*'`). `.github`
and `.husky` are listed separately. The reason: in the agent sandbox, untracked mount points such
as `.bashrc`, `.controller` and `.workstream` appear at the worktree root. They are not part of
the change and would fail the check on every run. An untracked file cannot reach the PR without
being committed, and once committed it appears in the tracked diff, which has no exclusion.

*Alternative:* a vitest test that parses the document. Rejected: it would add a file under `app/` or
`lib/`, outside the approved write path.

### D5 · Lane

Only `docs/specs/next16-migration/validation.md` is written. No path in `machinery.toml`'s
`boundary.worker` is touched, so the lane is `workstream`.

## Dependencies

None added, removed or moved. `package.json` and `package-lock.json` are unchanged.

## CI this change depends on

None of `typecheck`, `npm run build` or the Playwright smoke can be affected by a markdown file under
`docs/`. The document does depend on reading them: V7 to V9 are only settled by the PR's
`Required Checks / build`, `Required Checks / typecheck` and `Playwright Smoke / smoke` results,
which the developer reads before accepting.

## What a visitor sees

Nothing. No route changes, and `docs/` is not part of the deployed site. There is no route to check
on the preview.

## Risks / Trade-offs

- [The document is read as saying the migration is finished, because V4 is met] → V7, V9 to V11 and
  V12-V13 stay not met or not run, and the header states that sign-off needs every row met.
- [`blockers.md` keeps saying the fallback is in place] → `validation.md` says, in one sentence and
  with evidence, which statement in `blockers.md` no longer holds. Correcting `blockers.md` is a
  follow-up.
- [The proposed thresholds are taken as adopted when the PR merges] → the section title and its
  first line say "Proposed, not adopted", and V11 stays not met.
- [The Prettier pre-commit hook (lint-staged, `package.json:89-91`) reformats the markdown tables] →
  harmless. The acceptance greps match headings and literals, and the Status-cell regexes allow
  any padding around `|`. Prettier does not rewrite `**` bold or the `-` list markers the R1-R4
  greps rely on.
- [Line numbers cited in the document drift as code changes] → each citation names the commit
  described in the header.

## Migration Plan

None. To roll back, revert the commit that adds the file.

## Open Questions

None that change the plan. Adopting R1-R4 is the developer's call, made after merge by editing the
document. Until then V11 records that it has not happened.
