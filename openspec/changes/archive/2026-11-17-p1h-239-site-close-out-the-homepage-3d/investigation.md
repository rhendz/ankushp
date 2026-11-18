# Investigation — p1h-239-site-close-out-the-homepage-3d

## Objective

The developer wants GitHub issue 97 (homepage 3D runtime errors) closed out with a written check, not
by memory. A new document next to the other Next 16 migration documents should take the issue's four
deliverables one by one and say, citing file and line on `main`, whether today's code meets each and
what is still missing. Separately, a vitest case should fail if `package.json` ever lists a package
from the `@react-three/` scope again, so the class of runtime error the issue describes cannot come
back without a red check. Linear: P1H-239. GitHub: issue 97. Nothing in the homepage itself changes.

The issue's text was supplied by the developer's console-sites lane in `decisions.md` (R1): its four
deliverables are a confirmed compatible dependency matrix for the 3D stack; updated package versions
and lockfile; the homepage rendering its 3D scene without client runtime exceptions; and smoke/CI
coverage that includes a homepage runtime health check. Its objective was removing the
`ReactCurrentBatchConfig` / `ReactCurrentOwner` errors at the source while keeping the visual
experience, and its scope named `@react-three/fiber`, `@react-three/drei` and
`@react-three/postprocessing`.

## Upstream

- `openspec/changes/p1h-239-site-close-out-the-homepage-3d/intake.md` — approved intent.
- `openspec/changes/p1h-239-site-close-out-the-homepage-3d/decisions.md` (R1) — the issue's
  deliverables, objective and scope, copied from GitHub issue 97.
- `docs/specs/next16-migration/readiness.md`, `docs/specs/next16-migration/blockers.md` — the
  existing migration documents; the close-out goes beside them.
- `.claude/rules/site.md` — checks, dependency and public-repository rules.
- Code read: `package.json`, `package-lock.json`, `app/page.tsx`, `components/home/*`,
  `next.config.js`, `tests/smoke/blog.smoke.spec.ts`, `playwright.config.ts`,
  `scripts/home-visual-health-check.mjs`, `.github/workflows/*.yml`, `vitest.config.ts`,
  `tsconfig.json`, `eslint.config.js`, `scripts/pipeline-check.sh`.

## Affected behavior

Line numbers are on the merge base with `main`, `6404d70`. "Ran" means a command was executed in
this planning session; everything else was read.

### The dependency picture today

- No `@react-three/*` package is listed. `package.json` has none (read, whole file);
  `grep -c "@react-three" package-lock.json` prints `0` (ran); `git grep -n react-three` outside
  `openspec/changes/` finds nothing (ran).
- Commit `93b079c` ("chore: remove legacy react-three deps and add home visual health watchdog",
  2026-03-11) removed `@react-three/drei ^10.7.7`, `@react-three/fiber ^9.5.0` and
  `@react-three/postprocessing ^3.0.4` from `package.json`, cut 530 lines from the lockfile, and
  added `scripts/home-visual-health-check.mjs` with `.github/workflows/home-visual-health.yml`
  (ran `git show --stat 93b079c` and `git show 93b079c -- package.json`).
- Commit `119cf72` ("bug: replace home r3f runtime with direct three scene") and `391a02a`
  ("bug: harden home webgl init and simplify three transpilation") preceded it (ran `git log -1`).
- The 3D stack now, declared and resolved:

  | Package | `package.json` | `package-lock.json` |
  |---|---|---|
  | `three` | `^0.183.2` (`package.json:60`) | `0.183.2` (`package-lock.json:20683-20688`) |
  | `@types/three` | `^0.183.1` (`package.json:70`) | `0.183.1` (`package-lock.json:7090-7091`) |
  | `react` / `react-dom` | `^19.2.0` (`package.json:48-49`) | `19.2.4` (`package-lock.json:17525-17526`, `:17534-17535`) |
  | `next` | `^16.3.4` (`package.json:43`) | `16.3.4` (`package-lock.json:16269-16270`) |

  Compatibility source: the lockfile entry for `three` 0.183.2 declares no `dependencies` and no
  `peerDependencies` (`package-lock.json:20683-20688`), so it places no constraint on React or Next.
  The React coupling the issue was about came from the `@react-three` packages, which are gone.
  `next.config.js:67` transpiles `three` (`transpilePackages: ['three']`).

### The homepage scene

- `/` renders `Home3DSceneShell` (`app/page.tsx:1`, `app/page.tsx:9`).
- The shell loads the scene in the browser only, through `next/dynamic` with `ssr: false`
  (`components/home/home-3d-scene-shell.tsx:8-11`), inside an error boundary whose fallback is
  `Home3DFallback` (`components/home/home-3d-scene-shell.tsx:15-17`).
- The boundary logs `"Home 3D scene failed to render."` with `console.error` and renders the
  fallback (`components/home/home-3d-error-boundary.tsx:18-31`).
- The scene imports plain `three` (`components/home/home-3d-scene.tsx:3`) and React hooks only
  (`:4`); there is no React-Three import. It builds the renderer inside an effect
  (`:210`), tries three WebGL renderer configurations, and throws if none succeeds (`:221-242`);
  that throw is what sends the boundary to the fallback.
