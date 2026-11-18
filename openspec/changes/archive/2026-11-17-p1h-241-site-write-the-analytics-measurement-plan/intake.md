# Intake — p1h-241-site-write-the-analytics-measurement-plan

Written by dispatch intake from the entry block of the Linear issue. This is
intent, not a plan: what is wanted, and what bounds it.

**Linear:** P1H-241 (https://linear.app/rhendz/issue/P1H-241/site-write-the-analytics-measurement-plan)
**Kind:** engineering
**Authorized for:** plan (never execution)
**Branch:** feature/p1h-241-site-write-the-analytics-measurement-plan
**Risk:** low

## Objective

docs/runbooks/analytics-measurement-plan.md holds an analytics measurement plan for the site. It maps what is tracked today and where, with file and line (the analytics component, the layout, the reporting scripts under scripts/), names the gaps, ranks the five most useful opportunities by expected impact and effort, proposes a small KPI set with any event names it needs, and lays out a 30 and 60 day plan as proposed outcomes with the GitHub issues each would break into. Every proposed item has a measurable success metric. Anything that needs a look at a live dashboard is listed as not checked.

## Success criteria

- `test -f docs/runbooks/analytics-measurement-plan.md` succeeds
- `bash scripts/pipeline-check.sh lint` passes

## Out of scope

- Any instrumentation or code change
- Changing the dashboard or analytics tooling
- Reading live analytics accounts or dashboards; the pipeline has no access to them

## Surfaces it touches

- tooling

## Paths it will write

- docs/runbooks/analytics-measurement-plan.md
