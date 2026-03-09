#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ "${1:-}" = "--help" ]; then
  cat <<'EOF'
Usage: scripts/night-runner.sh [--dry-run]

Options:
  --dry-run   Print resolved configuration and exit without running Codex.
  --help      Show this message.

Environment:
  MAX_HOURS_PER_RUN        Default: 4
  NIGHT_RUNNER_PROMPT_FILE Default: docs/runbooks/night-runner-prompt.md
  NIGHT_RUNNER_LOG_DIR     Default: .night-runner-logs
  NIGHT_RUNNER_LOCK_DIR    Default: .night-runner.lock
EOF
  exit 0
fi

PROMPT_FILE="${NIGHT_RUNNER_PROMPT_FILE:-$ROOT_DIR/docs/runbooks/night-runner-prompt.md}"
LOG_DIR="${NIGHT_RUNNER_LOG_DIR:-$ROOT_DIR/.night-runner-logs}"
LOCK_DIR="${NIGHT_RUNNER_LOCK_DIR:-$ROOT_DIR/.night-runner.lock}"
MAX_HOURS_PER_RUN="${MAX_HOURS_PER_RUN:-4}"
DRY_RUN=0

if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
fi

mkdir -p "$LOG_DIR"

cleanup() {
  rm -rf "$LOCK_DIR"
}

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "night-runner: another run is active (lock: $LOCK_DIR). Skipping."
  exit 0
fi

trap cleanup EXIT INT TERM

if [ ! -f "$PROMPT_FILE" ]; then
  echo "night-runner: prompt file not found: $PROMPT_FILE"
  exit 2
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "night-runner: codex CLI is not installed or not on PATH."
  exit 2
fi

START_TS="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/night-runner-$START_TS.log"
MAX_SECONDS="$((MAX_HOURS_PER_RUN * 3600))"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "night-runner: dry run"
  echo "cwd=$ROOT_DIR"
  echo "prompt=$PROMPT_FILE"
  echo "log_file=$LOG_FILE"
  echo "max_hours=$MAX_HOURS_PER_RUN"
  exit 0
fi

{
  echo "night-runner: start=$START_TS cwd=$ROOT_DIR prompt=$PROMPT_FILE max_hours=$MAX_HOURS_PER_RUN"

  # Use perl timeout for macOS portability (GNU timeout is not always available).
  perl -e 'alarm shift; exec @ARGV' "$MAX_SECONDS" \
    codex exec \
    --cd "$ROOT_DIR" \
    --dangerously-bypass-approvals-and-sandbox \
    - <"$PROMPT_FILE"

  echo "night-runner: completed successfully"
} >>"$LOG_FILE" 2>&1

echo "night-runner: log written to $LOG_FILE"
