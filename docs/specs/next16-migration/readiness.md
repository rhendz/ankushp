# Next.js 16 Migration Readiness (Issue #82)

## Goal
Prepare a low-risk, execution-ready migration path from Next.js 14 to Next.js 16 with explicit blockers, acceptance gates, and rollback strategy.

## Current Baseline
- Node: `v22.22.0`
- npm: `10.9.4`
- Next.js: `^14.0.4` (build currently resolves to `14.2.32`)
- React / React DOM: `^18.2.0`
- ESLint config: legacy `.eslintrc.js`
- Lint command: `next lint --fix --dir pages --dir app --dir components --dir lib --dir layouts --dir scripts`

Baseline verification on this branch:
- `npm run lint` passed
- `npm test` passed
- `npm run build` passed

## Codemod Readiness Scan
Artifacts:
- `docs/specs/next16-migration/codemod-dry-run.log`
- `docs/specs/next16-migration/next-async-request-api-dry.log`
- `docs/specs/next16-migration/next-async-request-api-dry-diff.log`
- `docs/specs/next16-migration/next-lint-to-eslint-cli-dry.log`
- `docs/specs/next16-migration/middleware-to-proxy-dry.log`

### Findings
1. Async request API codemod indicates required changes in exactly 3 routes:
- `app/blog/posts/[...slug]/page.tsx`
- `app/blog/tags/[tag]/page.tsx`
- `app/blog/posts/page/[page]/page.tsx`

Expected migration shape:
- `params` should become `Promise<...>` in page/metadata signatures.
- route handlers/pages should `await props.params` before use.

2. Middleware-to-proxy codemod found no changes required.
- No `middleware.ts/js` exists in repo today.

3. `next-lint-to-eslint-cli` codemod cannot auto-complete in current setup.
- It failed while trying to migrate legacy `.eslintrc.js` to flat config.
- This is a known migration checkpoint and should be handled explicitly during issue #84.

## Execution Plan

### Phase 1 (Issue #83): Framework dependency baseline upgrade
- Upgrade `next`, `react`, `react-dom`, and `eslint-config-next` to Next 16-compatible versions.
- Keep behavior unchanged; focus only on dependency alignment and build integrity.
- Preserve current app visuals and interaction flows.

### Phase 2 (Issue #84): Breaking-change migrations
- Apply async request API changes to the 3 identified route files.
- Migrate lint workflow from `next lint` usage to ESLint CLI flow.
- If any runtime API differences appear during build/test, patch only affected files.

### Phase 3 (Issue #85): Stabilization and parity checks
- Re-run lint/test/build and smoke checks.
- Spot-check performance for `/` and one representative `/blog/posts/[slug]` route.
- Document regression thresholds and rollback trigger.

## Go / No-Go Criteria

Go for #83 when:
- Baseline checks are green (already true)
- Migration scope is identified (true)

No-Go if:
- Dependency upgrade causes unresolved peer conflicts without stable resolution path.
- Build breaks in unrelated areas outside upgrade scope.

## Risks and Mitigations
- Risk: ESLint migration blocks CI.
  - Mitigation: handle lint migration as an explicit, isolated task in #84.
- Risk: Async request API refactor introduces route regressions.
  - Mitigation: touch only codemod-targeted files first; validate with tests + targeted manual route checks.
- Risk: performance regression on homepage.
  - Mitigation: keep post-upgrade perf parity check in #85 before final sign-off.

## Rollback Plan
- If #83 or #84 destabilizes build/tests, revert the migration PR commit(s) and restore `main` baseline.
- Re-attempt with narrower package increments and rerun codemod validation.

## Recommended Next Issue
Start with **#83** (`chore: upgrade framework dependencies to Next.js 16 baseline`).
