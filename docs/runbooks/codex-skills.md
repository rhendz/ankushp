# Codex Skills Runbook

This repository expects these custom skills to be installed in the user Codex home (not in this git repo):

- `site-maintenance`
- `ga-seo-strategy-report`
- `upskill`

Skill path:
- `$CODEX_HOME/skills` (fallback: `$HOME/.codex/skills`)

## Required local setup for GA reports

Set in `.env.local` (or equivalent loaded env file):

- `GA4_PROPERTY_ID` (numeric GA4 property ID)
- `GA4_SERVICE_ACCOUNT_FILE` (path to GA service account JSON)

Optional:

- `GA4_PATH_PREFIX` (defaults to `/blog`)
- `GA4_TOP_N`
- `GA4_COMPARE_START_DATE` / `GA4_COMPARE_END_DATE`

## Agent startup checklist

1. Confirm skill scripts exist:
- `$CODEX_HOME/skills/ga-seo-strategy-report/scripts/ga4_seo_strategy_report.py`
- `$CODEX_HOME/skills/ga-seo-strategy-report/scripts/check_ga4_setup.sh`
- `$CODEX_HOME/skills/upskill/scripts/analyze_usage.py`
2. Load env config: `source .env.local`
3. Run setup check: `./scripts/ga-seo-check.sh`
4. Run report: `./scripts/ga-seo-report.sh`

## Upskill usage (12-hour maintenance runs)

Use this analyzer command to rank recent skill friction and choose patch targets:

```bash
python3 "$CODEX_HOME/skills/upskill/scripts/analyze_usage.py" \
  --hours 12 \
  --codex-home "$CODEX_HOME" \
  --skills-dir "$CODEX_HOME/skills"
```

## Wrapper scripts in this repo

- `scripts/ga-seo-check.sh`: validates GA skill readiness from current env.
- `scripts/ga-seo-report.sh`: executes the GA report skill with sensible defaults.
- `scripts/agent-health-check.sh`: validates installed skills, script syntax/smoke checks, and local automation TOML/cwd/rrule sanity.

## Notes

- `output/` artifacts are intentionally ignored in git.
- Do not commit credentials or service-account JSON files.
- If no GA env is configured, `agent-health-check.sh` skips GA readiness as non-blocking.
