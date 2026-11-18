# Design — p1h-239-site-close-out-the-homepage-3d

## Context

See `proposal.md` (Why) and `investigation.md` (the evidence, with `path:line` on merge base
`6404d70`). The two facts that shape the approach: `package.json` and the lockfile already list no
`@react-three` package, and the coverage gaps under issue 97's fourth deliverable sit in `tests/` and
`scripts/`, which this change does not touch.

## Goals / Non-Goals

**Goals:**
- A close-out document a developer can read once and then close issue 97, or schedule what is missing.
- A vitest guard that cannot pass while an `@react-three/` package is in `package.json`, and that
  proves on every run that it can detect one.

**Non-Goals:**
- Fixing the coverage gaps the document names (named only; see proposal Out of scope).
- Judging whether the plain-three scene looks like the old one. That is a looks call.

## Dependencies

None added, removed or moved. `package.json` and `package-lock.json` are unchanged, and task
`closeout-doc`'s acceptance checks that against the merge base with `main`. The test uses only
`vitest` (`^3.2.7`, already a devDependency) and Node's built-in `node:fs` / `node:path`, whose types
come from `@types/node` 26.4.1, already in the lockfile (`package-lock.json:7044-7046`) and already
relied on by `app/api/og/route.tsx:1`.

## Decisions

### D1 · Read `package.json` from disk and parse it, inside the test

The test reads the repository's `package.json` with `readFileSync(resolve(__dirname, '..',
'package.json'), 'utf8')` and `JSON.parse`, typing the result as a record of optional string maps.

- *Rejected: `import pkg from '../package.json'`.* `resolveJsonModule` (`tsconfig.json:19`) would
  type it as the literal file, so reading `peerDependencies` or `optionalDependencies`, which the file
  does not have, fails typecheck.
- *Rejected: `process.cwd()`.* It works under `npm run`, but ties the test to where vitest is
  started. `__dirname` is defined for test files by vitest's module runner; if it is not, the worker
  falls back to `process.cwd()`, since `scripts/pipeline-check.sh` always runs from the repository root.

### D2 · What counts as "lists"

The guard collects names from the keys of `dependencies`, `devDependencies`, `peerDependencies`,
`optionalDependencies` and `overrides`, and flags each one that starts with `@react-three/`
(`startsWith`, exact prefix, case-sensitive as npm names are lower-case). The failure message joins
every flagged name, for example `package.json lists @react-three packages: @react-three/fiber`.

- *Rejected: `dependencies` only.* `devDependencies` still installs the package, and an override can
  pin it. Any place a name appears in the manifest counts.
- *Rejected: also scanning `package-lock.json`.* That would catch a transitive `@react-three`
  package. The intent names `package.json`; the lockfile has none today (count `0`), and a
  lockfile scan would also fire on a package the site never chose. Not added.
- *Rejected: an ESLint `no-restricted-imports` rule.* It guards imports, not the manifest, and lives
  in `eslint.config.js`, outside this change's paths.

### D3 · The detector lives in the test file and is checked against fixtures

`lib/dependency-guard.test.ts` holds a small pure function, `findReactThreePackages(manifest)`, and
three groups of cases:

1. **Fixtures that must be caught:** a manifest with `@react-three/fiber` in `dependencies`, one with
   `@react-three/drei` in `devDependencies`, one with `@react-three/postprocessing` in `overrides`,
   and one each for `peerDependencies` and `optionalDependencies`; each must return that name.
2. **A fixture that must pass:** `three` and `@types/three` only; must return an empty list.
3. **The guard:** the real `package.json` must return an empty list, with the message from D2.

Groups 1-2 are what make the guard discriminate: if the detector were broken to always return
`[]`, group 3 would still pass but group 1 would fail. That is how a run proves "fails when
`package.json` lists one" without editing `package.json`, which is out of scope.

- *Rejected: put the detector in `lib/dependency-guard.ts`.* A non-test module in `lib/` imported
  by nothing but its test, and a path the intent does not list.
- *Rejected: only the real-manifest case.* It passes today whether or not the detector works.

### D4 · The close-out document

`docs/specs/next16-migration/homepage-3d-closeout.md`, beside `readiness.md` and `blockers.md`.
Structure, which task `closeout-doc`'s acceptance checks:

- A header naming GitHub issue 97, Linear P1H-239, the date, and the commit it grades (the merge base
  with `main` at the time of writing), and stating that "read" means read in the source and "ran"
  means a command was executed.
- The issue's objective and scope, quoted from `decisions.md` R1 (the document may quote the issue;
  it is grading against it).
- Four sections headed exactly `## Deliverable 1` … `## Deliverable 4`, each with the deliverable's
  verbatim text, a verdict line (`**Verdict:** Met | Partly met | Not met`), and the evidence as
  `path:line` bullets marked read or ran.
