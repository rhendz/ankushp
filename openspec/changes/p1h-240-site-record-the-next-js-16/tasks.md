# Tasks — p1h-240-site-record-the-next-js-16

## 1. Write the sign-off checklist

- [ ] 1.1 (write-validation-checklist) Create `docs/specs/next16-migration/validation.md` with the
  structure in `design.md` D2. That means the seven headings with their exact text and the rows
  V1-V13, each with a status (`met`, `not met` or `not run`, per D1) and its evidence.
  - Re-check each cited fact against the merge base with `origin/main` before writing it. If a fact
    has changed since this plan was written, record the current state and say so in the row.
  - Run `bash scripts/pipeline-check.sh lint` and `bash scripts/pipeline-check.sh test` first, and
    record their results in V5 and V6.
  - Never mark V7 to V9 or V11 to V13 as met.
  - Verify with: `test -f` on the file, `grep` for every D2 heading, rows V1-V13, the removal commit
    `60a7a1f`, `/about`, the Lighthouse command and the `not run` status, then
    `bash scripts/pipeline-check.sh lint`.

## 2. Confirm nothing else changed

- [ ] 2.1 (confirm-site-unchanged) Confirm the change touches no site code, content, script, test,
  package, configuration, or the two existing migration documents. Compare against the merge base
  with `origin/main` and check for untracked files in those directories. Then run the unit tests.
  Verify with: `git diff --quiet` against the merge base over those paths, an empty
  `git status --porcelain` for them, and `bash scripts/pipeline-check.sh test`.
