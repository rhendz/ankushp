# Close-out: GitHub issue 97 (homepage 3D runtime errors)

- **GitHub issue:** 97
- **Linear:** P1H-239
- **Date written:** 2026-11-17
- **Commit graded:** `6404d70` (merge base with `main` when this was written). Every `path:line` below is on that commit.
- **Evidence labels:** *read* means read in the source at the path and line given. *ran* means a command was executed in the sandbox the document was written in. The scene was never opened in a browser.

## Issue objective and scope

Objective, as supplied by the issue's author (decisions.md R1, copied from the issue):

> Remove homepage runtime errors (`ReactCurrentBatchConfig`/`ReactCurrentOwner`) at the source while preserving the current visual experience.

Scope: the issue names `@react-three/fiber`, `@react-three/drei` and `@react-three/postprocessing`.

## Deliverable 1

> Confirmed compatible dependency matrix for 3D stack.

**Verdict:** Met

No document recorded this before; the matrix is recorded here. Versions are declared in `package.json` and resolved in `package-lock.json`:

| Package | `package.json` | `package-lock.json` |
|---|---|---|
| `three` | `^0.183.2` (`package.json:60`) | `0.183.2` (`package-lock.json:20683-20688`) |
| `@types/three` | `^0.183.1` (`package.json:70`) | `0.183.1` (`package-lock.json:7090-7091`) |
| `react` | `^19.2.0` (`package.json:48`) | `19.2.4` (`package-lock.json:17525-17526`) |
| `react-dom` | `^19.2.0` (`package.json:49`) | `19.2.4` (`package-lock.json:17534-17535`) |
| `next` | `^16.3.4` (`package.json:43`) | `16.3.4` (`package-lock.json:16269-16270`) |

Why these are compatible:

- `package-lock.json:20683-20688` (read): the `three` 0.183.2 entry has no `dependencies` and no `peerDependencies`, so it constrains neither React nor Next.
- `components/home/home-3d-scene.tsx:3-4` (read): the scene imports plain `three` and React hooks only. No React renderer binding sits between them.
- `next.config.js:67` (read): `transpilePackages: ['three']`.
- The React coupling the issue was about came from the `@react-three` packages, which are removed (Deliverable 2).

"Compatible" here is shown from declared metadata and the source, not from a build or a browser run. Typecheck, build and the Playwright smoke run in CI on the pull request.

## Deliverable 2

> Updated package versions + lockfile.

**Verdict:** Met

- `93b079c` (ran `git show --stat 93b079c` and `git show 93b079c -- package.json`, 2026-03-11): removed `@react-three/drei ^10.7.7`, `@react-three/fiber ^9.5.0` and `@react-three/postprocessing ^3.0.4` from `package.json`, cut 530 lines from `package-lock.json`, and added `scripts/home-visual-health-check.mjs` with `.github/workflows/home-visual-health.yml`.
- `package.json` (ran `grep -c "@react-three" package.json`): `0`.
- `package-lock.json` (ran `grep -c "@react-three" package-lock.json`): `0`.
- `git grep -n -i "react-three"` outside `openspec/`, this document's guard test and `.workstream/` (ran): no matches.
- `package.json:60`, `package.json:70`, `package-lock.json:20683-20688`, `package-lock.json:7090-7091` (read): `three` and `@types/three` are current in both files and agree.
- `lib/dependency-guard.test.ts:96-101` (read): a vitest case fails if `package.json` lists any `@react-three/` package again, naming it. It runs in the Required Checks `test` job (`.github/workflows/required-checks.yml:126-154`, read) and picks the file up through `vitest.config.ts:16-21` (read). Added with this close-out; it is not part of what the issue asked for.
- The lockfile is not guarded: a transitive `@react-three` package would not trip the guard. Today the count is `0`.

## Deliverable 3

> Homepage renders 3D scene without client runtime exceptions.

**Verdict:** Met (read, not run)

