# Tasks — p1h-239-site-close-out-the-homepage-3d

## 1. Dependency guard

- [x] 1.1 (dependency-guard-test) Add `lib/dependency-guard.test.ts` per design.md D1-D3: a pure `findReactThreePackages(manifest)` that collects every key starting with `@react-three/` from `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies` and `overrides`; fixture cases proving it catches a name in each of those five places and passes a `three` / `@types/three`-only manifest; and the guard case asserting the real `package.json` yields an empty list, with a message naming any offender. Verify with `bash scripts/pipeline-check.sh test -- lib/dependency-guard.test.ts && bash scripts/pipeline-check.sh lint`.

## 2. Close-out document

- [x] 2.1 (closeout-doc) Write `docs/specs/next16-migration/homepage-3d-closeout.md` per design.md D4: header with issue 97, P1H-239, date and the commit graded; the issue's objective and scope; sections `## Deliverable 1` to `## Deliverable 4`, each with the verbatim deliverable, a `**Verdict:**` line and `path:line` evidence marked read or ran, re-checked against the code at writing time; then `## Still missing` and `## Not verified`. Touch nothing else: no scene, dependency, script, smoke or workflow file. Verify with the contract's structure check plus the unchanged-paths `git diff --quiet` against the merge base with `main`.

## 3. Whole-change check

- [x] 3.1 (full-checks) Run the full unit suite and lint on the finished branch; verify with `bash scripts/pipeline-check.sh test && bash scripts/pipeline-check.sh lint`.
