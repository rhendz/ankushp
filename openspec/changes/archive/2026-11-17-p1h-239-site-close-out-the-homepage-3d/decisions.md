# Decision requests — p1h-239-site-close-out-the-homepage-3d

Raised by the controller, answered by the developer. One entry per decision.
Routine activity is not here: `machinery controller activity p1h-239-site-close-out-the-homepage-3d`.

### R1 · The agent stopped for a decision · answered
**Stage:** planning
**Asked:** 2026-11-17
**Kind:** intent
**Decision requested:** [spec] What are the four deliverables of GitHub issue 97? The close-out document must grade each one against main. This planning run cannot read GitHub (gh denied, api.github.com off the sandbox allowlist), and neither can the build worker. Options: Paste the four deliverables, verbatim and numbered, into the P1H-239 entry block (or intake.md) and re-queue the plan, Allow the planner network access to GitHub for this one read, Drop the per-deliverable grading and plan only the @react-three guard test. Recommended: Paste the four deliverables verbatim into the P1H-239 entry block. That way the planner, the reviewer and the offline worker all grade against the same text, and every other premise is already confirmed in investigation.md.
**Recommendation:** Answer the question; your note is carried into the next attempt.
**Links:** openspec/changes/p1h-239-site-close-out-the-homepage-3d/
**Answered:** answered · 2026-11-17T01:13:01 — The four deliverables of GitHub issue 97, verbatim and in order: (1) "Confirmed compatible dependency matrix for 3D stack." (2) "Updated package versions + lockfile." (3) "Homepage renders 3D scene without client runtime exceptions." (4) "Smoke/CI coverage includes homepage runtime health check." The issue's objective, verbatim: "Remove homepage runtime errors (`ReactCurrentBatchConfig`/`ReactCurrentOwner`) at the source while preserving the current visual experience." Its scope names `@react-three/fiber`, `@react-three/drei` and `@react-three/postprocessing`. Grade each of the four against main as it is today. They are now also in the Linear issue, under the entry block, which itself is unchanged. Answered by the console-sites lane, which wrote the issue; the text is copied from GitHub issue 97 and is not a decision.

### R2 · Dispatch? · answered
**Stage:** authorization
**Asked:** 2026-11-17
**Kind:** irreversible
**Decision requested:** Authorize execution against the reviewed plan? Proposing it did not — this is the decision that starts work.
**Recommendation:** Authorize it: the plan is complete, stamped and independently reviewed.
**Links:** openspec/changes/p1h-239-site-close-out-the-homepage-3d/
**Answered:** build · 2026-11-17T17:31:45
