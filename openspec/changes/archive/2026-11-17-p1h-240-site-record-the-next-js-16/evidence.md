# Evidence — p1h-240-site-record-the-next-js-16

Written by `machinery controller` from the runner's own acceptance results.
A task is complete when the supervisor's re-run of its acceptance command
passed — not when a worker said so and not when a box was checked. Every
entry names the one commit the runner tested, 2f9b2fa2fb7a3548419a095db720268782d7eaea. A staging check
carried to the next candidate is `unverified` until it has run.

### write-validation-checklist · passed
**Revision:** 2f9b2fa2fb7a3548419a095db720268782d7eaea
**Command:** f=docs/specs/next16-migration/validation.md; test -f "$f" && grep -q '^# Next.js 16 Migration Validation' "$f" && grep -q '^## Status legend' "$f" && grep -q '^## Sign-off checklist' "$f" && grep -q '^## Smoke coverage of critical routes' "$f" && grep -q '^## force-dynamic fallback' "$f" && grep -q '^## Rollback triggers (proposed)' "$f" && grep -q '^## Performance spot-checks' "$f" && grep -qxF '### Homepage (/)' "$f" && grep -qxF '### Blog post page' "$f" && for i in $(seq 1 13); do grep -qE "^\| *V$i *\|[^|]*\| *(met|not met|not run) *\|" "$f" || exit 1; done && grep -qE '^\| *V4 *\|[^|]*\| *met *\|' "$f" && for i in 7 8 9 12 13; do grep -qE "^\| *V$i *\|[^|]*\| *not run *\|" "$f" || exit 1; done && ! grep -qE '^\| *V(7|8|9|10|11|12|13) *\|[^|]*\| *met *\|' "$f" && grep -qF 'Proposed, not adopted' "$f" && for r in 1 2 3 4; do grep -qE "^- \*\*R$r\b" "$f" || exit 1; done && grep -qF '60a7a1f' "$f" && grep -qF '/about' "$f" && grep -qF 'npx -y lighthouse' "$f" && bash scripts/pipeline-check.sh lint
**Result:** the supervisor's re-run of the acceptance command passed
**Covers:** docs/specs/next16-migration/validation.md
**Limitations:** covers only what the acceptance command asserts

### confirm-site-unchanged · passed
**Revision:** 2f9b2fa2fb7a3548419a095db720268782d7eaea
**Command:** b="$(git merge-base HEAD refs/remotes/origin/main)" && l="$(git diff --name-only "$b" && git ls-files --others --exclude-standard -- . ':(exclude,glob).*' && git ls-files --others --exclude-standard -- .github .husky)" && test -z "$(printf '%s\n' "$l" | grep -vxE 'docs/specs/next16-migration/validation\.md|openspec/changes/p1h-240-site-record-the-next-js-16/.+')" && bash scripts/pipeline-check.sh test
**Result:** the supervisor's re-run of the acceptance command passed
**Covers:** docs/specs/next16-migration/validation.md
**Limitations:** covers only what the acceptance command asserts
