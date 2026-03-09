#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNNER_SCRIPT="$ROOT_DIR/scripts/night-runner.sh"
LOG_DIR="$ROOT_DIR/.night-runner-logs"

if [ ! -x "$RUNNER_SCRIPT" ]; then
  echo "install-night-runner-cron: runner script missing or not executable: $RUNNER_SCRIPT"
  exit 2
fi

mkdir -p "$LOG_DIR"

DRY_RUN=0
SCHEDULE="0 1 * * *"

if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
  shift
fi

if [ $# -gt 0 ]; then
  SCHEDULE="$1"
fi

CRON_CMD="cd $ROOT_DIR && $RUNNER_SCRIPT >> $LOG_DIR/cron.log 2>&1"
CRON_LINE="$SCHEDULE $CRON_CMD"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "install-night-runner-cron: dry run"
  echo "schedule: $SCHEDULE"
  echo "command:  $CRON_CMD"
  exit 0
fi

TMP_CRON="$(mktemp)"
crontab -l 2>/dev/null | grep -v "$RUNNER_SCRIPT" >"$TMP_CRON" || true
printf "%s\n" "$CRON_LINE" >>"$TMP_CRON"
crontab "$TMP_CRON"
rm -f "$TMP_CRON"

echo "install-night-runner-cron: installed"
echo "schedule: $SCHEDULE"
echo "command:  $CRON_CMD"
