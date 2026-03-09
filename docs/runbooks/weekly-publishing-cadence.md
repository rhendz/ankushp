# Weekly Publishing Cadence Runbook

This runbook defines a lightweight, sustainable weekly blog publishing workflow.

## Objective

- Publish one quality post per week with clear ownership and low coordination overhead.
- Keep in-flight work minimal: one post in progress at a time.

## Weekly cadence at a glance

- Monday: lock one idea.
- Tuesday-Wednesday: draft.
- Thursday: review and revisions.
- Friday: publish and verify.

If a stage misses SLA, roll the post to next week instead of compressing quality gates.

## Stage ownership, handoffs, and SLAs

| Stage   | Owner                             | Input                            | Output (handoff artifact)                                    | SLA                                      |
| ------- | --------------------------------- | -------------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| Idea    | Content Lead                      | backlog topics, audience signals | selected topic + 3-5 bullet outline in issue/notes           | by Monday 12:00 local time               |
| Draft   | Author                            | approved outline                 | complete first draft in `data/blog/<slug>.mdx`               | within 2 business days from idea lock    |
| Review  | Editor/Reviewer                   | first draft                      | approved draft with inline edits resolved, go/no-go decision | within 1 business day from draft handoff |
| Publish | Publisher (can be same as Author) | approved draft                   | merged + deployed post, live URL shared in issue/notes       | by Friday 17:00 local time               |

## Minimal operating rules

- Single-threaded flow: do not start a second draft before the current post is published or explicitly rolled over.
- Definition of done per stage:
  - Idea: topic, target reader, and key takeaway are explicit.
  - Draft: intro/body/conclusion complete and metadata present (`title`, `date`, `summary`, `tags`).
  - Review: factual/voice checks done; required edits resolved.
  - Publish: production URL loads, metadata renders, and links/images work.
- Timebox reviews to one round when possible; unresolved major gaps trigger rollover.
- Use async updates in the issue/notes at each handoff to avoid synchronous meetings.

## Weekly checklist

1. `Idea`: one topic selected and scoped.
2. `Draft`: draft completed in repository.
3. `Review`: approval recorded with any required fixes applied.
4. `Publish`: post merged, deployed, and smoke-checked.

## Validation

Use this docs review checklist for clarity and completeness:

1. Each stage has exactly one owner.
2. Handoff artifact is explicit and easy to find.
3. SLA is measurable (date/time or business-day window).
4. Rollover rule is clear and preserves quality.
5. A new contributor can follow the process without additional tribal context.
