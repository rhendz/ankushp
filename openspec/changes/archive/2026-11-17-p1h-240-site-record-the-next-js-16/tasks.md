# Tasks — p1h-240-site-record-the-next-js-16

## 1. Write the sign-off checklist

- [x] 1.1 (write-validation-checklist) Create `docs/specs/next16-migration/validation.md` with the
  structure and format rules in `design.md` D2:
  - the seven headings and the subsections `### Homepage (/)` and `### Blog post page`, all with
    their exact text
  - rows V1-V13, each beginning `| V<n> |`, with a plain Status cell of `met`, `not met` or
    `not run` (D1). No bold and no extra words in that cell, and no `|` in the Item cell.
  - the phrase `Proposed, not adopted`, and the triggers as list items `- **R1, …:**` to
    `- **R4, …:**`

  While writing it:
  - Re-check each cited fact against the merge base with `origin/main` before writing it. If a fact
    has changed since this plan was written, record the current state and say so in the row.
  - Run `bash scripts/pipeline-check.sh lint` and `bash scripts/pipeline-check.sh test` first, and
    record their results in V5 and V6. Cite the date of the run and the merge-base commit the
    document describes, which is HEAD before your commit, not the commit that adds the file.
  - V7's evidence is the route table in the `Required Checks / build` log. The developer confirms
    that `/about` shows as `○ (Static)` and `/blog/posts/[...slug]` as `● (SSG)`, not as
    `ƒ (Dynamic)`. A green job alone does not count.
  - Never mark V7 to V13 as met.

  Verify with the contract's acceptance. It checks:
  - `test -f` on the file
  - `grep` for every heading and both subsections
  - each row V1-V13 has a valid Status cell
  - V4 is `met`, and V7, V8, V9, V12 and V13 are `not run`
  - a negated `grep -E` fails the check if any row V7-V13 is `met`
  - `Proposed, not adopted` and R1-R4 are present
  - `60a7a1f`, `/about` and `npx -y lighthouse` are present

  Then it runs `bash scripts/pipeline-check.sh lint`.

## 2. Confirm nothing else changed

- [x] 2.1 (confirm-site-unchanged) Confirm the change writes only the checklist and its own plan.
  Every tracked path that differs from the merge base with `origin/main` must be
  `docs/specs/next16-migration/validation.md` or under
  `openspec/changes/p1h-240-site-record-the-next-js-16/`. So must every untracked, non-ignored
  path; sandbox dot-entries at the root are excluded, see `design.md` D4. Then run the unit tests.
  Verify with: `git diff --name-only` from the merge base plus `git ls-files --others`, filtered
  against those two paths, leaves nothing; then `bash scripts/pipeline-check.sh test`.
