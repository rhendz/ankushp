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
- PR title must follow: `feat|chore|bug: <short description>`.
- Include `Closes #<issue-number>` in the PR body.
- Complete validation and checklist sections before requesting review.

## Merge Readiness

- Ensure lint/build/tests in the PR template are completed.
- Document risk and rollback plan.
- For UI changes, include before/after evidence when feasible.
