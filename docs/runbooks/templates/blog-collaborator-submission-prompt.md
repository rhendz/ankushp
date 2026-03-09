# Collaborator Blog Submission Prompt

Return exactly one markdown document for a blog post using this format.

Requirements:

- Start with metadata markers exactly as shown.
- Then provide the article body in markdown.
- Body must start with `# <same title>` as metadata title.
- Do not include frontmatter (`---`) or any HTML/JSX.
- Do not include a tags section.
- Do not include TODO/TBD/lorem placeholders.
- Keep meaning, voice, and paragraph order intact.
- Only light readability formatting is allowed.
- The handoff owner must also complete `docs/runbooks/templates/blog-publish-checklist.md`.

Template to follow:

```md
===METADATA===
slug: "your-slug"
title: "Your Post Title"
date: "YYYY-MM-DD"
lastmod: "YYYY-MM-DD"
summary: "1-2 plain-text sentences, max 180 chars."
===END_METADATA===
# Your Post Title

Your markdown body goes here.
```

If a visual is required, include only one of these placeholders on its own line:

- `[[IMAGE: short-description]]`
- `[[MERMAID: short-description]]`

Do not generate image files or Mermaid code.
