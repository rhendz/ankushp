# Next.js 16 Migration Validation

- **Written:** 2026-11-17
- **Describes:** `main` at merge commit `6404d70` (PR #107), the merge base of the delivery branch. Every
  file and line citation below is read at that commit.
- **Plan:** [readiness.md](./readiness.md) (phase 3, issue #85)
- **Blocker note:** [blockers.md](./blockers.md) (issue #90). Its "Current stabilization state" is
  stale; see the `force-dynamic` section below.

Sign-off needs every row of the checklist to be `met`. Today V7 to V9, V12 and V13 are `not run`, and
V10 and V11 are `not met`, so the migration is **not signed off**. V4 being `met` does not mean the
migration is finished.

## Status legend

- `met`: the evidence is in the repository or was produced by a check run on the PC, and the row cites it.
- `not met`: the evidence shows the item is not true today.
- `not run`: the evidence needs something the PC does not have, either a GitHub Actions job or a
  browser. The row names that job or command. It is not a failure; nobody observed one.

## Sign-off checklist

| # | Item | Status | Evidence |
|---|---|---|---|
| V1 | Next.js 16 and React 19 resolved on main | met | `package.json:43` `next ^16.3.4`, `:48-49` `react` and `react-dom` `^19.2.0`; `package-lock.json` resolves `next` 16.3.4 (line 16270) and `react`/`react-dom` 19.2.4 (lines 17526, 17535). |
| V2 | Async request API applied to the three codemod routes | met | `params: Promise<…>` in `app/blog/posts/[...slug]/page.tsx:73,160`, `app/blog/tags/[tag]/page.tsx:13,52` and `app/blog/posts/page/[page]/page.tsx:13,50`. These are the three routes `readiness.md:28-31` lists. |
| V3 | Lint runs through the ESLint CLI with a flat config | met | `package.json:12` is `eslint app components lib layouts scripts`; `eslint.config.js` is tracked; no `.eslintrc*` is tracked. |
| V4 | No route carries the temporary force-dynamic fallback | met | `git grep -e force-dynamic -e 'export const dynamic' 6404d70 -- app` matches nothing. Removed by `60a7a1f` (#94). `blockers.md` "Current stabilization state" is stale; see the force-dynamic section. |
| V5 | `bash scripts/pipeline-check.sh lint` passes | met | Run on the PC on 2026-11-17 against `6404d70` plus this branch's plan-only commits (no site file differs from `6404d70`): exit 0. |
| V6 | `bash scripts/pipeline-check.sh test` passes | met | Run on the PC on 2026-11-17 against `6404d70` plus this branch's plan-only commits: exit 0, 8 test files and 25 tests passed. `vitest.config.ts:16-20` collects only `components/`, `lib/` and `app/`. |
| V7 | `npm run build` passes and prerenders `/about` and post pages statically | not run | The route table in the log of GitHub Actions `Required Checks / build` on the PR. The developer confirms that `/about` is marked `○ (Static)` and `/blog/posts/[...slug]` is marked `● (SSG)`, and that neither is marked `ƒ (Dynamic)`. A green job alone does not show this, because the job (`required-checks.yml`, job `build`) fails only on errors. |
| V8 | Typecheck passes | not run | GitHub Actions `Required Checks / typecheck` on the PR. |
| V9 | Playwright smoke passes | not run | GitHub Actions `Playwright Smoke / smoke` on the PR. It runs against the dev server; see the smoke section. |
| V10 | Smoke suite covers every critical route | not met | `/about`, `/blog/tags/[tag]` and `/blog/posts/page/[page]` are not visited by `tests/smoke/blog.smoke.spec.ts`; the suite runs on `next dev`, not the production build. |
| V11 | Rollback triggers agreed by the developer | not met | Proposed in the rollback section below; nobody has adopted them. |
| V12 | Performance spot-check, `/` | not run | Commands in the performance section below; needs a browser. |
| V13 | Performance spot-check, one blog post page | not run | Commands in the performance section below; needs a browser. |

V5 and V6 cite the merge-base commit, not the commit that holds this file, because the checks ran
before the file was committed. V7 to V9 are never written as `met` by the PC run: the developer reads
them off the PR's Actions run.

V7 asks for the route table, not the job result. `next build` prints a legend of `○ (Static)`,
`● (SSG)` and `ƒ (Dynamic)`. `/about` has no `generateStaticParams`, so static shows as `○`. The post
route exports `generateStaticParams` (`app/blog/posts/[...slug]/page.tsx:151`), so static shows as
`●`. A route that silently became dynamic would still build green.

## Smoke coverage of critical routes

Critical routes are those the migration's own documents name: `/` and one post page
(`readiness.md:58`), `/about` and `/blog/posts/[...slug]` (`blockers.md:7-9`), the three async-params
routes (`readiness.md:28-31`), and `/blog`, the blog landing page.

| Route | Covered | Test |
|---|---|---|
| `/` | yes | `tests/smoke/blog.smoke.spec.ts:10` |
| `/blog` | yes | `tests/smoke/blog.smoke.spec.ts:18` (also `:36`, `:74`) |
| `/blog/posts` | yes | `tests/smoke/blog.smoke.spec.ts:25` |
| `/blog/posts/[...slug]` | yes | `tests/smoke/blog.smoke.spec.ts:29-32` (click-through, asserts `main article`) and `:84` (a fixed post) |
| `/about` | **no** | no smoke test visits it, although `blockers.md:8` names it |
| `/blog/tags/[tag]` | **no** | not visited |
| `/blog/posts/page/[page]` | **no** | not visited |

The smoke web server is `npm run dev` (`playwright.config.ts:30`), which is `next dev --webpack`
(`package.json:7`). A green smoke run therefore does not exercise the production prerender that
blocker #90 was about. Only the route table in the `build` job's log shows that (V7). Adding `/about`
smoke coverage is separate work and is not done here.

## force-dynamic fallback

- `git log -S'force-dynamic' -- app` lists two commits. `13558b9` (Next.js 16 baseline) added
  `export const dynamic = "force-dynamic"` to `app/about/page.tsx` and
  `app/blog/posts/[...slug]/page.tsx`. `60a7a1f` (#94, "upgrade pliny and contentlayer stack for
  next16") removed it from both.
- No file under `app/` matches `force-dynamic` or `export const dynamic` at `6404d70`.
  `app/about/page.tsx` has no route segment config, and the post route exports
  `generateStaticParams` (`app/blog/posts/[...slug]/page.tsx:151`), so both are meant to prerender.
- `blockers.md` is therefore stale: its "Current stabilization state" ("Temporary fallback remains in
  place") describes the tree before #94, and its follow-up step 2 (remove the flags) is already done
  in code. Its step 3 (build) and step 4 (smoke-check `/about`) are still open; they are V7 and V10.
  Correcting `blockers.md` is a follow-up and is not done here.
- What the repository cannot show: whether `npm run build` prerenders those routes cleanly today.
  That is V7.

## Rollback triggers (proposed)

**Proposed, not adopted.** Nothing in the repository records a rollback threshold for this migration;
`readiness.md:59` asks for one and `readiness.md:79-81` gives only the mechanism (revert the migration
commits). The triggers below are a proposal for the developer to change or adopt. Merging this
document does not adopt them, and V11 stays `not met` until the developer does.

- **R1, checks:** a required check (`lint`, `typecheck`, `build`, `test`) or the Playwright smoke fails
  on `main`, and the failure traces to the migration. Act by reverting the migration commits, as
  `readiness.md:79-81` says.
- **R2, routes:** `/about` or a `/blog/posts/[...slug]` page returns a 5xx in production or renders
  without its article. These are the blocker's routes (`blockers.md:7-9`); the article is what the
  smoke asserts (`tests/smoke/blog.smoke.spec.ts:32`).
- **R3, homepage performance:** the median of three Lighthouse desktop runs on `/` exceeds the
  pre-migration issue-70 baseline by more than 20%: LCP above 1404.8 ms (baseline 1170.7) or FCP above
  398.0 ms (baseline 331.7), per `docs/perf/homepage-desktop-baseline-issue-70.md:26-27`. 20% is the
  margin that document already used for the #69 targets, and a 5% trigger would fire on noise: its
  runs spread from 212 to 599 ms FCP. Caveat: `/` has changed since that baseline, so a breach has to
  be attributed to the migration before anyone reverts.
- **R4, post-page performance:** no baseline exists for any blog post page. The first V13 run becomes
  the baseline, and no numeric trigger applies until then.

## Performance spot-checks

Both checks are **not run**: they need a browser, which the PC pipeline does not have. The method is
the one in `docs/perf/homepage-desktop-baseline-issue-70.md:9-20` (production build, `next start`,
three desktop Lighthouse runs, median). Do not commit the Lighthouse output.

Record the median FCP, LCP and Speed Index of the three runs and compare them against R3.

### Homepage (/)

**Not run.** Compare against R3.

```bash
export OG_API_KEY=local-placeholder   # any non-empty value; the post route throws if it is unset
npm run build
npm run serve -- --port 3000          # leave running; use a second terminal for the runs
mkdir -p /tmp/next16-validation
for n in 1 2 3; do
  npx -y lighthouse http://127.0.0.1:3000/ --preset=desktop --output=json \
    --output-path=/tmp/next16-validation/home-run-$n.json --quiet \
    --chrome-flags='--headless=new --no-sandbox'
done
```

### Blog post page

**Not run.** No baseline exists; the first run becomes the baseline (R4). The build and server are the
same as for the homepage; start them as above if they are not already running.

```bash
export OG_API_KEY=local-placeholder
npm run build
npm run serve -- --port 3000          # leave running; use a second terminal for the runs
mkdir -p /tmp/next16-validation
for n in 1 2 3; do
  npx -y lighthouse http://127.0.0.1:3000/blog/posts/the-missing-layer-in-your-ai-stack-intermediate-knowledge --preset=desktop --output=json \
    --output-path=/tmp/next16-validation/post-run-$n.json --quiet \
    --chrome-flags='--headless=new --no-sandbox'
done
```

The post exists as `data/blog/the-missing-layer-in-your-ai-stack-intermediate-knowledge.mdx` and the
smoke suite already visits it (`tests/smoke/blog.smoke.spec.ts:84`).
