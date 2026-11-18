# Authorization — p1h-241-site-write-the-analytics-measurement-plan

Written when the developer answered the plan-approval card (the decision page, or
`machinery controller approve p1h-241-site-write-the-analytics-measurement-plan dispatch`). It records what was
authorized, not how it will be built: authorization binds to the outcome and its
constraints, so replanning inside them needs a fresh review rather than a fresh
approval.

This file is deliberately outside the hashed plan. It is written *after* the
review, and putting it in `contract.json` would change the planning revision and
invalidate the review it follows.

**Approval:** build · 2026-11-17T04:18:11
**At:** 2026-11-17
**Outcome authorized:** docs/runbooks/analytics-measurement-plan.md maps what the site tracks today with file:line, names the gaps, ranks five opportunities by impact and effort, proposes a small KPI set with event names, and lays out 30- and 60-day outcomes with proposed GitHub issues, each with a measurable success metric and with every dashboard-dependent fact marked not checked.
**Constraints:** docs/runbooks/analytics-measurement-plan.md; not Any instrumentation or code change: app/, components/, layouts/, lib/, css/, data/, public/, scripts/, tests/, root config files, package.json, package-lock.json; not Changing the GA4 property, dashboards, Speed Insights settings or the reporting tooling; not Reading live analytics accounts, dashboards, provider consoles or the external Codex skill; not Filing the proposed GitHub issues; not Editing docs/runbooks/README.md or docs/runbooks/weekly-content-measurement.md
**Planning revision at authorization:** 94bf3da78e78154c
