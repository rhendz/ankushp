# Intake — p1h-239-site-close-out-the-homepage-3d

Written by dispatch intake from the entry block of the Linear issue. This is
intent, not a plan: what is wanted, and what bounds it.

**Linear:** P1H-239 (https://linear.app/rhendz/issue/P1H-239/site-close-out-the-homepage-3d-runtime-issue-with-a-written-check-and)
**Kind:** engineering
**Authorized for:** plan (never execution)
**Branch:** feature/p1h-239-site-close-out-the-homepage-3d
**Risk:** low

## Objective

docs/specs/next16-migration/homepage-3d-closeout.md says, with file and line, whether each of the four deliverables of GitHub issue 97 is met by the code on main today, and names anything still missing. The issue was written when the homepage used the @react-three packages; they were removed in commit 93b079c and the scene now uses plain three. A vitest case fails if package.json lists any @react-three package again, so the runtime error the issue describes cannot come back unnoticed.

## Success criteria

- `bash scripts/pipeline-check.sh test` passes with a new case that fails when package.json lists a package whose name starts with @react-three/
- `test -f docs/specs/next16-migration/homepage-3d-closeout.md` succeeds
- `bash scripts/pipeline-check.sh lint` passes

## Out of scope

- Any change to the homepage scene, its look or its behaviour
- Any change to package.json or the lockfile
- Closing GitHub issue 97; the developer closes it after reading the document

## Surfaces it touches

- tooling

## Paths it will write

- docs/specs/next16-migration/homepage-3d-closeout.md
- lib/dependency-guard.test.ts
