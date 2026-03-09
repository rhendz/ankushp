# Weekly Content Measurement Runbook

This runbook defines a weekly measurement cadence that ties content output to outcomes.

## Goal

Make weekly content decisions from consistent evidence across traffic quality, subscriber growth, and topic performance.

## Inputs

- GA readiness check: `./scripts/ga-seo-check.sh`
- Weekly snapshot command: `./scripts/ga-weekly-dashboard.sh`
- Optional path prefix override: `GA4_PATH_PREFIX=/blog`

## Weekly KPI Dashboard

Track this dashboard once per week from the generated snapshot in `output/ga-weekly/<YYYY-MM-DD>/`.

| KPI | Why it matters | Source |
| --- | --- | --- |
| Organic blog sessions | Measures top-of-funnel qualified discovery | `summary.md` + `raw.json` |
| Engaged sessions per post | Measures reader quality, not just clicks | `raw.json` |
| Top post CTR trend | Identifies topics/headlines winning distribution | `summary.md` |
| New subscriber starts | Connects content output to conversion | newsletter metrics + weekly notes |
| Top topic clusters | Guides next-week editorial planning | `summary.md` |

## Weekly Procedure

1. Run readiness check: `./scripts/ga-seo-check.sh`.
2. Generate weekly snapshot: `./scripts/ga-weekly-dashboard.sh`.
3. Review `output/ga-weekly/<YYYY-MM-DD>/summary.md` and extract:
   - top-performing posts,
   - underperforming posts,
   - topic cluster movement.
4. Record subscriber movement from your newsletter/CRM source in the same weekly note.
5. Decide next-week actions:
   - create 1-2 follow-up topics from winners,
   - refresh 1 weak post with high potential,
   - update distribution angle/channel where CTR dropped.

## Review Cadence

- Frequency: once per week.
- Owner: content operator on duty.
- Review artifact: one dated note linked to `output/ga-weekly/<YYYY-MM-DD>/`.

## Evidence and Retention

- Generated artifacts in `output/` are local and git-ignored.
- Keep a dated decision log in your planning system, with links to snapshot files.

## Risk and Rollback

- Risk: missing GA credentials can block snapshot generation.
- Rollback: no production impact; remove runbook/script commit to revert process changes.
