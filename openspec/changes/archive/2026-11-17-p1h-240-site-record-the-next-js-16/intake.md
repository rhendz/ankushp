# Intake — p1h-240-site-record-the-next-js-16

Written by dispatch intake from the entry block of the Linear issue. This is
intent, not a plan: what is wanted, and what bounds it.

**Linear:** P1H-240 (https://linear.app/rhendz/issue/P1H-240/site-record-the-nextjs-16-migration-sign-off-checklist-and-its)
**Kind:** engineering
**Authorized for:** plan (never execution)
**Branch:** feature/p1h-240-site-record-the-next-js-16
**Risk:** low

## Objective

docs/specs/next16-migration/validation.md records the state of the Next.js 16 migration on main as a sign-off checklist. Each line is marked met or not met with its evidence: which critical routes the smoke suite covers, which routes still carry the temporary force-dynamic fallback that docs/specs/next16-migration/blockers.md describes, and the thresholds that would trigger a rollback. The performance spot-checks for the homepage and a blog post page are listed with the exact commands to run them and are marked not run, because nothing in the pipeline has a browser.

## Success criteria

- `test -f docs/specs/next16-migration/validation.md` succeeds
- `bash scripts/pipeline-check.sh lint` passes
- `bash scripts/pipeline-check.sh test` passes

## Out of scope

- Any change to site code, routes, dependencies or configuration
- Removing the force-dynamic fallback
- Running Lighthouse or the Playwright smoke on the PC

## Surfaces it touches

- tooling

## Paths it will write

- docs/specs/next16-migration/validation.md
