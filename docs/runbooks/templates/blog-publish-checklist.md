# Blog Handoff + Pre-Publish Checklist

Use this checklist for every post before publish. Duplicate it into the issue/PR description and fill all required fields.

## Post Summary

- [ ] Post type selected: `Backpost` or `Net-new`
- [ ] Owner assigned
- [ ] Target publish date + timezone set

## Required Handoff Artifacts

- [ ] Manuscript included as one markdown file using `===METADATA===` format
- [ ] `npm run blog:handoff:validate -- <input.md>` passed
- [ ] Asset references provided for all `[[IMAGE: ...]]` / `[[MERMAID: ...]]` placeholders
- [ ] Distribution plan added with channels + owners

## Metadata Checks

- [ ] `slug` is lowercase ASCII and normalized
- [ ] `title` matches body H1 exactly
- [ ] `summary` is plain text, 1-2 sentences, <= 180 chars
- [ ] `date` is valid (`YYYY-MM-DD`)
- [ ] `lastmod` is valid (`YYYY-MM-DD`) and >= `date` when updates were made

## Content Readiness

- [ ] No frontmatter in collaborator handoff file
- [ ] No HTML/JSX tags in handoff body
- [ ] No tags section in body
- [ ] No TODO/TBD/lorem placeholders
- [ ] All placeholders resolved before publish
- [ ] External/internal links tested

## Post-Type Specific Checks

### Backpost

- [ ] Original URL recorded
- [ ] Original published date recorded
- [ ] Canonical strategy selected and verified
- [ ] Reuse rights confirmed for text/images/diagrams
- [ ] Attribution line reviewed (if required)

### Net-new

- [ ] Publish owner confirmed
- [ ] Primary CTA confirmed
- [ ] Distribution channels selected
- [ ] Distribution owner confirmed

## Publish and Distribution

- [ ] Final file exists at `data/blog/<slug>.mdx`
- [ ] Referenced images exist under `public/static/images/<slug>/`
- [ ] Publish announcement copy drafted
- [ ] Channel schedule set (for example: LinkedIn, X, newsletter)
- [ ] Post-publish check owner assigned

## Sign-off

- [ ] Content owner approved
- [ ] Technical reviewer approved
- [ ] Ready to publish
