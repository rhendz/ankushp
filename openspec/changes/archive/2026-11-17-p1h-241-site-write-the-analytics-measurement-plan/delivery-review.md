# Delivery review — p1h-241-site-write-the-analytics-measurement-plan

**Reviewed revision:** 94bf3da78e78154c
**Reviewed commit:** a2f2bc9f927a69c05675e2489726efc27c44d590
**Reviewed at:** 2026-11-17
**Reviewer:** the Verifier (claude), run f18054a6d78edc3477a63af4
**Verdict:** PASS WITH FINDINGS

Written by the controller from the Verifier's checked reply. The controller decides from that reply, not from this file.

## What was checked

- Read proposal.md, design.md (D1-D4) and contract.json. .openspec.yaml sets skip_specs, so the change has no spec scenarios; the content contract is design D1.
- git diff --stat origin/main...HEAD: the only file outside openspec/changes/<change>/ is the new docs/runbooks/analytics-measurement-plan.md. No source, config, package.json, package-lock.json or protected path changed. Lockfile and manifest are untouched, as the plan says.
- git diff --stat a2f2bc9 HEAD: the only change after the tested revision is evidence.md, so the recorded revision a2f2bc9 matches the deliverable as it stands now.
- Read the whole runbook against D1. All eight H2 headings are present and in order. The opportunities table has five ranked rows with impact and effort. There are 5 KPIs, each stating whether it is new or carried over. The 30- and 60-day tables have Success metric and GitHub issues columns, with titles marked 'Proposed'. Not checked has 10 bullets and covers every D1 item. The D3 no-code-first preference and the event naming are followed.
- Spot-checked the citations against the code. All match: components/analytics.tsx:10-13 and 19-20; app/layout.tsx:60-61, 100-102 and 111; data/siteMetadata.js:28; package.json:20 and 35; app/api/newsletter/route.ts:74, 101, 105 and 108; app/api/claps/route.ts:73 and 99; lib/claps-store.ts:203-204; components/clap-button.tsx:76 and 156; components/newsletter-cta.tsx:144 and 174; scripts/ga-seo-report.sh:15, 23-26 and 48.
- Secrets: the document contains no G- measurement id, property id, stream id, account name or token. It names only the env var GOOGLE_ANALYTICS_ID.
- Vitest: no new runtime behaviour, so no vitest case is due. Design D2 rejects a markdown-parsing test, giving its reason.
- Ran bash scripts/pipeline-check.sh lint; it exited 0.

## Findings

### F1 · The 'Newsletter error rate' KPI divides by 'sign-up attempts', but no proposed event or source counts attempts.

**Severity:** minor
**Owner:** builder

docs/runbooks/analytics-measurement-plan.md:105 says 'newsletter_subscribe_error divided by sign-up attempts, per week'. Its Event names cell lists only newsletter_subscribe_error, and no attempt event appears anywhere in the document (lines 98-108, 118-132).

**Fix:** Define the denominator from existing signals, either as newsletter_subscribe + newsletter_subscribe_error or as the POST count in the [newsletter-api] logs. Or add an attempt event name to the KPI row and to the 30-day issue list.

## Not checked

- The full acceptance lines from contract.json were not re-run verbatim (the sandbox refuses compound shell lines). The structural checks were confirmed by reading the file, and lint was run. Citations I did not open (next.config.js:14/16/17, layouts/*, app/blog/page.tsx:170, scripts/ga-seo-check.sh, scripts/ga-weekly-dashboard.sh, scripts/agent-health-check.sh:61-67) rest on the supervisor's recorded pass.
- bash scripts/pipeline-check.sh test was not run, since no code changed.
- Routes a visitor would see change: none. docs/ is not read by next build or contentlayer, so the preview has nothing to look at. The developer reviews the markdown in the PR diff.
- GitHub Actions checks the PR still has to pass: typecheck, build (npm run build), the Playwright smoke, lint and pr-title.
- Whether the impact/effort ranking and the KPI choices are sensible is for the developer to judge by reading.
- Every live-account fact in the document's own Not checked list (GA4 settings, the env var in deployments, Speed Insights, provider counts, Redis totals, the external Codex skill).
- Which GitHub issue, if any, the PR closes. The intake names none.
