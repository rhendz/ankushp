#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  scripts/worktree-env.sh prepare
  scripts/worktree-env.sh link <worktree-path>
  scripts/worktree-env.sh link-self
  scripts/worktree-env.sh status [worktree-path]

Commands:
  prepare  Ensure shared dependencies exist in the main repo.
  link     Symlink shared node_modules and .env.local into a worktree.
  link-self
           Symlink shared node_modules and .env.local into the current worktree.
  status   Show current shared-environment status.
EOF
}

ensure_worktree_path() {
  local worktree_path="$1"
  if [[ ! -e "$worktree_path/.git" ]]; then
    echo "error: '$worktree_path' does not look like a git worktree."
    exit 1
  fi
}

prepare_shared_env() {
  cd "$ROOT_DIR"
  if [[ ! -d node_modules ]]; then
    echo "node_modules not found in main repo. Installing with npm ci..."
    npm ci
  else
    echo "node_modules already exists in main repo."
  fi

  if [[ -f .env.local ]]; then
    echo ".env.local found in main repo."
  else
    echo "warning: .env.local not found in main repo."
    echo "         Worktrees will still work, but env values must be added later."
  fi
}

get_main_worktree_path() {
  git worktree list --porcelain | awk '/^worktree /{print $2; exit}'
}

link_shared_env() {
  local worktree_path="$1"
  ensure_worktree_path "$worktree_path"

  if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
    echo "error: shared node_modules missing. Run 'scripts/worktree-env.sh prepare' first."
    exit 1
  fi

  if [[ -e "$worktree_path/node_modules" && ! -L "$worktree_path/node_modules" ]]; then
    echo "error: '$worktree_path/node_modules' exists and is not a symlink."
    echo "       Remove it manually, then rerun this command."
    exit 1
  fi

  ln -sfn "$ROOT_DIR/node_modules" "$worktree_path/node_modules"
  echo "linked: $worktree_path/node_modules -> $ROOT_DIR/node_modules"

  if [[ -f "$ROOT_DIR/.env.local" ]]; then
    if [[ -e "$worktree_path/.env.local" && ! -L "$worktree_path/.env.local" ]]; then
      echo "warning: '$worktree_path/.env.local' exists and is not a symlink. Skipping env link."
    else
      ln -sfn "$ROOT_DIR/.env.local" "$worktree_path/.env.local"
      echo "linked: $worktree_path/.env.local -> $ROOT_DIR/.env.local"
    fi
  fi
}

link_current_worktree_env() {
  local current_worktree_path
  local main_worktree_path
  current_worktree_path="$(git rev-parse --show-toplevel)"
  main_worktree_path="$(get_main_worktree_path)"

  if [[ -z "$main_worktree_path" || ! -d "$main_worktree_path" ]]; then
    echo "error: unable to determine main worktree path."
    exit 1
  fi

  ROOT_DIR="$main_worktree_path"
  if [[ "$current_worktree_path" == "$main_worktree_path" ]]; then
    echo "info: current directory is the main worktree."
    prepare_shared_env
    return
  fi

  # Ensure shared dependencies exist in the main worktree before linking.
  prepare_shared_env
  link_shared_env "$current_worktree_path"
}

show_status() {
  local worktree_path="${1:-$ROOT_DIR}"
  echo "main repo: $ROOT_DIR"
  if [[ -d "$ROOT_DIR/node_modules" ]]; then
    echo "shared node_modules: present"
  else
    echo "shared node_modules: missing"
  fi

  if [[ -f "$ROOT_DIR/.env.local" ]]; then
    echo "shared .env.local: present"
  else
    echo "shared .env.local: missing"
  fi

  if [[ -L "$worktree_path/node_modules" ]]; then
    echo "worktree node_modules link: $(readlink "$worktree_path/node_modules")"
  else
    echo "worktree node_modules link: not linked"
  fi

  if [[ -L "$worktree_path/.env.local" ]]; then
    echo "worktree .env.local link: $(readlink "$worktree_path/.env.local")"
  else
    echo "worktree .env.local link: not linked"
  fi
}

cmd="${1:-}"
case "$cmd" in
  prepare)
    prepare_shared_env
    ;;
  link)
    worktree_path="${2:-}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi
    link_shared_env "$worktree_path"
    ;;
  link-self)
    link_current_worktree_env
    ;;
  status)
    show_status "${2:-$ROOT_DIR}"
    ;;
  *)
    usage
    exit 1
    ;;
esac
