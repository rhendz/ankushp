# Design

## Context

See proposal.md (Why) and investigation.md (Affected behavior) for the facts the document reports. The
deliverable is one markdown file, `docs/runbooks/analytics-measurement-plan.md`. No check in the repo
reads `docs/`: lint covers `app components lib layouts scripts`, and vitest covers `components/`, `lib/`
and `app/`. So the two success criteria in the intake (`test -f` and lint) would pass for an empty file.
The decisions below make acceptance actually test the document.

**Routes and visitors:** no route changes, and a visitor sees nothing different. Neither `next build` nor
contentlayer reads `docs/`. On the pull request the developer reads the file itself. There is no page to
look at on the preview.

**Dependencies:** none added, removed or moved a major version. `package.json` and `package-lock.json`
do not change.

**Actions checks:** the change depends on none of typecheck, `npm run build` or the Playwright smoke.
They still run on the pull request and should stay green, since nothing they read changes.

## Goals / Non-Goals

- Goal: a document a developer can act on. Every claim about today carries a `path:line` that resolves.
  Every proposal carries a measurable success metric. Every dashboard-dependent fact is marked not checked.
- Non-goal: deciding the KPIs for the developer. The document proposes them, and the developer accepts
  or edits them in review.
- Non-goal: any identifier from a live account. No GA measurement id, property id, stream id, project id
  or account name goes in the document. The repository is public.

## Decisions

### D1. A fixed section outline

The document uses exactly these H2 headings, in this order, written byte-for-byte as shown so acceptance
can find them:

1. `## Sources and method`: the commit the references were read at (state the short sha). It says that
   line numbers are a snapshot of that commit, and that no live dashboard or account was read.
2. `## What is tracked today`: one row or bullet per signal, each with `path:line`. Cover: the GA4
   bootstrap (`components/analytics.tsx`), its mount and env gate (`app/layout.tsx`,
   `data/siteMetadata.js`), the CSP (`next.config.js`), Speed Insights (`app/layout.tsx`), newsletter
   sign-up (the CTA, `/newsletter/success`, and the API's structured logs), claps (button, API, Redis
   store), and the reporting scripts (`scripts/ga-seo-check.sh`, `scripts/ga-seo-report.sh`,
   `scripts/ga-weekly-dashboard.sh`, and the GA step in `scripts/agent-health-check.sh`). The evidence
   is in investigation.md, Affected behavior.
3. `## Gaps`: at least these, each traced to a line above:
   - only `config` is sent, and there are no custom events;
   - client-side navigation page views rest on an unchecked GA4 setting;
   - a newsletter sign-up is visible only as a `/newsletter/success` page view;
   - newsletter failures exist only in server logs;
   - claps never reach a report;
   - reports cover `/blog` paths only;
   - the report logic lives outside the repo;
   - Speed Insights data is in no report.
4. `## Top five opportunities`: a table with columns `Rank | Opportunity | Expected impact | Effort |
   Success metric`. There are exactly five rows, ranked 1 to 5. Impact is High, Medium or Low. Effort is
   S, M or L. The rule is impact first, then lower effort. One sentence of rationale per row may follow
   the table.
5. `## Proposed KPIs`: a table with columns `KPI | Definition | Source | Event names | Success metric`
   and at most five rows. Each KPI that carries over from `docs/runbooks/weekly-content-measurement.md`
   (lines 19-25) says so, so the two runbooks agree.
6. `## 30-day plan` and 7. `## 60-day plan`: each is a table with columns `Outcome | Success metric |
   GitHub issues`. The GitHub issues cell lists proposed titles in the repo's form (`feat: ...`,
   `chore: ...`). They are marked as proposed, not filed.
8. `## Not checked`: a bullet list of at least three items. It includes at least: whether
   `GOOGLE_ANALYTICS_ID` is set in production and in preview; GA4 enhanced-measurement and key-event
   configuration; Speed Insights enablement on the hosting project; the newsletter provider's subscriber
   counts; the clap totals in Redis; and the contents of the external Codex report skill.

Alternatives weighed:
- Free-form prose. Rejected: nothing could check it, and the intake asks for specific parts.
- One combined plan table. Rejected: impact/effort ranking and time-boxed outcomes answer different
  questions, and a combined table hides missing success metrics.

### D2. Acceptance that tests the document, not just its existence

Task `write-measurement-plan` is accepted by one shell line, run from the repo root with no network. It
checks, in order:

- the file exists;
- each D1 heading is present as a whole line;
- a rank-5 row (`| 5 |`) exists;
- `Success metric` appears at least 4 times (the opportunities, KPI, 30-day and 60-day tables);
- `GitHub issues` appears at least twice;
- `## Not checked` has at least three bullets;
- it cites `components/analytics.tsx:<n>`, `app/layout.tsx:<n>` and a `scripts/ga-*.sh:<n>`;
- no GA4-style measurement id (`G-` followed by 8 or more capitals or digits) appears;
- every cited `path:line` under `app/`, `components/`, `layouts/`, `lib/`, `scripts/`, `data/`,
  `next.config.js` or `package.json` names a file that exists and has at least that many lines;
- `bash scripts/pipeline-check.sh lint` passes.

Task `no-code-change` checks that no source, config or package path differs from the merge base with
`origin/main` (`git diff --quiet "$(git merge-base HEAD refs/remotes/origin/main)" -- ...`) and that lint
passes.

The exact commands are in `contract.json`. They are plain POSIX tools plus the repo's lint wrapper.

Alternatives weighed:
- The intake's two criteria alone (`test -f` and lint). Rejected as the sole acceptance because they
  cannot fail for a stub file. They are kept as the first and last checks.
- A vitest test under `tests/` or `lib/` that parses the markdown. Rejected: it adds a code file, which
  the intake puts out of scope ("any code change"). vitest's include globs (`vitest.config.ts:16-20`)
  would also need `tests/` added, and the test would lock a runbook's prose layout into the unit suite.
- A checker script under `scripts/`. Rejected for the same reason: a new source file, outside the one
  path the intake writes.

Limits: the checks prove structure, the presence of metrics, and that references resolve. They do not
prove a reference points at the right line, or that a ranking is sensible. The reviewer and the developer
judge those by reading.

### D3. Event names and success metrics: conventions only, not instrumentation

- Proposed custom event names are lowercase snake_case, at most 40 characters, and start with a letter.
  Candidates the author may use: `newsletter_subscribe`, `newsletter_subscribe_error`, `post_clap`,
  `outbound_click`, `search_open`. The document says these follow GA4's naming rules as the author
  understands them, and lists "event names checked against GA4's reserved-name list" under Not checked.
  No GA4 documentation was read in this session.
- The document must say whether a goal can be met with no code at all, for example by marking the
  `/newsletter/success` page view as a key event in GA4 admin. It must prefer that path where one exists,
  because it costs no deploy.
- Every success metric has a quantity, a source and a window. Examples: "a `newsletter_subscribe` count
  within 10% of the provider's new-subscriber count over 30 days", "the weekly report runs from a clean
  clone with no external skill".

Alternatives weighed: adopting GA4 "recommended event" names (for example `sign_up` or `generate_lead`).
I did not choose this, because I could not read Google's current list here to confirm the names and
parameters. The document may name them as an option for the instrumentation issue to decide.

### D4. Proposed issues stay proposed

The 30- and 60-day tables list issue titles. They do not file issues. Filing is outward-facing and
follows the developer accepting the plan (see investigation.md, Alternatives).

## Risks / Trade-offs

- Line references drift as main moves, so a later merge of main can make a cited line stale. Mitigation:
  D1 records the commit read at. D2 checks only that a line exists, so a merge of main that shortens a
  file fails acceptance loudly rather than silently, and the fix is to refresh the reference.
- Shell bugs in the D2 command. Mitigation: during planning, the same checks were run from a scratch
  script against sample documents outside the repo:
  - a well-formed sample passed;
  - a sample citing `components/analytics.tsx:999` failed with `unresolved`;
  - a sample missing `## Gaps` failed with `missing heading`;
  - a sample containing a `G-` id failed.

  `bash scripts/pipeline-check.sh lint` passed at the base. The diff half of `no-code-change` (run as
  `git diff --stat` against the merge base) is empty at the base. The full one-line commands, as written
  in `contract.json`, were not executed verbatim, because the planning sandbox refused compound shell
  lines. The supervisor runs them.
- A public document could leak an id. Mitigation: the D2 grep for `G-` ids, plus the Goal above. Property
  ids are bare numbers and cannot be grepped reliably. The author must not include them, and review
  checks this by reading.
- The weekly runbook and this plan could disagree on KPIs. Mitigation: D1 item 5 requires the overlap to
  be stated.

## Migration Plan

None. The change adds a document, and rollback is reverting the commit.
