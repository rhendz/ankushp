# Blog Content Handoff Runbook

This runbook standardizes collaborator handoff artifacts and pre-publish checks so posts do not bounce back for missing metadata or launch context.

## Scope

- Covers importing collaborator-provided blog content into `data/blog/*.mdx` without editorial rewriting.
- Defines required handoff package artifacts for both:
  - backposts (republish/adapt existing content)
  - net-new posts (original content for this site)
- Defines pre-publish metadata, publishing, and distribution checks.

## Canonical templates

- Collaborator submission format:
  - `docs/runbooks/templates/blog-collaborator-submission-prompt.md`
- Handoff + pre-publish checklist:
  - `docs/runbooks/templates/blog-publish-checklist.md`

## Required handoff artifacts (strict)

Every post handoff must include all artifacts below before import starts.

1. `Post manuscript` (required)
- One markdown document that follows the collaborator prompt exactly.
- Must pass `npm run blog:handoff:validate -- <input.md>`.

2. `Handoff checklist` (required)
- Copy `docs/runbooks/templates/blog-publish-checklist.md`.
- Complete every section marked required.
- Declare `Post type` as either `Backpost` or `Net-new`.

3. `Asset references` (required)
- Provide final or draft image references for each `[[IMAGE: ...]]` placeholder.
- Identify whether visuals are new, reused, or pending.

4. `Distribution plan` (required)
- At least one channel and owner must be assigned before publish.
- Include target publish date and timezone.

## Post-type requirements

Both post types require the same manuscript metadata (`slug`, `title`, `summary`, `date`, `lastmod`) and a completed checklist, plus the post-type-specific fields below.

### Backpost

- `Original URL` and source publication name.
- `Original published date`.
- `Canonical strategy`:
  - keep original canonical, or
  - canonical to this site (must be explicitly approved).
- `Reuse rights confirmed` (text, image, diagrams).

### Net-new

- `Target publish date` and owner.
- `Distribution owner` and channels.
- `Primary CTA` (newsletter, contact, product, etc).

## Import commands

Importer script: `scripts/blog-handoff-import.mjs`

- `npm run blog:handoff:validate -- <input.md>`
- `npm run blog:handoff:import -- <input.md> [--write] [--force]`
- `npm run blog:handoff:smoke`

## Example workflow

```bash
# 1) Validate collaborator submission
npm run blog:handoff:validate -- scripts/blog-handoff/samples/valid-collaborator-handoff.md

# 2) Dry-run import
npm run blog:handoff:import -- scripts/blog-handoff/samples/valid-collaborator-handoff.md

# 3) Write output to data/blog/<slug>.mdx
npm run blog:handoff:import -- scripts/blog-handoff/samples/valid-collaborator-handoff.md --write
```

## Importer validation behavior

- Required metadata: `slug`, `title`, `summary`
- `date`: uses submission value when present, or can default from `--scheduled-month YYYY-MM` as `YYYY-MM-15`
- `lastmod`: defaults to `date` when omitted
- Slug normalization:
  - lowercase ASCII
  - punctuation/whitespace converted to `-`
  - repeated `-` collapsed
  - trimmed to max 80 chars
  - fallback: `untitled-post-YYYYMMDD`
- Summary must be plain text, 1-2 sentences, max 180 characters

## Pre-publish checklist (required)

Before publish, confirm all checks in `docs/runbooks/templates/blog-publish-checklist.md` are complete, including:

1. Metadata checks
- Title/H1 match, summary limits, slug normalization, publish date accuracy.

2. Content checks
- Placeholder replacement complete, links/images valid, no TODO/TBD/lorem text.

3. Publish checks
- Correct path in `data/blog/<slug>.mdx`, social/OG coverage verified, owner sign-off complete.

4. Distribution checks
- Announce channels, owners, and timing set.
- Backpost attribution/canonical details explicitly confirmed.

## Output and post-import steps

- Post output path: `data/blog/<slug>.mdx`
- Image path convention: `public/static/images/<slug>/...`

After import, manually resolve placeholders:

1. Replace each `[[IMAGE: ...]]` with a final image reference under `public/static/images/<slug>/`.
2. Replace each `[[MERMAID: ...]]` with a reviewed Mermaid code block.
