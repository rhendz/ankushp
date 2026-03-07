# Blog Content Handoff Runbook

This runbook covers importing collaborator-provided blog content into `data/blog/*.mdx` without editorial rewriting.

## Scope

- Collaborator submits exactly one markdown document.
- Technical import handles validation and path/format normalization only.
- Semantic rewriting of the article is out of scope.

## Canonical collaborator contract

Use this prompt as the single source of truth for contributor submission format:

- `docs/runbooks/templates/blog-collaborator-submission-prompt.md`

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

## Output and post-import steps

- Post output path: `data/blog/<slug>.mdx`
- Image path convention: `public/static/images/<slug>/...`

After import, manually resolve placeholders:

1. Replace each `[[IMAGE: ...]]` with a final image reference under `public/static/images/<slug>/`.
2. Replace each `[[MERMAID: ...]]` with a reviewed Mermaid code block.