- `app/page.tsx:1`, `app/page.tsx:9` (read): `/` renders `Home3DSceneShell`.
- `components/home/home-3d-scene-shell.tsx:8-11` (read): the scene loads in the browser only, through `next/dynamic` with `ssr: false`.
- `components/home/home-3d-scene-shell.tsx:15-17` (read): the scene sits inside an error boundary whose fallback is `Home3DFallback`.
- `components/home/home-3d-error-boundary.tsx:18-31` (read): on a render error the boundary logs `"Home 3D scene failed to render."` and renders the fallback.
- `components/home/home-3d-scene.tsx:3-4` (read): imports are plain `three` and React hooks. No `@react-three` import exists (see Deliverable 2, ran).
- `components/home/home-3d-scene.tsx:210`, `:221-242` (read): the renderer is built inside an effect; three WebGL configurations are tried and, if none works, the canvas is removed and an error is thrown. That throw is what sends the boundary to the fallback.
- `components/home/home-3d-scene.tsx:340-366`, `:368-375` (read): reduced motion draws one static frame; an `IntersectionObserver` stops animation off screen.
- `components/home/home-3d-fallback.tsx:10-12` (read): the fallback carries the `hero-visual-shape` class the watchdog looks for.

The source of the named errors is gone and the one remaining failure path (no WebGL) is caught. Nobody observed the page running while this was written, and this document does not judge whether the plain-three scene looks like the old one (the objective's "preserving the current visual experience"). That is a looks call for the developer.

## Deliverable 4

> Smoke/CI coverage includes homepage runtime health check.

**Verdict:** Partly met

What exists:

- `tests/smoke/blog.smoke.spec.ts:4-15` (read): loads `/`, waits for the "Ankush Patel" heading and 500 ms, and fails on any `pageerror`.
- `.github/workflows/playwright-smoke.yml:3-7`, `:56-57` (read): that smoke suite runs on every pull request and every push to `main`.
- `playwright.config.ts:29-34` (read): it runs against `npm run dev`.
- `scripts/home-visual-health-check.mjs:26-34`, `:61-65` (read): a production watchdog collects `console` errors and `pageerror` and exits 1 on a crash signature. `package.json` has the `health:home-visual` script for it (added in `93b079c`, ran).
- `.github/workflows/home-visual-health.yml:8-10` (read): it runs daily at 13:00 UTC and on demand.
- `lib/dependency-guard.test.ts:96-101` (read): a pull-request check on the manifest (see Deliverable 2).

What does not meet "includes homepage runtime health check" in full: see "Still missing".

## Still missing

- The smoke case listens only for uncaught `pageerror` (`tests/smoke/blog.smoke.spec.ts:6-8`, read). An error the scene's boundary catches is reported through `console.error` (`components/home/home-3d-error-boundary.tsx:23`, read), which the smoke case does not listen to, so a scene failure that lands on the fallback passes.
- The smoke case does not check whether a canvas or the fallback is on screen (`tests/smoke/blog.smoke.spec.ts:10-14`, read).
- The watchdog's crash signatures are `ReactCurrentBatchConfig`, the same with its `Cannot read properties` prefix, and `Home 3D scene failed to render. TypeError` (`scripts/home-visual-health-check.mjs:7-11`, read). `ReactCurrentOwner`, which the issue also names, is not among them.
- The watchdog records `canvasCount` and `fallbackShapeCount` (`scripts/home-visual-health-check.mjs:40-43`, read) but does not fail when only the fallback is showing (`:61-65`, read). It also ignores WebGL-context errors (`:13-16`, read).
- The watchdog does not run on pull requests: its triggers are a daily schedule and manual dispatch (`.github/workflows/home-visual-health.yml:8-10`, read), and it targets production by default (`scripts/home-visual-health-check.mjs:3`, read). A regression reaches production before it is seen.
- The dependency guard covers `package.json` only, not `package-lock.json` (see Deliverable 2).

None of these is fixed by this change; scheduling them is the developer's call.

## Not verified

- The 3D scene was not seen running in a browser, locally or on a preview. Deliverable 3 rests on the source.
- Whether the pull-request smoke run's headless Chromium gets a WebGL context. The watchdog forces `--use-gl=swiftshader` (`scripts/home-visual-health-check.mjs:18-21`, read); the smoke config does not (`playwright.config.ts:25-34`, read). If it gets none, the smoke case always exercises the fallback path.
- Whether the visual experience was preserved through the move from `@react-three` to plain `three` (`119cf72`, `391a02a`, `93b079c`).
- The result of the latest Home Visual Health run and of the latest smoke run on `main`; neither was read.
- Typecheck, the production build and the Playwright smoke: not run in this session. They run in GitHub Actions on the pull request.