- `## Still missing`, a bulleted list. `## Not verified`, what the document did not observe.

The verdicts `investigation.md` supports, which the worker re-checks against the code before writing:

| # | Deliverable | Verdict | Main evidence |
|---|---|---|---|
| 1 | Confirmed compatible dependency matrix for 3D stack | Met by this document | matrix table of `three`, `@types/three`, `react`, `react-dom`, `next` from `package.json` and `package-lock.json`, with `three` having no dependencies or peers (`package-lock.json:20683-20688`) |
| 2 | Updated package versions + lockfile | Met | `93b079c`; `package.json:60`, `:70`; lockfile count `0` |
| 3 | Homepage renders 3D scene without client runtime exceptions | Met (read, not run) | `components/home/home-3d-scene.tsx:3`; shell `:8-11`, `:15-17`; boundary `:18-31`; WebGL fallback `:221-242` |
| 4 | Smoke/CI coverage includes homepage runtime health check | Partly met | smoke `tests/smoke/blog.smoke.spec.ts:4-15` on every PR; watchdog daily, production only |

"Still missing" carries, at least: the smoke case listens only for uncaught `pageerror`
(`tests/smoke/blog.smoke.spec.ts:6-8`) so an error the boundary catches and logs
(`components/home/home-3d-error-boundary.tsx:23`) does not fail it, and it does not check for a
canvas; the watchdog's signatures (`scripts/home-visual-health-check.mjs:7-11`) omit
`ReactCurrentOwner`; the watchdog does not fail when the fallback is showing (`:40-43`, `:61-65`) and
does not run on pull requests (`.github/workflows/home-visual-health.yml:8-10`). "Not verified"
carries: the scene was not seen running; whether the smoke run's Chromium gets WebGL; whether the
visual experience was preserved.

- *Rejected: a section in `readiness.md`.* That file is the Next 16 readiness record; a separate file
  is easier to link from issue 97 and does not rewrite an existing record.
- *Rejected: grading only "met / not met".* Deliverable 4 is genuinely partial; a binary verdict would
  either overclaim or hide the part that works.

## Which CI checks this depends on

- Required Checks **test** (runs the new file), **lint** (lints `lib/`), **typecheck**
  (`tsconfig.json` includes every `.ts`).
- **build** and **Playwright smoke**: no dependency; nothing the site imports changes. They should
  stay green as they are on `main`.

No route changes. On the preview, `/` should look and behave exactly as on production.

## Risks / Trade-offs

- [The document overclaims deliverable 3, which nobody can observe offline] → the verdict says
  "read, not run", and "Not verified" says the scene was not seen running; the developer can look at
  `/` on the preview and the last Home Visual Health run before closing the issue.
- [Line numbers in the document drift as `main` moves] → the header names the commit graded.
- [`__dirname` undefined in the test runtime] → fallback to `process.cwd()` (D1); the targeted
  acceptance run shows it at once.
- [The guard blocks a deliberate future return to `@react-three`] → intended; the failure message
  names the package, and removing the guard is a one-file change made on purpose.

## Migration Plan

None. Merging adds a document and a test; reverting removes them.
