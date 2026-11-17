# Analytics Measurement Plan

This runbook records what the site measures today, what it misses, and what to measure next. It is a
proposal for the developer to accept or edit. Nothing in it is implemented, and no GitHub issue named here
has been filed.

## Sources and method

- References were read at commit `6e70f0f` of this repository. Every `path:line` below is a snapshot of
  that commit and drifts as `main` moves. Refresh a reference when a later change shortens or reorders the
  file.
- No live dashboard, analytics account, provider console or the external Codex skill was read. Everything
  that needs one is listed under [Not checked](#not-checked).
- Ran at that commit: a `git grep` for `gtag('event'`, `sendGAEvent`, `va.track` and `@vercel/analytics`
  outside `docs/` and `openspec/` returned no match. Everything else in this document was read, not run.
- No GA4 documentation was read. Event names below follow GA4's naming rules as the author understands
  them (lowercase snake_case, starts with a letter, at most 40 characters). Checking them against GA4's
  reserved-name list is under Not checked.
- No measurement id, property id, stream id or account name is written here, because the repository is
  public.
- Where a goal can be met with no code (a setting in GA4 admin), this plan prefers that path, because it
  costs no deploy.

## What is tracked today

| Signal | What it does | Evidence |
| --- | --- | --- |
| GA4 script load | Loads gtag.js from Google Tag Manager with `strategy="afterInteractive"`. | `components/analytics.tsx:10-13` |
| GA4 bootstrap | Sends `js` and one `config` call with cookie flags. There is no custom `gtag('event', ...)` call anywhere. | `components/analytics.tsx:19-20` |
| GA4 mount and id | The root layout reads the id from site metadata and renders `<Analytics>` only when the id is set. | `app/layout.tsx:60-61`, `app/layout.tsx:100-102` |
| GA4 id source | The id comes from the `GOOGLE_ANALYTICS_ID` environment variable. If it is unset in a deployment, no GA script loads there. | `data/siteMetadata.js:28` |
| CSP | The Content Security Policy allows Google Tag Manager, Google Analytics and the Vercel scripts host. | `next.config.js:14`, `next.config.js:16`, `next.config.js:17` |
| Vercel Speed Insights | `<SpeedInsights />` renders on every page. `@vercel/speed-insights` is declared at `^1.0.9`. `@vercel/analytics` is not installed. | `app/layout.tsx:4`, `app/layout.tsx:111`, `package.json:35` |
| Newsletter CTA | The form POSTs to `/api/newsletter`. On success it sets the success state and navigates to `/newsletter/success`. | `components/newsletter-cta.tsx:144`, `components/newsletter-cta.tsx:172`, `components/newsletter-cta.tsx:174` |
| Newsletter CTA placement | Rendered on the blog index and in the three post layouts. | `app/blog/page.tsx:170`, `layouts/post-layout.tsx:113`, `layouts/post-simple.tsx:56`, `layouts/post-banner.tsx:54` |
| Newsletter API logs | `logNewsletter` writes structured `[newsletter-api]` logs with `console.error`, `console.warn` and `console.info`. They go to the host's function logs, not to GA. Event names are in `docs/runbooks/newsletter-observability.md` (the Event reference section). | `app/api/newsletter/route.ts:74`, `app/api/newsletter/route.ts:101`, `app/api/newsletter/route.ts:105`, `app/api/newsletter/route.ts:108` |
| Claps | The button reads and writes `/api/claps`. The API has a GET and a POST handler. Totals are kept in Upstash Redis with `incrby`. No report reads them. | `components/clap-button.tsx:76`, `components/clap-button.tsx:156`, `app/api/claps/route.ts:73`, `app/api/claps/route.ts:99`, `lib/claps-store.ts:203-204` |
| Claps placement | Mounted through the engagement rail in the three post layouts. | `layouts/post-layout.tsx:107`, `layouts/post-simple.tsx:50`, `layouts/post-banner.tsx:48` |
| GA readiness check | `ga-seo-check.sh` sources `.env.local` and runs a check script inside an external Codex skill. It exits 2 if the script is missing. | `scripts/ga-seo-check.sh:7-10`, `scripts/ga-seo-check.sh:15`, `scripts/ga-seo-check.sh:22-25` |
| GA SEO report | `ga-seo-report.sh` runs the skill's Python report. The path prefix defaults to `/blog` and the window to 30 days. It exits 2 without the skill or a virtualenv. Output goes to `output/`, which `.gitignore` ignores. | `scripts/ga-seo-report.sh:15`, `scripts/ga-seo-report.sh:23-26`, `scripts/ga-seo-report.sh:29-35`, `scripts/ga-seo-report.sh:48-49`, `scripts/ga-seo-report.sh:52-53` |
| Weekly snapshot | `ga-weekly-dashboard.sh` builds a dated output directory, sets a 7-day window and calls `ga-seo-report.sh`. It is exposed as `npm run agent:ga:weekly`. | `scripts/ga-weekly-dashboard.sh:7-8`, `scripts/ga-weekly-dashboard.sh:12`, `scripts/ga-weekly-dashboard.sh:14`, `package.json:20` |
| Health check | The GA readiness check runs only when a GA env variable is present, and is skipped otherwise. | `scripts/agent-health-check.sh:61-67` |

The weekly KPI table in `docs/runbooks/weekly-content-measurement.md` (lines 19-25) is the only existing
statement of what to look at. It reads from the report above.

## Gaps

Each gap traces to a row above.

1. **Only `config` is sent, and there are no custom events.** Nothing a visitor does after landing (sign-up,
   clap, outbound click) is recorded. See `components/analytics.tsx:20`.
2. **Client-side navigation page views rest on an unchecked GA4 setting.** This is an App Router site and
   the bootstrap sends only the initial `config`, so later page views depend on the property's
   history-change setting (`components/analytics.tsx:20`, `app/layout.tsx:100-102`). Not checked.
3. **A newsletter sign-up is visible only as a `/newsletter/success` page view.** The client navigates
   there after success (`components/newsletter-cta.tsx:174`), and no event or key event marks it.
4. **Newsletter failures exist only in server logs.** They are written by `app/api/newsletter/route.ts:101`
   and `:105`, and no report or GA event carries them.
5. **Claps never reach a report.** Totals sit in Redis (`lib/claps-store.ts:203-204`) and no script reads
   them. There is no GA event for a clap (`components/clap-button.tsx:156`).
6. **Reports cover `/blog` paths only.** The prefix defaults to `/blog` (`scripts/ga-seo-report.sh:48`), so
   `/`, `/about` and `/newsletter/success` are outside it.
7. **The report logic lives outside the repository.** Both scripts call into an external Codex skill and
   exit 2 without it (`scripts/ga-seo-check.sh:22-25`, `scripts/ga-seo-report.sh:23-26`). They cannot run
   from a clean clone.
8. **Speed Insights data is in no report.** The component is rendered (`app/layout.tsx:111`), and no script
   or runbook reads its data.
9. **The GA id depends on an environment variable.** Whether GA loads in production and in preview is a
   deployment setting (`data/siteMetadata.js:28`). Not checked.

## Top five opportunities

Ranked by expected impact first, then by lower effort. Impact is High, Medium or Low. Effort is S, M or L.

| Rank | Opportunity | Expected impact | Effort | Success metric |
| --- | --- | --- | --- | --- |
| 1 | Mark the `/newsletter/success` page view as a key event in GA4 admin. No code, no deploy. | High | S | The key event's count over 30 days, read in GA4, is within 10% of the newsletter provider's new-subscriber count for the same 30 days. |
| 2 | Confirm in GA4 admin that history-change page views are on, and write the result in this runbook. No code. | High | S | A navigation from `/` to `/blog` by link produces two page views in GA4 DebugView in one test session, recorded once in the pull request. |
| 3 | Send `newsletter_subscribe` and `newsletter_subscribe_error` events from the newsletter CTA. | High | M | Over 30 days after release, the `newsletter_subscribe` count in GA4 is within 10% of the provider's new-subscriber count, and the error event count is within 10% of `newsletter.post.failed` log lines for the same 30 days. |
| 4 | Send a `post_clap` event from the clap button. | Medium | S | Over 7 days, the sum of `post_clap` events is within 10% of the increase in Redis clap totals for the same 7 days. |
| 5 | Make the weekly GA4 report run from a clean clone and cover more than `/blog`. | Medium | L | `npm run agent:ga:weekly` exits 0 with GA env set and no external skill directory present, and its `summary.md` lists `/`, `/blog` and `/newsletter/success`. |

Rationale, one line each:

1. Opportunity 1 turns an existing page view into a conversion count with no deploy, so it ranks first.
2. Opportunity 2 decides whether every page view after the first is counted at all, and it costs a setting check.
3. Opportunity 3 adds the failure side and the sign-up count that does not depend on a landing page; it needs
   code, so it follows the two no-code items.
4. Opportunity 4 is small, but claps are a secondary signal next to sign-ups.
5. Opportunity 5 is valuable for the weekly cadence, and it is the largest piece of work.

Speed Insights reporting (gap 8) is Low impact for now and is handled as a process outcome in the 60-day
plan, not as one of the five.

## Proposed KPIs

At most five. Event names are proposed and follow the conventions in Sources and method. As an option for
the instrumentation issue to decide, GA4's own recommended event names (for example `sign_up`) could replace
`newsletter_subscribe`; the author could not read Google's current list, so that is not chosen here.

| KPI | Definition | Source | Event names | Success metric |
| --- | --- | --- | --- | --- |
| Newsletter sign-ups | Count of completed sign-ups per week. Carries over from "New subscriber starts" in `docs/runbooks/weekly-content-measurement.md`. | GA4 key event now, then the event. Cross-checked against the provider. | `newsletter_subscribe` | Weekly count within 10% of the provider's new-subscribers for the same week, for 4 weeks in a row. |
| Newsletter error rate | `newsletter_subscribe_error` divided by sign-up attempts, per week. New. | GA4 event and the `[newsletter-api]` logs | `newsletter_subscribe_error` | Reported every week, with the GA count within 10% of the `newsletter.post.failed` log count, for 4 weeks. |
| Organic blog sessions | Organic search sessions to `/blog` paths per week. Carries over unchanged. | `output/ga-weekly/<date>/summary.md` | none | The weekly report produces the number in 4 of 4 weeks. |
| Engaged sessions per post | Engaged sessions divided by posts viewed, per week. Carries over unchanged. | `output/ga-weekly/<date>/raw.json` | none | The weekly report produces the number for the top 10 posts in 4 of 4 weeks. |
| Claps per post | `post_clap` count per post per week. New. | GA4 event, cross-checked against Redis | `post_clap` | Weekly sum within 10% of the Redis total increase, for 4 weeks. |

"Top post CTR trend" and "Top topic clusters" in the weekly runbook stay there as editorial inputs. They are
not proposed as KPIs here, to keep the set at five.

## 30-day plan

Proposed outcomes. The issue titles are proposed, not filed. The two no-code outcomes come first because
they cost no deploy.

| Outcome | Success metric | GitHub issues |
| --- | --- | --- |
| Sign-ups are countable in GA4 with no deploy. | Key event count over 30 days within 10% of the provider's new-subscriber count (GA4 and provider console, 30-day window). | Proposed: `chore: mark /newsletter/success as a GA4 key event` |
| Client-side page views are confirmed or fixed. | Two page views for a `/` to `/blog` link navigation in GA4 DebugView, in one session, written into this runbook. | Proposed: `chore: verify GA4 history-change page views and record the result` |
| The newsletter CTA reports sign-ups and failures to GA4. | `newsletter_subscribe` count within 10% of the provider's new-subscriber count, and `newsletter_subscribe_error` within 10% of `newsletter.post.failed` logs, over the 30 days after release. | Proposed: `feat: add a typed gtag event helper`; `feat: send newsletter_subscribe from the newsletter CTA`; `feat: send newsletter_subscribe_error from the newsletter CTA`; `chore: check proposed event names against GA4's reserved-name list` |
| The measured baseline is written down. | One dated weekly note holds the sign-up count, error rate and organic sessions, taken from GA4 and the provider, within the first 30 days. | Proposed: `chore: record the first measurement baseline in the weekly note` |

## 60-day plan

| Outcome | Success metric | GitHub issues |
| --- | --- | --- |
| Claps are visible in GA4. | Sum of `post_clap` over 7 days within 10% of the increase in Redis clap totals for the same 7 days. | Proposed: `feat: send post_clap from the clap button` |
| The weekly report runs without the external skill and covers the whole site. | `npm run agent:ga:weekly` exits 0 from a clean clone with GA env set and no skill directory, and `summary.md` lists `/`, `/blog` and `/newsletter/success`. | Proposed: `feat: bring the GA4 report logic into scripts/`; `chore: let GA4_PATH_PREFIX take several prefixes`; `chore: update the weekly measurement runbook to the new report` |
| Speed Insights is read every week. | The weekly note records LCP, INP and CLS at p75 for the home page, the blog index and one post, in 4 of 4 weeks (Speed Insights dashboard, 4-week window). | Proposed: `chore: add Speed Insights p75 to the weekly measurement checklist` |
| The KPI set is reviewed against 8 weeks of data. | A short review note states, for each of the five KPIs, whether it was produced in at least 7 of 8 weeks, and which KPIs are kept, changed or dropped. | Proposed: `chore: review the measurement KPIs after 8 weeks` |

## Not checked

Everything below needs a live dashboard, account or file outside the repository. None of it was read.

- Whether `GOOGLE_ANALYTICS_ID` is set in production and in preview deployments.
- GA4 enhanced-measurement settings, including history-change page views, outbound clicks and scroll.
- Which key events are already configured in GA4, and the property's data-retention setting.
- Whether Speed Insights is enabled on the hosting project, and what it currently shows.
- The newsletter provider's subscriber counts, which opportunity 1 and 3 compare against.
- The clap totals in Redis, which opportunity 4 compares against.
- The contents of the external Codex report skill (`ga-seo-strategy-report`), and which GA4 queries it makes.
- Search Console data, and whether it is linked to the GA4 property.
- Whether the proposed event names clash with GA4's reserved-name list or its limits on custom events.
- Which GitHub issue this plan closes, if any. The intake names none.
