# Authorization — p1h-239-site-close-out-the-homepage-3d

Written when the developer answered the plan-approval card (the decision page, or
`machinery controller approve p1h-239-site-close-out-the-homepage-3d dispatch`). It records what was
authorized, not how it will be built: authorization binds to the outcome and its
constraints, so replanning inside them needs a fresh review rather than a fresh
approval.

This file is deliberately outside the hashed plan. It is written *after* the
review, and putting it in `contract.json` would change the planning revision and
invalidate the review it follows.

**Approval:** build · 2026-11-17T17:31:45
**At:** 2026-11-17
**Outcome authorized:** Close out GitHub issue 97 with a document grading its four deliverables against main, file and line, and a vitest guard that fails if package.json lists any @react-three/ package again.
**Constraints:** lib/dependency-guard.test.ts; docs/specs/next16-migration/homepage-3d-closeout.md; not The homepage scene, its fallback, error boundary, look or behaviour (app/, components/, layouts/, css/); not package.json and package-lock.json: no dependency is added, removed or moved; not Fixing the coverage gaps the document names (tests/smoke/, scripts/home-visual-health-check.mjs, .github/workflows/); not Closing GitHub issue 97: the developer does that after reading the document; not openspec/, dispatch/, .claude/, CLAUDE.md, AGENTS.md, scripts/pipeline-check.sh
**Planning revision at authorization:** 90eed3d7aea93783
