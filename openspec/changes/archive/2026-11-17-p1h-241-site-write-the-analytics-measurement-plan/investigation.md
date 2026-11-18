# Investigation

## Objective

The developer wants one written document in the repository's runbooks that gives the site an analytics
measurement plan. The plan has to show what the site measures now and in which file and line. It has to
name what is missing, rank the five most useful opportunities by expected impact and effort, propose a
small set of KPIs and any event names they need, and set out proposed outcomes for 30 and 60 days, each
split into the GitHub issues it would become. Every proposed item needs a measurable success metric.
Anything that can only be settled by looking at a live analytics dashboard has to be listed as not checked.

This is a writing task. Nothing on the site is instrumented or changed, and no live account is read. I am
not widening it: the GitHub issues stay proposed titles in the document and are not filed (see
Alternatives).

## Upstream

- Linear issue P1H-241, as captured in
  `openspec/changes/p1h-241-site-write-the-analytics-measurement-plan/intake.md` (objective, success
  criteria, out of scope, the one path it writes).
- `AGENTS.md`: the tracking model (Linear holds outcomes, GitHub Issues hold implementation work, and one
  Linear ticket may map to many GitHub Issues), plus the `feat|bug|chore:` title form the proposed issues
  should use.
- `docs/runbooks/README.md`: the runbook index.
- `docs/runbooks/weekly-content-measurement.md`: the existing weekly KPI table (lines 19-25). The new plan
  has to reconcile with it, not duplicate it.
- `docs/runbooks/codex-skills.md`: how the GA reporting scripts are set up locally (env names at lines
  16-17).
- `docs/runbooks/newsletter-observability.md`: the newsletter API's structured log events (lines 22-27).
- The code paths listed under Affected behavior.
- `openspec/specs/` is empty, so there is no existing capability to modify.

## Affected behavior

No site behaviour changes. These are the facts the document has to report. All were **read** at commit
`02667f7` unless marked as run.

**Client-side analytics (GA4 via gtag.js)**
- `components/analytics.tsx:10-13` loads `https://www.googletagmanager.com/gtag/js?id=<id>` with
  `next/script`, `strategy="afterInteractive"`.
- `components/analytics.tsx:15-22` is the inline bootstrap. `components/analytics.tsx:20` calls
  `gtag('config', id, {cookie_flags: 'SameSite=None;Secure'})` and nothing more. There is no custom
  `gtag('event', ...)` call anywhere in the tracked tree. **Ran:**
  `git grep -n "gtag('event'\|gtag(\"event\"\|sendGAEvent" -- .` returned 0 matches.
- `app/layout.tsx:5` imports the component. `app/layout.tsx:60-61` reads the id from
  `siteMetadata.analytics.googleAnalytics.googleAnalyticsId`. `app/layout.tsx:100-102` renders
  `<Analytics>` only when that id is truthy.
- `data/siteMetadata.js:26-30` is the analytics block. `data/siteMetadata.js:28` takes the id from
  `process.env.GOOGLE_ANALYTICS_ID`. If that variable is unset in a deployment, no GA script loads there.
  Whether it is set in production or preview is a deployment setting, so it is **not checked**.
- `next.config.js:14`, `:16` and `:17` allow `*.googletagmanager.com` and `*.google-analytics.com` in
  the CSP (script, img and connect). `next.config.js:14` also allows `va.vercel-scripts.com`.
- This is an App Router site, and the bootstrap sends only the initial `config`. Page views after
  client-side navigation therefore depend on GA4's history-change setting in the property's admin. That
  is **not checked**.

**Vercel Speed Insights**
- `app/layout.tsx:4` imports `SpeedInsights` from `@vercel/speed-insights/next`, and
  `app/layout.tsx:111` renders it on every page. `package.json:35` declares `^1.0.9`, and
  `package-lock.json` locks 1.0.9. **Ran:** a read of `package-lock.json` with node.
  `@vercel/analytics` is not installed (absent from the lockfile).

**First-party signals that do not reach analytics**
- Newsletter: `components/newsletter-cta.tsx:144` POSTs to `/api/newsletter`. On success,
  `components/newsletter-cta.tsx:172` sets the success state and `:174` navigates to
  `/newsletter/success` (`app/newsletter/success/page.tsx`). The only analytics trace of a sign-up is
  therefore a page view of `/newsletter/success`.
- `app/api/newsletter/route.ts:74` (`logNewsletter`) writes structured logs through
  `console.error/warn/info` at `:101`, `:105` and `:108`, prefixed `[newsletter-api]`. The event names
  are documented in `docs/runbooks/newsletter-observability.md:22-27`. These go to the host's function
  logs, not to GA.
