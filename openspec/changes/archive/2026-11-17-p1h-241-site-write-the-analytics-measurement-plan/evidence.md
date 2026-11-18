# Evidence — p1h-241-site-write-the-analytics-measurement-plan

Written by `machinery controller` from the runner's own acceptance results.
A task is complete when the supervisor's re-run of its acceptance command
passed — not when a worker said so and not when a box was checked. Every
entry names the one commit the runner tested, a2f2bc9f927a69c05675e2489726efc27c44d590. A staging check
carried to the next candidate is `unverified` until it has run.

### write-measurement-plan · passed
**Revision:** a2f2bc9f927a69c05675e2489726efc27c44d590
**Command:** f=docs/runbooks/analytics-measurement-plan.md; test -f "$f" && for h in '## Sources and method' '## What is tracked today' '## Gaps' '## Top five opportunities' '## Proposed KPIs' '## 30-day plan' '## 60-day plan' '## Not checked'; do grep -qxF "$h" "$f" || exit 1; done && grep -qE '^\| 5 \|' "$f" && [ "$(grep -c 'Success metric' "$f")" -ge 4 ] && [ "$(grep -c 'GitHub issues' "$f")" -ge 2 ] && awk '/^## Not checked$/{s=1;next} /^## /{s=0} s && /^- /{n++} END{exit !(n>=3)}' "$f" && grep -q 'components/analytics.tsx:[0-9]' "$f" && grep -q 'app/layout.tsx:[0-9]' "$f" && grep -qE 'scripts/ga-[a-z-]+\.sh:[0-9]' "$f" && ! grep -qE 'G-[A-Z0-9]{8,}' "$f" && grep -oE '((app|components|layouts|lib|scripts|data)/[^ :`)|]+|next\.config\.js|package\.json):[0-9]+' "$f" | sort -u | while IFS=: read -r p l; do [ -f "$p" ] && [ "$(wc -l < "$p")" -ge "$l" ] || exit 1; done && bash scripts/pipeline-check.sh lint
**Result:** the supervisor's re-run of the acceptance command passed
**Covers:** docs/runbooks/analytics-measurement-plan.md
**Limitations:** covers only what the acceptance command asserts

### no-code-change · passed
**Revision:** a2f2bc9f927a69c05675e2489726efc27c44d590
**Command:** git diff --quiet "$(git merge-base HEAD refs/remotes/origin/main)" -- app components layouts lib css data public scripts tests .npmrc contentlayer.config.ts eslint.config.js jsconfig.json next.config.js package.json package-lock.json playwright.config.ts postcss.config.js prettier.config.js tailwind.config.js tsconfig.json vitest.config.ts && [ -z "$(git ls-files --others --exclude-standard -- app components layouts lib css data public scripts tests .npmrc contentlayer.config.ts eslint.config.js jsconfig.json next.config.js package.json package-lock.json playwright.config.ts postcss.config.js prettier.config.js tailwind.config.js tsconfig.json vitest.config.ts)" ] && bash scripts/pipeline-check.sh lint
**Result:** the supervisor's re-run of the acceptance command passed
**Covers:** docs/runbooks/analytics-measurement-plan.md
**Limitations:** covers only what the acceptance command asserts
