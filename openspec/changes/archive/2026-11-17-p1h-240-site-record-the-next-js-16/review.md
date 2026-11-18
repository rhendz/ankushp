# Plan review — p1h-240-site-record-the-next-js-16

**Reviewed revision:** b9ce6e2eed8c99f3
**Reviewed commit:** de740db93e287622c2c32510433adf22d95001ae
**Reviewed at:** 2026-11-17
**Reviewer:** the Verifier (claude), run f05c40679bed149eb2b95663
**Verdict:** PASS WITH FINDINGS

Written by the controller from the Verifier's checked reply. The controller decides from that reply, not from this file.

## What was checked

- Read in order: intake.md, investigation.md, proposal.md, design.md, tasks.md, contract.json and .openspec.yaml, plus the earlier review.md (revision 048898d17471b575). There is no specs/ directory. skip_specs is true, and every covers list is empty, which is consistent for a docs-only change with no scenarios.
- Read CLAUDE.md, .claude/rules/site.md, machinery.toml [boundary] and scripts/pipeline-check.sh. validation.md is under docs/ and outside boundary.worker, so the lane is workstream, as D5 says.
- package.json: :43 next ^16.3.4; :48-49 react and react-dom ^19.2.0; :6-11 --webpack; :10 serve is next start; :12 is the eslint CLI; :89-91 run Prettier on md through lint-staged. All confirmed.
- Grep over app/: no force-dynamic and no 'export const dynamic'. app/about/page.tsx:1-20 has no segment config. [...slug]/page.tsx: :60-61 throws without OG_API_KEY, :73 and :160 type params as a Promise, :151 has generateStaticParams. tags/[tag]:13,52 and posts/page/[page]:13,50 type params as a Promise. All confirmed.
- node_modules/next/dist/build/utils.js:514-533 holds the legend (Static), (SSG), (Partial Prerender) and (Dynamic). next.config.js does not enable cacheComponents or PPR, so the ○/● symbols V7 expects are right.
- tests/smoke/blog.smoke.spec.ts visits / (:10), /blog (:18,36,74), /blog/posts (:25) with a click-through (:29-32) whose article assertion is at :32, and the named post (:84). It never visits /about, /blog/tags/[tag] or /blog/posts/page/[page]. The post's mdx exists in data/blog/. playwright.config.ts:30 starts the webServer with npm run dev.
- required-checks.yml: OG_API_KEY is set at :21, the build job is at :94-124 and only runs npm run build, and the typecheck job id is typecheck.
- docs/perf/homepage-desktop-baseline-issue-70.md: method at :9-20; medians at :26-27 (FCP 331.7, LCP 1170.7); the 20% margins at :50-52; the 5% rule at :55-56. R3's numbers are right: 1170.7×1.2 = 1404.8 and 331.7×1.2 = 398.0.
- readiness.md:28-31, :56-59 and :79-81, and blockers.md:5-22, match the plan's citations. docs/specs/next16-migration/validation.md does not exist yet.
- vitest.config.ts:16-20 includes only components/, lib/ and app/, so lint and test cannot see docs/. D4's reason for the grep-based acceptance holds.
- Read task 1's acceptance regexes and shell quoting by eye. The V<n> pattern does not match V1 against V10. The negated grep for 'met' does not fire on 'not met'. Inside double quotes, \| and \* stay literal, and \b works in GNU ERE. Each grep tolerates Prettier's table padding.
- Task 2 measures from git merge-base HEAD refs/remotes/origin/main, not a fixed commit, and asserts the whole diff. .gitignore has '/node_modules' with no trailing slash, so the symlink pipeline-check.sh creates is ignored. .controller/ and .workstream/ are ignored too.
- The earlier review's F1-F4 are all addressed: status-cell checks, a whole-diff check, V7's evidence is now the route table, and V5/V6 cite the merge-base commit.
- Scope: only validation.md is written. The force-dynamic premise correction is stated with its evidence. The rollback numbers are marked proposed, and V11 holds adoption as not met, so the plan rules on nothing. Removals: there are none, and an Existing uses section is present. There is no dependency change and no visible change, and no route is named, which is correct. Privacy: the plan files contain no email, secret or private detail.

## Findings

### F1 · Task 1's acceptance still passes a document whose smoke-coverage section, force-dynamic section or post-page spot-check is empty, so the intake's per-route smoke coverage can be left out without the check noticing.

**Severity:** minor
**Owner:** planner

In contract.json:29 (acceptance of write-validation-checklist), the smoke section is checked only by its heading and by one '/about' anywhere in the file. '/about' is already in V7's Item cell (design.md:61), so an empty section passes. In the same way, the force-dynamic section is checked only by '60a7a1f', which V4's evidence also carries (design.md:58). 'npx -y lighthouse' only has to appear once. The post-page URL in design.md:146-147 is never checked. intake.md:14 requires the document to say which critical routes the smoke suite covers.

**Fix:** In contract.json task 1 and tasks.md 1.1, add these checks. (a) grep -F for 'blog.smoke.spec.ts', '/blog/tags/[tag]' and '/blog/posts/page/[page]'. (b) grep -F for the post URL '127.0.0.1:3000/blog/posts/the-missing-layer-in-your-ai-stack-intermediate-knowledge'. (c) Require 'npx -y lighthouse' to appear at least twice, using grep -c. (d) grep for '13558b9' for the force-dynamic section.

## Not checked

- Bash was denied in this session, so I could not verify any git-history claim: the force-dynamic commits 13558b9 and 60a7a1f, #92 (81ce7af) merging after #94, the merge base 6404d70, the baseline commit 7a3a6bf being an ancestor of 13558b9, or that no .eslintrc file is tracked.
- I did not run either acceptance command, or bash scripts/pipeline-check.sh lint and test, so the investigation's claim that lint exited 0 is unverified.
- I did not check how git handles the ':(exclude,glob).*' pathspec on files inside untracked dot-directories, or whether refs/remotes/origin/main resolves in the build worker's worktree.
- I did not check whether Prettier's markdown formatting rewrites any literal the greps depend on, beyond reasoning about table padding, bold and list markers.
- I did not open .github/workflows/playwright-smoke.yml, home-visual-health.yml or eslint.config.js.
