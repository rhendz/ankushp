# Plan review — p1h-240-site-record-the-next-js-16

**Reviewed revision:** 048898d17471b575
**Reviewed commit:** ae0f83697248c3854d65f93ad7ce8eb0a9713088
**Reviewed at:** 2026-11-17
**Reviewer:** the Verifier (claude), run 371dd5f3db92e27326e7dcd4
**Verdict:** BLOCK

Written by the controller from the Verifier's checked reply. The controller decides from that reply, not from this file.

## What was checked

- Read intake.md, investigation.md, proposal.md, design.md, tasks.md, contract.json and .openspec.yaml. There is no specs/ directory: skip_specs is true, the change is docs-only, and every covers list is empty. That is consistent: there are no scenarios to cover.
- Read CLAUDE.md, .claude/rules/site.md, machinery.toml and scripts/pipeline-check.sh.
- package.json:43 (next ^16.3.4) and :48-49 (react and react-dom ^19.2.0); :6-11 use --webpack; :12 is the eslint CLI; :89-91 run Prettier on md through lint-staged. All confirmed.
- package-lock.json resolves next to 16.3.4 at line 16270, and react and react-dom to 19.2.4 at lines 17526 and 17535. Confirmed.
- The three async-params routes type params as a Promise and await it at the cited lines: [...slug] 73,75,160,162; tags/[tag] 13,52(54); posts/page/[page] 13,50(52). Confirmed. generateStaticParams is at [...slug]:151. OG_API_KEY throws at [...slug]:60-61.
- Grep for 'force-dynamic' and 'export const dynamic' over the tree: the only hits are blockers.md:14,20 and this change's files; there are none under app/. app/about/page.tsx:1-20 has no segment config.
- tests/smoke/blog.smoke.spec.ts visits / (10), /blog (18,36,74), /blog/posts (25) with click-through (29-32), and the named post (84). None visits /about, /blog/tags/[tag] or /blog/posts/page/[page]. The post's mdx file exists in data/blog/.
- playwright.config.ts:29-34: the webServer is npm run dev. playwright-smoke.yml:3-7 runs on PRs and pushes to main; the job id is smoke. required-checks.yml:21 sets OG_API_KEY; the build job is at 94-124.
- docs/perf/homepage-desktop-baseline-issue-70.md: method :9-20; FCP and LCP medians at :26-27 are 331.7 and 1170.7; the 20% #69 targets are at :50-52. R3's arithmetic is right: 1170.7 x 1.2 = 1404.8 and 331.7 x 1.2 = 398.0.
- readiness.md:28-31, :56-59 and :79-81, and blockers.md:5-22, match the plan's citations.
- vitest.config.ts:16-20 includes only components/, lib/ and app/. Confirmed, so lint and test cannot see docs/.
- Task 1's grep: the row-id pattern does not let V1 match V10, and allows padding from Prettier's table alignment. Task 2 measures from git merge-base HEAD refs/remotes/origin/main, not from a fixed commit.
- Scope: only validation.md is written. Removals: nothing is removed, and investigation.md has an Existing uses section. No dependency change. No visible change, and the plan correctly names no route. Privacy: no email, secrets or private details in the plan files. The Linear URL and the rhendz org are already public in machinery.toml and the intake.
- Authority: the rollback numbers are presented as proposed, and adoption is held as not met in V11, so the plan rules on nothing.

## Findings

### F1 · Task 1's acceptance cannot catch the error the plan most needs to prevent: a not-run or not-met row written as 'met'.

**Severity:** material
**Owner:** planner

In contract.json:29, task write-validation-checklist only greps for the seven headings, the row ids, '60a7a1f', '/about', 'npx -y lighthouse' and the literal 'not run'. The 'not run' match is already satisfied by the D1 Status legend alone. Nothing checks the Status column. tasks.md:12 says 'Never mark V7 to V9 or V11 to V13 as met', and .claude/rules/site.md:8 says 'A check that did not run is not a pass'. Yet a file with a V7 row whose status is 'met' passes. So does a file with empty sections under the headings, including one with no 'Proposed, not adopted' note and no R1-R4. This contradicts design.md:6-7 and D4, which claim the acceptance can tell a correct document from a missing or partial one.

**Fix:** Extend task 1's acceptance in contract.json, and say so in tasks.md 1.1. (a) Fail if any of rows V7-V13 has status 'met': a negated grep -E on the row id followed by a 'met' Status cell. (b) Require V4 to have status 'met'. (c) Require V12 and V13 to have status 'not run'. (d) Grep for 'Proposed, not adopted' and for R1, R2, R3 and R4. (e) Grep for the two D2 subsection headings, 'Homepage (/)' and 'Blog post page'.

### F2 · Task 2's no-change check leaves out several configuration and docs paths that the plan says are out of scope.

**Severity:** minor
**Owner:** planner

contract.json:15 puts 'other configuration' out of scope, and investigation.md:157 says 'Touch no other file'. The git diff pathspec in contract.json:37 omits tsconfig.json, tailwind.config.js, playwright.config.ts, vitest.config.ts, eslint.config.js and every other file under docs/. All of these exist in the worktree (Glob).

**Fix:** Assert the whole diff instead: every path in git diff --name-only from the merge base, plus every untracked path, is either docs/specs/next16-migration/validation.md or under openspec/changes/p1h-240-site-record-the-next-js-16/.

### F3 · V7 claims to show that /about and the post pages are statically prerendered, but its evidence, the build job passing, cannot show that.

**Severity:** minor
**Owner:** planner

design.md:61 gives row V7 as 'npm run build passes, including static prerender of /about and post pages', with the green Required Checks / build job as its evidence. The build job (required-checks.yml:94-124) only fails on errors. With force-dynamic gone, a route that silently opts into dynamic rendering would still build green. The only evidence of static rendering is the route table in the build log.

**Fix:** In D2, make V7's evidence the route table in the build job's log, with the developer confirming that /about and /blog/posts/[...slug] appear as static or SSG and not as dynamic. Or split the row into 'build passes' and 'routes prerender statically'.

### F4 · V5 and V6 ask the worker to record the commit of its own check run, which is circular for a file in that same commit.

**Severity:** minor
**Owner:** planner

design.md:59-60 say 'the worker's own run, with date and commit'. The worker runs lint and test before committing validation.md, so the commit that contains the file cannot be named inside it.

**Fix:** Say that V5 and V6 cite the merge-base commit the document describes, which is HEAD before the worker's commit, plus the date of the run.

## Not checked

- I could not verify any git-history claim because Bash was denied in this session: the commits 13558b9 and 60a7a1f found by git log -S, the merge order of 81ce7af (#92) after #94, the merge base 6404d70, the ancestry of the baseline commit 7a3a6bf, and whether any .eslintrc file is tracked.
- I did not run either acceptance command or bash scripts/pipeline-check.sh lint and test, so the investigation's claim that lint exited 0 is unverified.
- I did not check that refs/remotes/origin/main resolves in the build worker's worktree.
- I did not open .github/workflows/home-visual-health.yml or eslint.config.js beyond confirming they exist.
- I did not check whether Prettier, run from lint-staged on commit, rewrites any literal the task 1 greps rely on, other than table padding.
