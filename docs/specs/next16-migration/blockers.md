# Next.js 16 Migration Blockers

## Active blocker: static prerender crash on MDX routes

- Tracking issue: #90
- Symptom: `npm run build` fails with `ReactCurrentDispatcher` undefined when removing temporary dynamic fallbacks from MDX-backed routes.
- Affected routes:
  - `/about`
  - `/blog/posts/[...slug]`

## Current stabilization state

- Temporary fallback remains in place to keep build green:
  - `export const dynamic = "force-dynamic"` in the two affected routes.
- Baseline migration remains merged and passing with fallback enabled.

## Required follow-up to close migration

1. Identify and fix root incompatibility in MDX render path under Next.js 16 static prerender.
2. Remove temporary `force-dynamic` flags.
3. Confirm `npm run lint`, `npm test`, and `npm run build` pass.
4. Smoke-check `/about` and multiple `/blog/posts/[slug]` pages.

## Related work

- Outcome planning issue for post-migration analytics investigation: #89.
