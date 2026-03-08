#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

CODEX_HOME_PATH="${CODEX_HOME:-$HOME/.codex}"
GA_SCRIPT="$CODEX_HOME_PATH/skills/ga-seo-strategy-report/scripts/ga4_seo_strategy_report.py"
CHECK_SCRIPT="$CODEX_HOME_PATH/skills/ga-seo-strategy-report/scripts/check_ga4_setup.sh"
VENV_DIR="${VENV_DIR:-.venv}"

if [ ! -d "$VENV_DIR" ] && [ -d .venv-ga ]; then
  VENV_DIR=".venv-ga"
fi

if [ ! -f "$GA_SCRIPT" ]; then
  echo "ERROR: Missing GA skill script: $GA_SCRIPT"
  echo "Install ga-seo-strategy-report in $CODEX_HOME_PATH/skills first."
  exit 2
fi

if [ ! -d "$VENV_DIR" ]; then
  echo "ERROR: Missing virtualenv in repo root. Checked: ${VENV_DIR}"
  echo "Create one and install GA deps first."
  echo "  python3 -m venv .venv"
  echo "  . .venv/bin/activate"
  echo "  pip install -r \"$CODEX_HOME_PATH/skills/ga-seo-strategy-report/scripts/requirements.txt\""
  exit 2
fi

# shellcheck disable=SC1091
. "$VENV_DIR/bin/activate"

if [ -x "$CHECK_SCRIPT" ]; then
  "$CHECK_SCRIPT"
fi

mkdir -p output

python "$GA_SCRIPT" \
  --path-prefix "${GA4_PATH_PREFIX:-/blog}" \
  --start-date "${GA4_START_DATE:-30daysAgo}" \
  --end-date "${GA4_END_DATE:-yesterday}" \
  --limit "${GA4_TOP_N:-25}" \
  --output "${1:-output/ga-seo-report.md}" \
  --raw-json-out "${2:-output/ga-seo-report.raw.json}"
