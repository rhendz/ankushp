# Plan review — p1h-241-site-write-the-analytics-measurement-plan

**Reviewed revision:** 94bf3da78e78154c
**Reviewed commit:** 890a42ba40a9e81a2b98902ef9145b6aebadca1e
**Reviewed at:** 2026-11-17
**Reviewer:** the Verifier (claude), run cd444a0af283bff9b4e4ef7f
**Verdict:** PASS WITH FINDINGS

Written by the controller from the Verifier's checked reply. The controller decides from that reply, not from this file.

## What was checked

- Read intake.md, investigation.md, proposal.md, .openspec.yaml (skip_specs: true; there is no specs/ directory, so no scenarios need covering and empty `covers` is consistent), design.md, tasks.md and contract.json at 890a42b
- Read CLAUDE.md, .claude/rules/site.md, dispatch/roles/plan-reviewer.md, dispatch/roles/planner.md, openspec/schemas/delivery/schema.yaml and the contract template
- Checked these cited lines against the code: components/analytics.tsx:10-13,15-22,20; app/layout.tsx:4,5,60-61,100-102,111; data/siteMetadata.js:26-30,28; next.config.js:14,16,17; package.json:12,20,35; package-lock.json (@vercel/speed-insights 1.0.9); components/newsletter-cta.tsx:144,172,174; app/api/newsletter/route.ts:74,101,105,108; components/clap-button.tsx:76,156; app/api/claps/route.ts:73,99; lib/claps-store.ts:203-204; layouts/post-layout.tsx:107, post-simple.tsx:50, post-banner.tsx:48; app/blog/page.tsx:10/170; scripts/ga-seo-check.sh, ga-seo-report.sh, ga-weekly-dashboard.sh (all lines cited); scripts/agent-health-check.sh:61-67; .gitignore:12; vitest.config.ts:16-20; docs/runbooks/weekly-content-measurement.md:19-25; newsletter-observability.md:22-27; codex-skills.md:16-17
- Searched the tree outside openspec/ for gtag('event'/sendGAEvent/@vercel/analytics: 0 matches, which confirms the investigation
- Ran `dispatch-plan-check p1h-241-site-write-the-analytics-measurement-plan`: 0 errors, 1 warning (no review recorded yet)
- Ran `git log refs/remotes/origin/main` (tip 6404d70, the parent of the base 02667f7) and `git diff --stat 6404d70 HEAD`: only the 7 plan files changed, so the no-code-change diff is currently empty
- Read through the shell logic of both acceptance commands: `exit 1` inside the for loop and inside the piped while loop both give a non-zero result; the path-extraction regex does not match docs/ or openspec/ citations; the G- id regex does not trip on the `G-XXXXXXX` comment at data/siteMetadata.js:28 (7 characters)
- Privacy: grepped the plan for G- ids and personal identifiers. The only hit is the Linear URL's workspace slug in intake.md:6 (written by dispatch intake). It matches the public GitHub org already in data/siteMetadata.js:13.
- Dependencies: none change, which matches design.md; routes: none change, and design.md says so

## Findings

### F1 · The no-code-change check only lists forbidden paths, and it leaves out paths the plan itself puts out of scope.

**Severity:** minor
**Owner:** planner

contract.json tasks[1].acceptance, tasks.md 2.1 and design.md D2 check only these paths: app components layouts lib css data public scripts tests, plus named root config files. Edits to the following would still pass: docs/runbooks/README.md and docs/runbooks/weekly-content-measurement.md (both named as out of scope in proposal.md 'Out of scope' and contract.json out_of_scope), .github/workflows/*, .husky/, .gitignore, .vscode/, README.md and AGENTS.md. The intake's 'Paths it will write' lists only docs/runbooks/analytics-measurement-plan.md. The worker boundary covers openspec/, dispatch/, .claude/ and CLAUDE.md, but none of the paths above.

**Fix:** Replace the forbidden-path list with an allowed-path list. Check that `git diff --name-only "$(git merge-base HEAD refs/remotes/origin/main)"` plus `git ls-files --others --exclude-standard`, after removing `docs/runbooks/analytics-measurement-plan.md` and `openspec/changes/p1h-241-site-write-the-analytics-measurement-plan/` with `grep -vE`, prints nothing. Then run `bash scripts/pipeline-check.sh lint`.

### F2 · The write-measurement-plan check confirms headers exist, not what the document says, so a half-written plan passes.

**Severity:** minor
**Owner:** planner

In contract.json tasks[0].acceptance: `grep -qE '^\| 5 \|'` passes with a single row instead of the 'exactly five rows, ranked 1 to 5' that design.md D1 item 4 requires. `grep -c 'Success metric' >= 4` and `grep -c 'GitHub issues' >= 2` count only the table headers, so empty success-metric cells and empty issue cells pass. Yet the intake says 'Every proposed item has a measurable success metric'. Nothing checks the 'at most five' KPI rows (D1 item 5), the presence of any `feat:`/`chore:` proposed title (D1 items 6-7), or the six required Not checked items (D1 item 8); the check only counts at least 3 bullets. Short citations like `:174`, which the investigation itself uses, are never checked. D2 'Limits' admits part of this.

**Fix:** Make the awk check stricter for each section. Under '## Top five opportunities', require rows matching `^\| [1-5] \|` to number exactly 5, each with a non-empty last cell. Require at most 5 data rows under '## Proposed KPIs'. Require at least one `(feat|chore|bug): ` in each plan section. Under '## Not checked', grep for `GOOGLE_ANALYTICS_ID`. Require every row of the opportunities, KPI and plan tables to have a non-empty last or Success-metric cell.

### F3 · Three premises are off: one citation points at an import, one gap is overstated, and the reason for rejecting a vitest test is partly wrong.

**Severity:** minor
**Owner:** planner

(a) Investigation 'First-party signals' cites the newsletter CTA as 'rendered from app/blog/page.tsx:10'. Line 10 is the import; the render is app/blog/page.tsx:170. (b) Investigation 'Consequences' and design.md D1 item 3 say 'reports cover /blog paths only'. But scripts/ga-seo-report.sh:48 is `--path-prefix "${GA4_PATH_PREFIX:-/blog}"`, and docs/runbooks/codex-skills.md:21 and weekly-content-measurement.md:13 document overriding it. So /blog is only the default. (c) The investigation's Alternatives and design.md D2 say a vitest test would need vitest's include globs widened. vitest.config.ts:18 already includes `lib/**/*.test.{ts,tsx}`, so that is true only for tests/. The rejection still holds on the 'no code change' ground. Every other cited file:line checked out (see checked).

**Fix:** Cite app/blog/page.tsx:170 for the render. Reword the gap as 'reports default to /blog (GA4_PATH_PREFIX overrides; whether the external skill handles a site-wide prefix is not checked)'. Drop the include-globs argument or limit it to tests/.

### F4 · The acceptance commands are compound shell lines, not the planner rule's `bash scripts/pipeline-check.sh test|lint`; this is justified but never named as an exception.

**Severity:** minor
**Owner:** planner

dispatch/roles/planner.md:29-31 allows only `bash scripts/pipeline-check.sh test`, `lint`, or one test file as a task's acceptance. Both contract.json tasks use multi-command grep/awk/git lines that end in `bash scripts/pipeline-check.sh lint`. The delivery schema (openspec/schemas/delivery/schema.yaml:331-332) allows any command the supervisor can re-run with no network. The intake's own success criterion `test -f ...` is not a pipeline-check command either. No pipeline-check command reads docs/ (package.json:12, vitest.config.ts:16-20), so a lint-only acceptance could not fail for a stub. The deviation is justified, but design.md D2 never names it as an exception to the planner rule. The plan also says (design.md Risks) that the full one-line commands were never run as written.

**Fix:** Add a sentence to design.md D2 naming this as an exception to dispatch/roles/planner.md:29-31 and why it is needed: the intake's `test -f` criterion, and no pipeline-check command reads docs/. Record the first verbatim run of both commands in evidence.md.

## Not checked

- I did not execute either acceptance command verbatim, or `bash scripts/pipeline-check.sh lint`: this reviewer's Bash is limited to git and dispatch-plan-check, and the plan says it never ran them verbatim either
- The Linear issue body beyond what intake.md captures, and which GitHub issue, if any, this change closes
- The external Codex skill (ga-seo-strategy-report): what it queries, and whether it supports a site-wide path prefix
- GA4 enhanced-measurement and history-change settings, whether GOOGLE_ANALYTICS_ID is set in production or preview, whether Speed Insights is enabled, newsletter provider counts, and Upstash clap totals: these need live dashboards
- Whether the proposed event names (design.md D3) conflict with GA4's reserved names: I had no network access to Google's documentation
- Whether the dispatch supervisor runs the acceptance string with sh or bash, and with which shell options (for example pipefail or errexit)
- docs/decisions.md: the plan cites no decision-log entry, so I did not open it
