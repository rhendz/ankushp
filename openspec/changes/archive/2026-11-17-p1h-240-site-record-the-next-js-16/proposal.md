# Proposal — p1h-240-site-record-the-next-js-16

**Linear:** P1H-240. **GitHub:** the Linear entry block does not name a delivering GitHub issue. The
work answers phase 3 of the migration plan, issue #85 in `docs/specs/next16-migration/readiness.md:56-59`,
and records the state of blocker issue #90 (`docs/specs/next16-migration/blockers.md:5`).

## Why

The Next.js 16 migration has a readiness plan and a blocker note, but nothing records whether it is
finished. The blocker note is now wrong: it says a temporary `force-dynamic` fallback is still in
place, but #94 removed it (see `investigation.md`). A sign-off checklist, with evidence for each line,
lets the developer see in one place what is met, what is not, and what is still unmeasured.

## What Changes

- Add `docs/specs/next16-migration/validation.md`, a sign-off checklist for the migration as it
  stands on `main`. Each line carries one status (`met`, `not met` or `not run`) and its evidence:
  - framework versions on main, and the async-params and lint migrations
  - the `force-dynamic` fallback: no route carries it any more. The line gives the removal commit
    and notes that `blockers.md`'s stabilization section is stale
  - smoke coverage of the critical routes: covered and uncovered routes, including that `/about` has
    no smoke test, and that the suite runs against the dev server, not the production build
  - lint and test, as run on the PC; build, typecheck and Playwright smoke as **not run (PC)**,
    naming the GitHub Actions job that is their evidence
  - the rollback triggers: proposed, each with its source; adoption by the developer is **not met**
  - the performance spot-checks for `/` and one blog post page: **not run**, with the exact commands
- No other file changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The change adds one document. No route, response or behaviour of the site changes, so
`.openspec.yaml` sets `skip_specs: true`.

## Impact

- **Files:** one new markdown file under `docs/specs/next16-migration/`.
- **Visitors:** none. `docs/` is not served or rendered by the site. No route looks different.
- **Dependencies:** none added, removed or moved.
- **CI the change depends on:** none of the GitHub Actions checks can be affected by a markdown file
  under `docs/`. The checklist does, however, point the developer at the PR's `build`, `typecheck`
  and `smoke` jobs as the evidence for three of its lines.

## Out of scope

- Any change to site code, routes, dependencies or configuration (`app/`, `components/`, `layouts/`,
  `lib/`, `css/`, `data/`, `public/`, `scripts/`, `tests/`, `package*.json`, `next.config.js`).
- Removing or re-adding the `force-dynamic` fallback.
- Editing `blockers.md` or `readiness.md`. The new document notes that `blockers.md` is stale;
  correcting it would be a separate issue.
- Running Lighthouse or the Playwright smoke on the PC.
- Adopting rollback thresholds on the developer's behalf. They are recorded as proposed.
- Adding smoke coverage for `/about`. The checklist records the gap; filling it is separate work.
