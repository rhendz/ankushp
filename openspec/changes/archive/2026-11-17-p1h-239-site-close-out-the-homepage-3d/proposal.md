# Proposal — p1h-239-site-close-out-the-homepage-3d

**Linear:** P1H-239 · **GitHub:** issue 97 (homepage 3D runtime errors)

## Why

GitHub issue 97 is still open, but the work it asked for was mostly done in March 2026 when the
`@react-three` packages were removed (`93b079c`) and the homepage scene moved to plain `three`
(`119cf72`). Nobody has checked the issue's four deliverables against the code, so the developer
cannot close it on evidence. Nothing stops a later dependency change from bringing the
`@react-three` packages back either, and with them the runtime errors the issue was about.

## What Changes

- A new document, `docs/specs/next16-migration/homepage-3d-closeout.md`, grades each of issue 97's
  four deliverables against `main` as it is today, with `path:line` evidence, separates what was read
  from what was run, and lists what is still missing.
- A new vitest file, `lib/dependency-guard.test.ts`, fails when `package.json` lists any package
  whose name starts with `@react-three/`, and names the offending package. It runs under
  `bash scripts/pipeline-check.sh test` locally and in the Required Checks `test` job on every pull
  request.
- No source, dependency, lockfile, script, smoke-test or workflow change. No visitor-visible change.

## Capabilities

### New Capabilities

- `homepage-3d-dependency-guard`: the site's unit-test check rejects a package manifest that lists a
  package from the `@react-three/` scope.

### Modified Capabilities

None. `openspec/specs/` holds no capabilities yet.

## Impact

- **Files added:** `docs/specs/next16-migration/homepage-3d-closeout.md`, `lib/dependency-guard.test.ts`.
- **Dependencies:** none added, removed or moved.
- **CI:** the Required Checks `test`, `lint` and `typecheck` jobs pick up the new test file;
  `build` and the Playwright smoke are unaffected, as nothing the site imports changes.
- **Routes:** none. No page looks or behaves differently.
- **Future dependency work:** anyone adding an `@react-three/` package later gets a failing test
  and has to remove the guard on purpose.

## Out of scope

- Any change to the homepage scene, its fallback, its look or its behaviour.
- Any change to `package.json` or `package-lock.json`.
- Fixing the coverage gaps the document finds (for example the smoke case not seeing errors the
  scene's boundary catches, or the watchdog's signatures). The document names them; scheduling them
  is the developer's call.
- Closing GitHub issue 97. The developer closes it after reading the document.