- The newsletter CTA is rendered from `app/blog/page.tsx:10` and from the three post layouts.
- Claps: `components/clap-button.tsx:76` reads and `:156` writes `/api/claps` (`app/api/claps/route.ts:73`
  GET, `:99` POST). Totals are kept in Upstash Redis (`lib/claps-store.ts:203-204`, `incrby`). No report
  reads them. The button is mounted through the engagement rail at `layouts/post-layout.tsx:107`,
  `layouts/post-simple.tsx:50` and `layouts/post-banner.tsx:48`.

**Reporting scripts**
- `scripts/ga-seo-check.sh:7-12` sources `.env.local`. `:15` points at a check script inside an external
  Codex skill (`$CODEX_HOME/skills/ga-seo-strategy-report/...`), outside this repository. `:22-26` exits
  2 if that script is missing.
- `scripts/ga-seo-report.sh:15` points at the skill's Python report. `:23-27` and `:29-36` exit 2 without
  the skill or a virtualenv. `:47-53` runs it with `--path-prefix` defaulting to `/blog` (`:48`) and a
  30-day window (`:49-50`), writing to `output/` (`:52-53`). `.gitignore:12` ignores `/output/`.
- `scripts/ga-weekly-dashboard.sh:7-8` builds a dated output dir. `:12` sets a 7-day window. `:14` calls
  `ga-seo-report.sh`. It is exposed as `npm run agent:ga:weekly` (`package.json:20`).
- `scripts/agent-health-check.sh:61-67` runs the GA readiness check only when GA env variables are
  present, and otherwise skips it.
- Consequences: the in-repo reports cover `/blog`-prefixed paths only, not `/`, `/about` or
  `/newsletter/success`. They cannot run from a clean clone, because the report logic lives in the
  external skill. Speed Insights and claps data appear in no report.

**Checks that apply to this change** (read)
- `npm run lint` is `eslint app components lib layouts scripts` (`package.json`, `scripts.lint`), so it
  never reads `docs/`. `vitest.config.ts:16-20` includes only `components/`, `lib/` and `app/` tests.
  Neither check can tell a good measurement plan from a bad one or a missing one. See design.md D2 for how
  acceptance makes up for that.
- `next build` and contentlayer do not read `docs/`, so the typecheck, build and Playwright smoke jobs in
  Actions are unaffected.

## Existing uses

Nothing is removed. Section not applicable.

## Alternatives

- **Reading the request as "instrument the gaps".** Rejected. The intake puts all instrumentation and code
  changes out of scope. The document proposes; later issues implement.
- **Reading "the GitHub issues each would break into" as filing them now.** Rejected. Filing is an
  outward-facing action outside the one path the intake lets this change write, and the issues should
  follow the developer's review of the plan. The document lists proposed issue titles in the repo's
  `feat|chore|bug:` form.
- **Folding the plan into `docs/runbooks/weekly-content-measurement.md`.** Rejected. The intake names a
  new file. The new document references the weekly runbook and says which of its KPIs carry over.
- **Also linking the new runbook from `docs/runbooks/README.md`.** Rejected for this change because it is
  a second path the intake does not list. It is a one-line follow-up the developer can ask for.
- **A vitest test that asserts the document's structure.** Rejected. It would add a code file under
  `tests/` or `lib/`, against "any code change" being out of scope, and vitest's include globs would need
  a new path. See design.md D2.

## Uncertainties

- **Needs the developer:** which GitHub issue this change closes. The intake names none, and the Linear
  issue body is not readable from here. The pull request body needs `Closes #<n>` (AGENTS.md), or a
  statement that no GitHub issue exists. This does not change the plan.
- **Needs a measurement (dashboard, not checked here):** whether `GOOGLE_ANALYTICS_ID` is set in
  production and preview; GA4 enhanced-measurement settings (history-change page views, outbound clicks,
  scroll); key events already configured; data retention; whether Speed Insights is enabled on the hosting
  project; newsletter provider subscriber counts; Upstash clap totals; Search Console. The document lists
  all of these under Not checked.
- **Not read:** the external Codex skill's report script, which lives outside the repository. What it
  queries from GA4 is not checked.

## Recommendation

Question: what is the smallest change that delivers the issue? Write the single runbook
`docs/runbooks/analytics-measurement-plan.md` to the fixed section outline in design.md D1. Accept it
with a check that the sections are present, that every cited `path:line` resolves in the tree, that no
measurement id is pasted in, and that lint passes. Add a guard that no source or package path changed.

## Conclusion

Open. Closes when the runbook merges.
