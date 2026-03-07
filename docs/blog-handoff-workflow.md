# Blog Content Handoff and Import Workflow

This workflow is for importing collaborator-provided blog content into `data/blog/*.mdx` without editorial rewriting.

## Scope

- Collaborator submits exactly one markdown document using a strict handoff contract.
- Technical import performs validation and formatting/path conversion only.
- No semantic rewriting of article content is allowed in this workflow.

## Collaborator Handoff Contract

The submission must begin with this metadata marker block, then markdown body:

```md
===METADATA===
slug: "your-slug"
title: "Your Post Title"
date: "YYYY-MM-DD"
lastmod: "YYYY-MM-DD"
summary: "1-2 plain-text sentences, <= 180 chars."
===END_METADATA===
# Your Post Title
...
```

Rules:

- Exactly one markdown document.
- Body starts with H1 and must match metadata title exactly: `# <same title>`.
- No frontmatter (`---`), no HTML/JSX tags, no tags section.
- No `TODO`, `TBD`, or `lorem` placeholders.
- Preserve meaning, voice, and paragraph order; only light readability formatting is allowed.

## Metadata Validation Rules

- Required: `slug`, `title`, `summary`.
- `date`:
  - Use artifact date when present.
  - If missing, importer can default with `--scheduled-month YYYY-MM` to `YYYY-MM-15`.
- `lastmod`:
  - Defaults to `date` if missing.
- Slug normalization target:
  - lowercase
  - ASCII only
  - punctuation/whitespace to `-`
  - collapse repeated `-`
  - trim leading/trailing `-`
  - max 80 chars
  - fallback: `untitled-post-YYYYMMDD` when empty after normalization
- Summary:
  - plain text only
  - 1-2 sentences
  - max 180 characters

## Visual Placeholder Rules

Only these placeholders are allowed, each on its own line:

- `[[IMAGE: short-description]]`
- `[[MERMAID: short-description]]`

Do not include real image files or Mermaid code in collaborator handoff.

## Import Tool

Script: `scripts/blog-handoff-import.mjs`

NPM commands:

- `npm run blog:handoff:validate -- <input.md>`
- `npm run blog:handoff:import -- <input.md> [--write] [--force]`
- `npm run blog:handoff:smoke`

Examples:

```bash
# Validate only
npm run blog:handoff:validate -- scripts/blog-handoff/samples/valid-collaborator-handoff.md

# Validate + dry-run import path resolution
npm run blog:handoff:import -- scripts/blog-handoff/samples/valid-collaborator-handoff.md

# Write output file to data/blog/<slug>.mdx
npm run blog:handoff:import -- scripts/blog-handoff/samples/valid-collaborator-handoff.md --write
```

## Current Blog Structure Integration

- Post source output path: `data/blog/<slug>.mdx`
- Image path convention: `public/static/images/<slug>/...`

Deferred mapping step for placeholders (manual, out of this issue's automation scope):

1. Resolve each `[[IMAGE: ...]]` placeholder to a real image file under `public/static/images/<slug>/`.
2. Replace placeholder lines in MDX with the agreed markdown/MDX image usage pattern.
3. For `[[MERMAID: ...]]`, author final Mermaid code block after technical review.

## Collaborator Submission Prompt

Prompt text for collaborators lives in `docs/blog-collaborator-submission-prompt.md`.

