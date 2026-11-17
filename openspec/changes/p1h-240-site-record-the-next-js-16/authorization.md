# Authorization — p1h-240-site-record-the-next-js-16

Written when the developer answered the plan-approval card (the decision page, or
`machinery controller approve p1h-240-site-record-the-next-js-16 dispatch`). It records what was
authorized, not how it will be built: authorization binds to the outcome and its
constraints, so replanning inside them needs a fresh review rather than a fresh
approval.

This file is deliberately outside the hashed plan. It is written *after* the
review, and putting it in `contract.json` would change the planning revision and
invalidate the review it follows.

**Approval:** build · 2026-11-17T17:30:26
**At:** 2026-11-17
**Outcome authorized:** docs/specs/next16-migration/validation.md records the Next.js 16 migration on main as a sign-off checklist, every line marked met, not met or not run with its evidence, including smoke coverage of critical routes, the force-dynamic fallback, proposed rollback triggers and the not-run performance spot-checks with their commands.
**Constraints:** docs/specs/next16-migration/validation.md; not app/, components/, layouts/, lib/, css/, data/, public/, scripts/, tests/: no site code, content, script or test changes; not package.json, package-lock.json, next.config.js, contentlayer.config.ts and other configuration; not docs/specs/next16-migration/blockers.md and readiness.md: the new document notes blockers.md is stale; correcting it is a follow-up; not removing or re-adding force-dynamic; adding smoke coverage for /about; not running Lighthouse or the Playwright smoke on the PC; committing Lighthouse output; not adopting rollback thresholds: they are recorded as proposed; adoption is the developer's
**Planning revision at authorization:** b9ce6e2eed8c99f3
