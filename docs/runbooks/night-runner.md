# Night Runner Runbook

This runbook configures a strict unattended Codex night run with single-instance protection.
Use Codex Automation as the primary scheduler.

## Files

- Prompt: `docs/runbooks/night-runner-prompt.md`
- Runner: `scripts/night-runner.sh`
- Cron installer: `scripts/install-night-runner-cron.sh`
- Logs directory: `.night-runner-logs/`

## Why overlapping runs do not start

`scripts/night-runner.sh` creates a lock directory (`.night-runner.lock`) at startup.
If the lock already exists, the script exits without starting another run.
This prevents multiple instances from running at the same time on the same machine.

## Recommended scheduler: Codex Automation

Create one automation for this repository/worktree with:

- Name: `Night Runner`
- Schedule: `Daily` at `1:00 AM` local time
- Prompt:

```text
Run: bash ./scripts/night-runner.sh

Then return:
- status (success/failure)
- whether execution ran or skipped due to lock
- log file path
- short failure reason if non-zero exit
```

## One-time setup (runner only)

```bash
chmod +x scripts/night-runner.sh scripts/install-night-runner-cron.sh
```

## Manual run

```bash
./scripts/night-runner.sh
```

## Environment knobs

- `MAX_HOURS_PER_RUN` (default: `4`)
- `NIGHT_RUNNER_PROMPT_FILE` (default: `docs/runbooks/night-runner-prompt.md`)
- `NIGHT_RUNNER_LOG_DIR` (default: `.night-runner-logs`)
- `NIGHT_RUNNER_LOCK_DIR` (default: `.night-runner.lock`)

## Logs

- Per-run log file: `.night-runner-logs/night-runner-<timestamp>.log`

## Optional fallback scheduler: cron

Only use this if Codex Automation is unavailable.

```bash
./scripts/install-night-runner-cron.sh
```

To remove old cron scheduler entries:

```bash
TMP_CRON="$(mktemp)"
crontab -l 2>/dev/null | grep -v '/scripts/night-runner.sh' > "$TMP_CRON" || true
if [ -s "$TMP_CRON" ]; then crontab "$TMP_CRON"; else crontab -r 2>/dev/null || true; fi
rm -f "$TMP_CRON"
```

## Operator notes for handoff

- Prioritize reliability over throughput; backlog quickly when stuck.
- Keep issue changes tightly scoped and reversible.
- Never mark done unless all done-gates pass.
- Always leave evidence and next unblock step in Linear when blocked/backlogged.
