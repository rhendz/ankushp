# Agent Workflow Rules

These rules define the default issue/PR workflow for this repository.

## Issue Creation

- Create an issue before implementation work unless explicitly told to skip.
- Use the matching template under `.github/ISSUE_TEMPLATE/`:
  - `feature.yml` for user-facing enhancements
  - `bug.yml` for defects
  - `chore.yml` for maintenance/tooling/refactor work
- Fill all required fields from the template.
- Include clear acceptance criteria and validation steps.

## Branching

- Create one branch per issue.
- Branch naming:
  - `ap/feat-<short-slug>`
  - `ap/fix-<short-slug>`
  - `ap/chore-<short-slug>`

## Pull Requests

- Open one PR per issue.
- Use `.github/pull_request_template.md`.
- PR title must follow: `feat|bug|chore: <short description>`.
- Include `Closes #<issue-number>` in the PR body.
- Add a Linear reference when available, but it is optional.
- Complete validation and checklist sections before requesting review.

## Tracking Model

- Use Linear for desired outcomes and initiative-level planning.
- Linear tickets can be coding or non-coding outcomes.
- Use GitHub Issues for implementation-level work in this repository.
- One Linear ticket may map to multiple GitHub Issues and multiple PRs.

## Merge Readiness

- Ensure lint/build/tests in the PR template are completed.
- Document risk and rollback plan.
- For UI changes, include before/after evidence when feasible.

## Agent Execution

- Prefer repository scripts and runbooks over ad-hoc command sequences.
- Primary runbook index: `docs/runbooks/README.md`.
- For Codex skill-driven GA reporting, use:
  - `docs/runbooks/codex-skills.md`
  - `scripts/ga-seo-check.sh`
  - `scripts/ga-seo-report.sh`
- For site maintenance QA, run smoke checks via:
  - `npm run test:smoke:ci` (CI parity)
  - `npm run test:smoke` (local default)

## Environment and Secrets

- Never commit credentials, tokens, or service-account JSON files.
- Keep secrets in local environment files (for example `.env.local`) or user-level secure paths.
- Validate required env before running external API workflows (for GA: property id + auth variables).

## Built by dispatch

Work can also arrive through the dispatch pipeline: a Linear issue in the project "ankushp" (team P1H),
labelled `pipeline`, with a valid entry block and moved to Ready by the developer, is planned, reviewed,
built in its own worktree and brought to the developer's accept card. The developer approves each plan,
accepts each result and merges into `main`.

- `machinery.toml`, `openspec/` and `dispatch/` are the registration; agents may not edit them.
- A pipeline branch is `feature/<job-key>-<slug>` and its pull request title starts with the job key
  (`P1H-123: ...`); the `pr-title` check accepts both forms.
- Pipeline checks run through `scripts/pipeline-check.sh` (`test`, `lint`), which links `node_modules`
  from a store keyed by `package-lock.json`.
- Each Linear issue names the GitHub issue it delivers; the pull request closes it.
