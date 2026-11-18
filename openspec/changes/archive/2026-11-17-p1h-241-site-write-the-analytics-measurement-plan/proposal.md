# Proposal: write the analytics measurement plan

**Linear:** P1H-241. **GitHub issue:** none is named in the intake. The pull request names the issue it
closes, or says there is none (see investigation.md, Uncertainties).

## Why

The site loads GA4 and Vercel Speed Insights, but nothing records what they measure, what they miss, or
what the site should measure next. The only custom signals (newsletter API logs and clap counts) never
reach a report. A written plan gives later instrumentation issues an agreed baseline, KPIs and success
metrics to build against.

## What Changes

- Add `docs/runbooks/analytics-measurement-plan.md`. It contains:
  - an inventory of what is tracked today, with `path:line` evidence (the GA component, the root layout,
    Speed Insights, newsletter logs, claps, and the GA reporting scripts under `scripts/`);
  - the gaps;
  - the five highest-value opportunities, ranked by expected impact and effort;
  - a KPI set of at most five, with any event names it needs;
  - a 30-day and a 60-day plan, given as proposed outcomes, each broken into proposed GitHub issue
    titles;
  - a measurable success metric for every proposed item;
  - a Not checked list of everything that needs a live dashboard or account.
- Nothing else changes. There is no code, config, dependency or route change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The change adds a runbook and changes nothing a visitor or the site observably does, so
`.openspec.yaml` sets `skip_specs: true`. The document's content contract is in design.md D1, and
acceptance checks it (design.md D2).

## Impact

- **Files:** one new markdown file under `docs/runbooks/`.
- **Visitors:** none. No route changes, and nothing to look at on the preview beyond the file in the pull
  request diff.
- **Dependencies:** none added, removed or moved.
- **Actions checks:** the change depends on none of typecheck, `npm run build` or the Playwright smoke,
  since `docs/` is outside what they read. `lint` and `pr-title` still run as required checks.

## Out of scope

- Any instrumentation or code change, including adding `gtag('event')` calls, GA key events, or changes
  to `components/`, `app/`, `layouts/`, `lib/`, `data/`, `scripts/` and `next.config.js`.
- Changing the dashboard, the GA4 property, Speed Insights settings or the reporting tooling.
- Reading live analytics accounts, dashboards, provider consoles or the external Codex skill. Anything
  that needs them is listed as Not checked.
- Filing the proposed GitHub issues. They stay proposed titles until the developer accepts the plan.
- Editing `docs/runbooks/README.md` or `docs/runbooks/weekly-content-measurement.md`.
