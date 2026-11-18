# Evidence — p1h-239-site-close-out-the-homepage-3d

Written by `machinery controller` from the runner's own acceptance results.
A task is complete when the supervisor's re-run of its acceptance command
passed — not when a worker said so and not when a box was checked. Every
entry names the one commit the runner tested, cc755c58bb4c562db308a3959415af360205985a. A staging check
carried to the next candidate is `unverified` until it has run.

### dependency-guard-test · passed
**Revision:** cc755c58bb4c562db308a3959415af360205985a
**Command:** bash scripts/pipeline-check.sh test -- lib/dependency-guard.test.ts && bash scripts/pipeline-check.sh lint
**Result:** the supervisor's re-run of the acceptance command passed
**Covers:** lib/dependency-guard.test.ts
**Limitations:** covers only what the acceptance command asserts

### closeout-doc · passed
**Revision:** cc755c58bb4c562db308a3959415af360205985a
**Command:** f=docs/specs/next16-migration/homepage-3d-closeout.md; test -f "$f" && test "$(grep -c '^## Deliverable [1-4]' "$f")" -eq 4 && test "$(grep -c '^\*\*Verdict:\*\* ' "$f")" -ge 4 && grep -q '^## Still missing' "$f" && grep -q '^## Not verified' "$f" && git diff --quiet "$(git merge-base HEAD refs/remotes/origin/main)" -- package.json package-lock.json app components layouts css data public scripts tests .github next.config.js
**Result:** the supervisor's re-run of the acceptance command passed
**Covers:** docs/specs/next16-migration/homepage-3d-closeout.md
**Limitations:** covers only what the acceptance command asserts

### full-checks · passed
**Revision:** cc755c58bb4c562db308a3959415af360205985a
**Command:** bash scripts/pipeline-check.sh test && bash scripts/pipeline-check.sh lint
**Result:** the supervisor's re-run of the acceptance command passed
**Covers:** lib/dependency-guard.test.ts, docs/specs/next16-migration/homepage-3d-closeout.md
**Limitations:** covers only what the acceptance command asserts
