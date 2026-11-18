# Investigation — p1h-240-site-record-the-next-js-16

## Objective

Linear P1H-240 asks for one new document, `docs/specs/next16-migration/validation.md`. It is a
sign-off checklist for the Next.js 16 migration as it stands on `main` today. Each line is marked met
or not met and gives its evidence. The lines must cover:

- which of the site's critical routes the Playwright smoke suite exercises
- which routes still carry the temporary `force-dynamic` fallback that `blockers.md` describes
- the thresholds that would trigger a rollback
- the homepage and blog-post performance spot-checks, written as exact commands and marked not run,
  because the pipeline has no browser

The issue does not ask for any change to site code, and this plan does not widen it.

## Upstream

- Linear P1H-240 (the intake: `openspec/changes/p1h-240-site-record-the-next-js-16/intake.md`).
- `docs/specs/next16-migration/readiness.md`: the migration plan (issue #82). Phase 3 / issue #85
  (`readiness.md:56-59`) asks for re-running lint/test/build and smoke, spot-checking performance for
  `/` and one `/blog/posts/[slug]` route, and documenting "regression thresholds and rollback trigger".
  This change records that phase.
- `docs/specs/next16-migration/blockers.md`: the static-prerender blocker (issue #90) and the
  temporary fallback.
- `docs/perf/homepage-desktop-baseline-issue-70.md`: the only recorded Lighthouse method and numbers
  for `/`.
- `tests/smoke/blog.smoke.spec.ts`, `playwright.config.ts`, `.github/workflows/required-checks.yml`,
  `.github/workflows/playwright-smoke.yml`, `.github/workflows/home-visual-health.yml`.
- `.claude/rules/site.md`: "A check that did not run is not a pass."

## Affected behavior

The site's behaviour does not change. The new file is a document and nothing renders it. Below is
what `main` holds today, at merge base `6404d70`, and so what the checklist will record.

**Framework versions (read).** `package.json:43` `next ^16.3.4`, `:48-49` `react`/`react-dom ^19.2.0`.
`package-lock.json` resolves these to `next 16.3.4` (line 16270) and `react`/`react-dom 19.2.4`
(lines 17526, 17535). Scripts use `--webpack` (`package.json:6-11`).

**Async request API (read).** The three routes the codemod flagged (`readiness.md:28-31`) now type
`params` as a `Promise` and await it:
- `app/blog/posts/[...slug]/page.tsx:73,75,160,162`
- `app/blog/tags/[tag]/page.tsx:13,52`
- `app/blog/posts/page/[page]/page.tsx:13,50`

**Lint migration (read and run).** `package.json:12` is `eslint app components lib layouts scripts`,
with a flat config in `eslint.config.js`. No `.eslintrc*` is tracked (`git ls-files`). I ran
`bash scripts/pipeline-check.sh lint` on this branch and it exited 0.

**force-dynamic fallback: premise corrected (read and ran `git log -S`).** The intake asks which
routes "still carry" the fallback. None do:
- The repository has no `force-dynamic` and no `export const dynamic` under `app/` (Grep over the
  tracked tree). The only matches are in `blockers.md:14,20` and this change's intake.
- `git log -S'force-dynamic' -- app` shows two commits. `13558b9` (Next.js 16 baseline) added the line
  to `app/about/page.tsx` and `app/blog/posts/[...slug]/page.tsx`. `60a7a1f` (#94, "upgrade pliny and
  contentlayer stack for next16") removed it from both.
- `app/about/page.tsx:1-20` has no route segment config. `app/blog/posts/[...slug]/page.tsx:151-155`
  exports `generateStaticParams`, so the post pages are meant to prerender.
- `blockers.md` is stale. On main's first-parent history, #92 (`81ce7af`, which wrote `blockers.md`)
  merged after #94. So `blockers.md:13-14` ("Temporary fallback remains in place") describes the
  state before #94.
- What the repository cannot show: whether `npm run build` prerenders those routes cleanly on main
  today. Only the `build` job in `required-checks.yml:94-124` can show that, and it runs in GitHub
  Actions, not on the PC.

**Smoke coverage (read).** `tests/smoke/blog.smoke.spec.ts` visits:
- `/` (line 10)
- `/blog` (lines 18, 36, 74)
- `/blog/posts`, then clicks through to the first post (lines 25-32)
- `/blog/posts/the-missing-layer-in-your-ai-stack-intermediate-knowledge` (line 84). The post
  exists at `data/blog/the-missing-layer-in-your-ai-stack-intermediate-knowledge.mdx`.

No smoke test visits `/about`, which is one of the two routes the blocker named (`blockers.md:8`).
No smoke test visits `/blog/tags/[tag]` or `/blog/posts/page/[page]` either, two of the three async-params
routes. The smoke server is `npm run dev` (`playwright.config.ts:29-34`), which is `next dev --webpack`
(`package.json:7`). So the smoke suite never exercises the production static prerender, and the
prerender is exactly what the blocker was about. The smoke job runs on every pull request and every
push to main (`playwright-smoke.yml:3-7,56-57`).

**Rollback thresholds (read).** The repository has no rollback threshold for this migration.
- `readiness.md:59` asks for one, and `readiness.md:79-81` gives only the mechanism: revert the
  migration commits.
- Grepping the tracked tree for `rollback`, `regression threshold` and `#85` finds nothing else
  migration-specific.
- The only numeric performance gates are in `homepage-desktop-baseline-issue-70.md:45-68`, and
  they were written for issues #69 and #71, not for this migration.
- That baseline (commit `7a3a6bf`) is an ancestor of the upgrade commit `13558b9` (I checked with
  `git merge-base --is-ancestor`). It is therefore a pre-migration measurement of `/`.
- Its run-to-run spread is large. FCP ranges 212-599 ms and LCP 1132-1419 ms (`:26-27`).
- No baseline exists for any blog post page.

**Performance spot-checks (read).** The only recorded method is in
`homepage-desktop-baseline-issue-70.md:9-20`:
1. `npm run build`
2. `npm run serve -- --port 3000`
3. Three runs of `npx -y lighthouse … --preset=desktop`

A local `npm run build` needs `OG_API_KEY` set, because `app/blog/posts/[...slug]/page.tsx:60-61`
throws without it. CI sets a placeholder value (`required-checks.yml:21`).

**Checks on the PC.** `bash scripts/pipeline-check.sh lint` runs `eslint app components lib layouts scripts`,
and `test` runs `vitest run`, whose include list covers only `components/`, `lib/` and `app/`
(`vitest.config.ts:16-20`). A markdown file under `docs/` cannot make either check fail. On their own
they do not tell a correct deliverable from a missing one. That is why each task's acceptance also
asserts the file and its required sections.

## Existing uses

Nothing is removed. No capability, flag, script argument or documented affordance goes away.

## Alternatives

1. **The reading I rejected: "list the routes that still carry force-dynamic" as if some do.**
   Writing that `/about` and `/blog/posts/[...slug]` carry the fallback would copy `blockers.md`, and
   the code shows it is wrong. The checklist records that no route carries it, with the removal commit
   as evidence.
2. **Also correcting `blockers.md`.** Rejected for this change. The intake allows only `validation.md`
   to be written. Instead, `validation.md` says that `blockers.md`'s "Current stabilization state"
   no longer holds and points to the evidence. Updating `blockers.md` itself is a candidate
   follow-up issue.
3. **Adding a vitest test that checks the document against the code** (for example, that no route
   exports `force-dynamic`). Rejected. Vitest only collects tests under `app/`, `components/` and
   `lib/` (`vitest.config.ts:16-20`), so this would mean writing outside the one approved path, and
   into site code, which is out of scope. Instead, each acceptance includes a `grep` on the document.
4. **Running Lighthouse or the smoke suite and recording numbers.** Out of scope per the intake. The
   PC has no browser in the pipeline.
5. **Inventing hard rollback numbers and marking the threshold line "met".** Rejected. A threshold
   nobody has agreed is not met. The document states proposed triggers, each derived from a recorded
   source, and marks the sign-off line not met until the developer adopts them (see Uncertainties).

## Uncertainties

- **Needs a measurement:** whether `npm run build`, typecheck and the smoke suite are green on main
  today. The PC cannot run them. The PR's own Actions run, on a branch that merges main, is the
  evidence, and the developer reads it before accepting. The checklist marks those lines "not run
  (PC)" and names the job.
- **Needs a measurement:** current performance of `/` and a post page. These are marked not run, with
  the commands.
- **Needs the developer's decision, but does not block this change:** whether to adopt the
  proposed rollback thresholds. The document presents them as proposed. Merging the document records
  the proposal; it does not adopt it. The adoption line stays not met.
- **Read, not run:** the merge order of #92 after #94. It comes from
  `git log --first-parent main` and is consistent with the code.

## Recommendation

Question: what should `validation.md` say, given that the fallback is already gone? Write the
checklist as the code shows it on main:
- force-dynamic removal: **met**, with the evidence and a note that `blockers.md` is stale
- smoke coverage: **not met** for `/about`, with the dev-server caveat
- lint and test: from the PC run
- build, typecheck and smoke: **not run (PC)**, pointing to the Actions jobs
- rollback thresholds: **proposed**, with adoption **not met**
- the two performance spot-checks: **not run**, with exact commands

Touch no other file.

## Conclusion

Open. This closes when the change is delivered.
