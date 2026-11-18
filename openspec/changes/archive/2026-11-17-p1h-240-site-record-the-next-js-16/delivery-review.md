# Delivery review — p1h-240-site-record-the-next-js-16

**Reviewed revision:** b9ce6e2eed8c99f3
**Reviewed commit:** 2f9b2fa2fb7a3548419a095db720268782d7eaea
**Reviewed at:** 2026-11-17
**Reviewer:** the Verifier (claude), run 1b4e69601b4d31e952e555dc
**Verdict:** PASS

Written by the controller from the Verifier's checked reply. The controller decides from that reply, not from this file.

## What was checked

- Verdict: pass. The branch adds only the planned validation.md and its OpenSpec files, the facts it cites hold at merge base 6404d70, and lint and test pass. The PR's typecheck, build and Playwright smoke, and the build route table that V7 depends on, are not checked yet.
- git diff --stat origin/main...HEAD: 12 files changed. They are docs/specs/next16-migration/validation.md plus files under openspec/changes/p1h-240-site-record-the-next-js-16/. No package.json, package-lock.json, app/, .github/, .husky/ or other protected path changed. This matches contract.json scope and design.md D5.
- git diff --stat 2f9b2fa HEAD: the only change after the tested revision is evidence.md (+21 lines), so the revision named in the evidence matches the document on disk.
- validation.md compared against design.md D2: all seven headings and both subsections are present with the exact text. Rows V1-V13 use plain Status cells. V4 is met. V7, V8, V9, V12 and V13 are not run. V10 and V11 are not met. 'Proposed, not adopted' is present, with R1-R4 as bold list items. The 20% thresholds (1404.8 ms LCP, 398.0 ms FCP) are correct arithmetic from the baseline.
- Cited facts traced in the code: no force-dynamic or 'export const dynamic' under app/ (Grep). package.json:7 (dev uses --webpack), :12 (eslint CLI), :43 (next ^16.3.4), :48-49 (react ^19.2.0). params: Promise<> at app/blog/posts/[...slug]/page.tsx:73,160, tags/[tag]/page.tsx:13,52 and posts/page/[page]/page.tsx:13,50. generateStaticParams at [...slug]/page.tsx:151. tests/smoke/blog.smoke.spec.ts lines 10, 18, 25, 29-32 and 84 are as cited, and nothing visits /about, tags or pagination. docs/perf/homepage-desktop-baseline-issue-70.md:16-20 (commands), :26-27 (FCP 331.7, LCP 1170.7 medians), :50-52 (the 20% targets) and :55-56 (the 5% fail rule).
- No secret, token, email or private detail in validation.md. OG_API_KEY=local-placeholder is a documented dummy value.
- No new vitest cases were needed. The change is documentation only, and design.md D4 explicitly rules out a vitest parser because it would write outside the approved path.
- Ran bash scripts/pipeline-check.sh lint: exit 0. Ran bash scripts/pipeline-check.sh test: 8 files and 25 tests passed. This matches the V5 and V6 claims.
- Evidence limitations ('covers only what the acceptance command asserts') are honest. The acceptance checks structure and literals, not the truth of each cited line, so I checked the citations above by hand. No entry is marked unverified.

## Findings

None.

## Not checked

- Routes a visitor would see change: none. The change touches only docs/ and openspec/, which are not deployed, so the preview has no route to check.
- GitHub Actions checks the PR still has to pass: Required Checks / typecheck, Required Checks / build and Playwright Smoke / smoke. For V7, the developer must read the build log's route table and confirm /about shows ○ (Static) and /blog/posts/[...slug] shows ● (SSG).
- package-lock.json line numbers 16270, 17526 and 17535 cited in V1 (versions not re-read from the lockfile).
- git log -S'force-dynamic' history for commits 13558b9 and 60a7a1f (git log was not run; Bash was limited to a few commands).
- readiness.md and blockers.md line citations (readiness.md:28-31, 58, 59, 79-81; blockers.md:7-9).
- playwright.config.ts:30 webServer command and required-checks.yml build job contents.
- The Lighthouse commands in the performance section were not executed (no browser available here).
- How any page looks: that is left to the developer's look at the preview.