- Reduced motion draws a single static frame (`:340-366`); an IntersectionObserver stops the
  animation off-screen (`:368-375`).

### Runtime coverage

- **Pull-request smoke.** `tests/smoke/blog.smoke.spec.ts:4-15` loads `/`, waits for the
  "Ankush Patel" heading and 500 ms, and fails on any `pageerror`. It runs on every pull request and
  push to `main` (`.github/workflows/playwright-smoke.yml:3-7`, `:56-57`) against `npm run dev`
  (`playwright.config.ts:29-34`). It listens only for **uncaught** errors (`:6-8`). An error the
  scene's boundary catches is reported through `console.error`
  (`components/home/home-3d-error-boundary.tsx:23`), which this test does not listen to, and the test
  does not check whether a canvas or the fallback is on screen.
- **Production watchdog.** `scripts/home-visual-health-check.mjs` loads production, collects both
  `console` errors and `pageerror` (`:26-34`), and exits 1 only on a crash signature (`:61-65`). The
  signatures are `ReactCurrentBatchConfig` and `Home 3D scene failed to render. TypeError` (`:7-11`);
  `ReactCurrentOwner`, which the issue also names, is not among them. It records `canvasCount` and
  `fallbackShapeCount` (`:40-43`; the fallback carries `hero-visual-shape`,
  `components/home/home-3d-fallback.tsx:10-12`) but does not fail when the fallback is showing. It
  runs daily at 13:00 UTC and on demand (`.github/workflows/home-visual-health.yml:8-10`), not on pull
  requests.
- **Unit tests in CI.** The Required Checks `test` job runs `npm run test`
  (`.github/workflows/required-checks.yml:126-154`), and vitest picks up `lib/**/*.test.{ts,tsx}`
  (`vitest.config.ts:16-21`), so a new `lib/dependency-guard.test.ts` runs there and under
  `bash scripts/pipeline-check.sh test`. `npm run lint` covers `lib` (`package.json:12`).
  `tsconfig.json:56-67` includes every `.ts` file, so the typecheck job checks the new test too.
- No document in `docs/` records a dependency matrix for the 3D stack (ran a case-insensitive search
  of `docs/**/*.md` for `three|3d|webgl|ReactCurrent`; the only hits are a perf note and an unrelated
  `ReactCurrentDispatcher` build blocker in `docs/specs/next16-migration/blockers.md:6`).

### Grading this suggests (the document re-checks it)

1. **Dependency matrix** — not written down anywhere today; the facts for it exist (table above). The
   close-out document is where it gets recorded, so it meets this once written.
2. **Package versions + lockfile** — met by `93b079c`: the three named packages are gone from both
   files, and `three` / `@types/three` are current in both.
3. **Scene without client runtime exceptions** — met in the code as read: the source of the named
   errors is removed, and the remaining failure path (no WebGL) is caught and shows the fallback.
   Not observed running in this session.
4. **Smoke/CI homepage runtime check** — partly met. A pull-request smoke case exists but would not
   see a boundary-caught scene failure; the watchdog that would see one is daily, production-only,
   and omits `ReactCurrentOwner`. The new dependency guard adds a pull-request check on the source.

## Existing uses

Nothing is removed.

## Alternatives

- **Also fix the coverage gaps under deliverable 4** (listen for `console.error` in the smoke case,
  add `ReactCurrentOwner` to the watchdog). Rejected: it changes `tests/` and `scripts/`, which the
  intent does not list, and the intent asks for the gaps to be *named*. They go in the document's
  "Still missing" section for the developer to schedule.
- **Guard the lockfile too**, catching a transitive `@react-three` package. Rejected: the intent says
  `package.json`, and today's lockfile has none (count `0`). Recorded in design.md as weighed.
- **An ESLint `no-restricted-imports` rule on `@react-three/*`.** Rejected: catches imports, not the
  manifest the intent names, and needs `eslint.config.js`, outside the listed paths.
- **Grade from commit history alone.** Rejected: the issue's own deliverables are now available
  (`decisions.md` R1), so the grading uses them.

## Uncertainties

- **Needs a measurement:** whether the pull-request smoke run's headless Chromium gets a WebGL
  context (the watchdog forces `--use-gl=swiftshader`, `scripts/home-visual-health-check.mjs:18-21`;
  the smoke config does not). If not, the smoke case always exercises the fallback path. Settling it
  takes one look at a smoke run's trace; the document states it as unknown.
- **Needs the developer:** whether the visual experience was preserved through `119cf72` is a looks
  call; the document does not judge it.

## Recommendation

Question: what is the smallest change that closes out issue 97 honestly?

Recommended answer: write `docs/specs/next16-migration/homepage-3d-closeout.md` grading the four
deliverables as above (1 met by this record, 2 met, 3 met as read, 4 partly met with the gaps named),
and add `lib/dependency-guard.test.ts`, which fails when `package.json` lists any `@react-three/`
package. No change to the scene, the scripts, the smoke suite or the dependencies.
