# Tasks

The exact acceptance commands are in `contract.json`. Each one runs from the repo root with no network
and no browser.

## 1. Write the measurement plan

- [x] 1.1 (write-measurement-plan) Create `docs/runbooks/analytics-measurement-plan.md` to the outline
  and conventions in design.md D1 and D3, using the evidence in investigation.md (Affected behavior).
  Re-read each cited line at the current HEAD and cite `path:line`. Rank exactly five opportunities by
  expected impact and effort. Propose at most five KPIs with any event names. Write the 30- and 60-day
  plans as outcomes with proposed GitHub issue titles. Give every proposed item a success metric. List
  every dashboard- or account-dependent fact under `## Not checked`. Include no measurement, property,
  stream or account id. Verify with the design.md D2 document check: the file exists; the D1 headings
  are present; five ranked rows; at least 4 `Success metric` and 2 `GitHub issues` columns; three or more
  Not checked bullets; the required citations are present and every cited `path:line` resolves; no
  `G-` id; and `bash scripts/pipeline-check.sh lint` passes.

## 2. Guard the scope

- [x] 2.1 (no-code-change) Confirm that no source, config or package path differs from the merge base
  with `origin/main`, and that none is left untracked, so the change stays documentation-only as the
  intake requires. Verify with `git diff --quiet "$(git merge-base HEAD refs/remotes/origin/main)" --
  <source and config paths>`, an empty `git ls-files --others --exclude-standard -- <same paths>`, and
  `bash scripts/pipeline-check.sh lint`.
