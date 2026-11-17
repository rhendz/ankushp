#!/usr/bin/env bash
# Run one npm script the way the dispatch pipeline does:  scripts/pipeline-check.sh <test|lint|...> [-- args]
#
# A job's worktree has no node_modules. This links it from a store keyed by package-lock.json
# (PIPELINE_DEPS, default ~/.local/share/ankushp/deps), so every worktree on the same lockfile
# shares one install and a check needs no network. When the lockfile is new, it installs once:
# into the store when the store is writable, else into the worktree itself. It deletes nothing
# but its own symlink.
set -euo pipefail
cd "$(dirname "$0")/.."

script=${1:?usage: scripts/pipeline-check.sh <npm script> [-- args]}
shift
store=${PIPELINE_DEPS:-$HOME/.local/share/ankushp/deps}
lock=$(sha256sum package-lock.json | cut -c1-16)
slot=$store/$lock

# npm ci replaces node_modules itself; the marker is written last, so a failed install is never used.
install() {
  (cd "$1" && HUSKY=0 npm ci --ignore-scripts --no-audit --no-fund && echo "$lock" > node_modules/.pipeline-lock)
}

current=""
if [ -f node_modules/.pipeline-lock ]; then current=$(cat node_modules/.pipeline-lock); fi

if [ "$current" != "$lock" ]; then
  if [ -L node_modules ]; then rm node_modules; fi
  if [ ! -f "$slot/node_modules/.pipeline-lock" ] && mkdir -p "$slot" 2>/dev/null && [ -w "$slot" ]; then
    cp package.json package-lock.json .npmrc "$slot/"
    install "$slot" >&2 || true
  fi
  if [ -f "$slot/node_modules/.pipeline-lock" ] && [ ! -e node_modules ]; then
    ln -s "$slot/node_modules" node_modules
  elif ! install . >&2; then
    echo "pipeline-check: no install matches package-lock.json ($lock), and npm ci failed (no network here?)." >&2
    echo "Run this script once outside the sandbox to fill $slot." >&2
    exit 2
  fi
fi

exec npm run --silent "$script" "$@"
