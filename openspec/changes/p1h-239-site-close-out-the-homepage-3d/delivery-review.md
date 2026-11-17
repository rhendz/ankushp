# Delivery review — p1h-239-site-close-out-the-homepage-3d

**Reviewed revision:** 90eed3d7aea93783
**Reviewed commit:** cc755c58bb4c562db308a3959415af360205985a
**Reviewed at:** 2026-11-17
**Reviewer:** the Verifier (claude), run 60dc818dc1071dab0a5e4846
**Verdict:** PASS

Written by the controller from the Verifier's checked reply. The controller decides from that reply, not from this file.

## What was checked

- Diff origin/main...HEAD (merge base 6404d703): the only files changed are lib/dependency-guard.test.ts, docs/specs/next16-migration/homepage-3d-closeout.md and openspec/changes/p1h-239-site-close-out-the-homepage-3d/*. That matches contract.json scope. No change to package.json, package-lock.json, app/, components/, layouts/, css/, scripts/, tests/, .github/, .claude/, CLAUDE.md or AGENTS.md.
- The evidence revision cc755c5 differs from HEAD bbbf694 only in evidence.md (git diff --stat cc755c5 HEAD), so the recorded results apply to the code that is there now.
- Spec scenarios traced to lib/dependency-guard.test.ts. 'Manifest lists no @react-three package' is the real package.json case at :96-106, and its failure message names every offender. 'Runtime dependency' is the it.each over all five sections at :44-47. 'Development, peer, optional or override' is :44-59, with drei in devDependencies and postprocessing in overrides. 'Similarly named package outside the scope' is :70-89 (three, @types/three, react-three-fiber, @react-three-extras/x). The detector cases are what make the guard discriminate, as design D3 requires.
- Ran `bash scripts/pipeline-check.sh test`: 9 files and 37 tests passed, including 12 in lib/dependency-guard.test.ts.
- Ran `bash scripts/pipeline-check.sh lint`: no output (see not_checked on the exit code).
- Close-out document structure: four '## Deliverable N' sections, each with a '**Verdict:**' line, then '## Still missing' and '## Not verified'. Verdicts match design D4: Met, Met, Met (read, not run), Partly met.
- Citations spot-checked against the code: package.json:18/43/48/49/60/70; scripts/home-visual-health-check.mjs:3, 7-11, 13-16, 18-21, 40-43, 61-65; tests/smoke/blog.smoke.spec.ts:4-15; lib/dependency-guard.test.ts:96-101. The 'Commit graded: 6404d70' line matches the actual merge base.
- Limitations are honest. The document says Deliverable 3 is read, not run. It says the lockfile is not guarded, and that the guard was added with the close-out rather than asked for by the issue.
- Privacy: no emails, tokens or secrets in the diff (grep over the change folder and a read of both delivered files).

## Findings

None.

## Not checked

- Routes a visitor would see change: none are expected, because no app, component or style file changed. The developer should still confirm on the preview that / looks and behaves as on production.
- GitHub Actions checks the PR still has to pass: typecheck (the new .ts file uses `__dirname` and node:fs types), build, and the Playwright smoke. None were run here.
- Lint exit code: the second lint run with an exit-code echo was denied by the sandbox. The first run printed nothing, and the recorded evidence says it passed.
- Not every path:line citation in the close-out document was checked. Unchecked: components/home/*, .github/workflows/required-checks.yml:126-154, playwright-smoke.yml, home-visual-health.yml, vitest.config.ts:16-21, package-lock.json line ranges, next.config.js:67, and the history claims about 93b079c.
- How the homepage looks, and whether the plain-three scene preserves the earlier visual experience. That is the developer's call on the preview.
