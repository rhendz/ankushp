# Plan review — p1h-239-site-close-out-the-homepage-3d

**Reviewed revision:** 90eed3d7aea93783
**Reviewed commit:** 07fae82f9e89b6770d54d864b6a4919bd4f49ead
**Reviewed at:** 2026-11-17
**Reviewer:** the Verifier (claude), run 588860d1322c3bafdc283263
**Verdict:** PASS WITH FINDINGS

Written by the controller from the Verifier's checked reply. The controller decides from that reply, not from this file.

## What was checked

- Read CLAUDE.md, .claude/rules/site.md, and intake.md, investigation.md, proposal.md, specs/homepage-3d-dependency-guard/spec.md, design.md, tasks.md, contract.json and decisions.md in the change folder. authorization.md and evidence.md appear in the directory listing but cannot be read (Read: file does not exist); `git show --stat 07fae82` confirms they are not part of the plan commit.
- Checked the premises against the code: package.json lines 12, 43, 48-49, 60, 70 and its overrides block; the package-lock.json entries for three 0.183.2 (no dependencies or peers), @types/three 0.183.1, react and react-dom 19.2.4, next 16.3.4 and @types/node 26.4.1; next.config.js:67; app/page.tsx:1 and :9; app/api/og/route.tsx:1; components/home/home-3d-scene-shell.tsx:8-11 and :15-17; home-3d-error-boundary.tsx:18-31 (console.error at :23); home-3d-scene.tsx:3-4, :210, :221-242, :340, :368-375; home-3d-fallback.tsx (hero-visual-shape); tests/smoke/blog.smoke.spec.ts:4-15 (pageerror only); scripts/home-visual-health-check.mjs:7-11, :18-21, :26-34, :40-43, :61-65 (no ReactCurrentOwner signature, never fails because the fallback is showing); playwright-smoke.yml triggers; home-visual-health.yml cron 13:00 UTC; the required-checks.yml test job; vitest.config.ts include; tsconfig.json include; eslint.config.js; docs/specs/next16-migration/blockers.md:6.
- Ran `git show --stat 93b079c` and `git log -1` for 119cf72 and 391a02a: the commit subjects and the 530-line lockfile cut match. `grep -c @react-three package-lock.json` printed 0. `git grep react-three` outside openspec/changes finds nothing.
- Ran `git merge-base HEAD refs/remotes/origin/main`: 6404d70, which matches the investigation, and origin/main resolves in this worktree.
- Ran `bash scripts/pipeline-check.sh test` offline: 8 files and 25 tests pass, exit 0.
- Ran `bash scripts/pipeline-check.sh test -- lib/dependency-guard.test.ts` before the file exists: 'No test files found', exit 1, so task 1.1's acceptance fails when the task is not done.
- Scope: the plan writes only the two paths the intake lists, and changes no dependency, route or scene. contract.json's covers reaches all four scenarios. The Existing uses section is present (nothing removed).
- Privacy: searched the plan commit for emails, tokens and secrets and found nothing private.

## Findings

### F1 · Deliverable 1 is graded 'Met by this document', a self-certifying verdict outside the plan's own verdict vocabulary

**Severity:** minor
**Owner:** planner

design.md D4 table row 1 says 'Met by this document', but D4 limits verdict lines to 'Met | Partly met | Not met'. investigation.md 'Grading this suggests' item 1 has the same wording. intake.md Objective asks whether each deliverable 'is met by the code on main today'. investigation.md line 101 itself finds no dependency matrix in docs/ on main.

**Fix:** Have the document grade deliverable 1 against main as it stood before this change (Not met: no matrix recorded), then present the matrix and its compatibility source (three 0.183.2 declares no dependencies or peers) as what this document adds. Let the developer decide whether that closes it. Align the D4 table wording with the three allowed verdicts.

### F2 · The scenarios' 'the guard fails and its message names X' clause is never exercised

**Severity:** minor
**Owner:** planner

spec.md scenarios 2-3 say 'THEN the guard fails and its message names <pkg>'. design.md D3 tests only the detector's return value against fixtures (groups 1-2). The guard assertion and its message (group 3, D2) run only against the real, clean package.json. A guard written as expect(found.length).toBe(0) with no message would still pass tasks.md 1.1 and contract task dependency-guard-test.

**Fix:** In D3 and task 1.1, move the guard assertion into a function (for example assertNoReactThree(manifest)). Add a case that expects it to throw on the @react-three/fiber fixture with a message containing '@react-three/fiber'. The real-manifest case then calls the same function.

### F3 · The check that nothing else changed is incomplete and ignores untracked files

**Severity:** minor
**Owner:** planner

In contract.json, the closeout-doc acceptance runs `git diff --quiet $(git merge-base HEAD refs/remotes/origin/main) -- package.json package-lock.json app components layouts css data public scripts tests .github next.config.js`. That list leaves out other lib/ files, vitest.config.ts, eslint.config.js, tsconfig.json, and the contract's own out_of_scope paths (dispatch/, .claude/, CLAUDE.md, AGENTS.md, openspec/ outside this change). `git diff <commit> -- paths` also does not report untracked new files.

**Fix:** Replace it with a check that compares to the merge base, as the current command already does. It should require that `git diff --name-only <merge-base> HEAD` plus `git ls-files --others --exclude-standard` lists only lib/dependency-guard.test.ts, docs/specs/next16-migration/homepage-3d-closeout.md and openspec/changes/p1h-239-site-close-out-the-homepage-3d/. Put it on full-checks or the top-level acceptance so it covers the whole change.

## Not checked

- Whether vitest 3's module runner defines __dirname in a test file here. A probe in $TMPDIR was denied; the design records a process.cwd() fallback.
- bash scripts/pipeline-check.sh lint was not run.
- Typecheck, build and the Playwright smoke were not run; they run only in GitHub Actions.
- GitHub issue 97 was not read directly. Its deliverables were taken from decisions.md R1 as supplied.
- The closeout-doc acceptance command was not run, because the document does not exist yet. Its grep and git logic was checked by reading.
- Whether the homepage renders without runtime exceptions in a browser, or whether the smoke run's Chromium gets WebGL. Nothing was rendered.
