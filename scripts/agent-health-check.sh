#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CODEX_HOME_PATH="${CODEX_HOME:-$HOME/.codex}"
SKILLS_DIR="$CODEX_HOME_PATH/skills"
VALIDATOR="$SKILLS_DIR/.system/skill-creator/scripts/quick_validate.py"

if [ ! -d "$SKILLS_DIR" ]; then
  echo "ERROR: Skills directory not found: $SKILLS_DIR"
  exit 2
fi

if [ ! -f "$VALIDATOR" ]; then
  echo "ERROR: Missing validator: $VALIDATOR"
  exit 2
fi

echo "== Skill metadata validation =="
while IFS= read -r -d '' skill_dir; do
  skill_name="$(basename "$skill_dir")"
  if [ "$skill_name" = ".system" ]; then
    continue
  fi
  echo "-- $skill_name"
  python3 "$VALIDATOR" "$skill_dir"
done < <(find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)

echo
echo "== Skill script syntax checks =="
py_scripts=()
while IFS= read -r -d '' f; do py_scripts+=("$f"); done < <(find "$SKILLS_DIR" -type f -name '*.py' -path '*/scripts/*' -print0 | sort -z)
sh_scripts=()
while IFS= read -r -d '' f; do sh_scripts+=("$f"); done < <(find "$SKILLS_DIR" -type f -name '*.sh' -path '*/scripts/*' -print0 | sort -z)

if [ "${#py_scripts[@]}" -gt 0 ]; then
  python3 -m py_compile "${py_scripts[@]}"
  echo "python syntax: ok (${#py_scripts[@]} file(s))"
fi

if [ "${#sh_scripts[@]}" -gt 0 ]; then
  bash -n "${sh_scripts[@]}"
  echo "shell syntax: ok (${#sh_scripts[@]} file(s))"
fi

echo
echo "== Skill smoke checks =="
if [ -f "$SKILLS_DIR/upskill/scripts/analyze_usage.py" ]; then
  python3 "$SKILLS_DIR/upskill/scripts/analyze_usage.py" \
    --hours 12 \
    --codex-home "$CODEX_HOME_PATH" \
    --skills-dir "$SKILLS_DIR" \
    --top 5 >/dev/null
  echo "upskill smoke check: ok"
else
  echo "WARN: upskill analyzer not found; skipping smoke check"
fi

# GA check is optional because it requires local credentials and env.
if [ -n "${GA4_PROPERTY_ID:-}" ] || [ -n "${GA4_SERVICE_ACCOUNT_FILE:-}" ] || [ -n "${GA4_SERVICE_ACCOUNT_JSON_B64:-}" ] || [ -n "${GA4_ACCESS_TOKEN:-}" ]; then
  echo "ga-seo check: running with detected GA env"
  ./scripts/ga-seo-check.sh
else
  echo "ga-seo check: skipped (no GA env configured)"
fi

echo
echo "== Automation TOML checks =="
python3 - <<'PY'
import glob
import os
import re
import sys
import tomllib

codex_home = os.environ.get("CODEX_HOME", os.path.expanduser("~/.codex"))
automations_dir = os.path.join(codex_home, "automations")
paths = sorted(glob.glob(os.path.join(automations_dir, "*", "automation.toml")))

hourly = re.compile(r"^FREQ=HOURLY;INTERVAL=\d+(;BYDAY=[A-Z,]+)?$")
weekly = re.compile(r"^FREQ=WEEKLY;BYDAY=[A-Z,]+;BYHOUR=\d{1,2};BYMINUTE=\d{1,2}$")
errs = []
upskill_present = False

print(f"automation files: {len(paths)}")
for p in paths:
    with open(p, "rb") as f:
        data = tomllib.load(f)
    name = str(data.get("name", os.path.basename(os.path.dirname(p))))
    rule = str(data.get("rrule", ""))
    cwd_field = data.get("cwd")
    cwds_field = data.get("cwds")
    if isinstance(cwd_field, str):
        cwd_values = [cwd_field]
    elif isinstance(cwds_field, list):
        cwd_values = [str(v) for v in cwds_field]
    elif isinstance(cwds_field, str):
        cwd_values = [cwds_field]
    else:
        cwd_values = []
    rule_ok = bool(hourly.match(rule) or weekly.match(rule))
    cwd_ok = bool(cwd_values) and all(os.path.exists(c) for c in cwd_values)
    print(f"- {name}: rrule_ok={rule_ok} cwd_ok={cwd_ok}")
    if "upskill" in name.lower() or "upskill" in str(data.get("prompt", "")).lower():
        upskill_present = True
    if not rule_ok:
        errs.append(f"Unsupported rrule in {p}: {rule}")
    if not cwd_ok:
        errs.append(f"Missing/invalid cwd in {p}: {cwd_values}")

if not upskill_present:
    print("WARN: no automation currently references upskill")

if errs:
    for e in errs:
        print(f"ERROR: {e}")
    sys.exit(1)
PY

echo
echo "Agent health check completed."
