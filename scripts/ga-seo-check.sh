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
CHECK_SCRIPT="$CODEX_HOME_PATH/skills/ga-seo-strategy-report/scripts/check_ga4_setup.sh"
VENV_DIR="${VENV_DIR:-.venv}"

if [ ! -d "$VENV_DIR" ] && [ -d .venv-ga ]; then
  VENV_DIR=".venv-ga"
fi

if [ ! -x "$CHECK_SCRIPT" ]; then
  echo "ERROR: Missing setup check script: $CHECK_SCRIPT"
  echo "Install the ga-seo-strategy-report skill in $CODEX_HOME_PATH/skills first."
  exit 2
fi

if [ -d "$VENV_DIR" ]; then
  # shellcheck disable=SC1091
  . "$VENV_DIR/bin/activate"
fi

"$CHECK_SCRIPT"
