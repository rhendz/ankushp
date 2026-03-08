# Codex Skills Runbook

This repository assumes the following custom skills are installed in the user Codex home (not in this git repo):

- `site-maintenance`
- `ga-seo-strategy-report`

Default skills path:

- `$CODEX_HOME/skills` (fallback: `$HOME/.codex/skills`)

## Why skills are not tracked here

Skill files are user-environment artifacts and follow the Codex account/machine setup in `~/.codex/skills`. This repo tracks only durable wrappers and operator instructions.

## Required local setup for GA reports

Set in `.env.local` (or equivalent loaded env file):

- `GA4_PROPERTY_ID` (numeric GA4 property ID)
- `GA4_SERVICE_ACCOUNT_FILE` (path to GA service account JSON)

Optional:

- `GA4_PATH_PREFIX` (defaults to `/blog`)
- `GA4_TOP_N`
- `GA4_COMPARE_START_DATE` / `GA4_COMPARE_END_DATE`

## Agent startup checklist

1. Confirm skill script exists:
- `$CODEX_HOME/skills/ga-seo-strategy-report/scripts/ga4_seo_strategy_report.py`

2. Confirm setup check script exists:
- `$CODEX_HOME/skills/ga-seo-strategy-report/scripts/check_ga4_setup.sh`

3. Load env config:
- `source .env.local`

4. Activate project venv:
- `. .venv/bin/activate`

5. Run setup check:
- `./scripts/ga-seo-check.sh`

6. Run report:
- `./scripts/ga-seo-report.sh`

## Wrapper scripts in this repo

- `scripts/ga-seo-check.sh`: validates GA skill readiness from current env.
- `scripts/ga-seo-report.sh`: executes the GA report skill with sensible defaults.

## Notes

- Do not commit `output/` reports by default.
- Do not commit credentials or service-account JSON files.
- The GA skill defaults to content-focused `/blog` analysis and auto previous-period comparison.
