# Website v2 — issue #105

Date: 2026-10-10. Base: `46f1730` (main). Branch: `ap/feat-website-v2`.

## Intent and content provenance

The homepage now explains Ankush's specialty, shows two selected work summaries,
links three existing technical essays, and offers explicit work/contact paths.
The responsive hero pairs the introduction with a coral contour sculpture.

- Meta and Spice Cloud Labs summaries come from `data/authors/default.mdx`.
  They describe contributions without promoting the biography's self-reported
  metrics into new headline claims. Full case studies still need author-supplied
  decisions, constraints, and outcome evidence.
- The [UT Engineering Potify feature](https://tickle.utk.edu/news/ut-students-develop-app-aimed-at-warning-city-about-potholes/)
  names Ankush as a developer and describes work orders, mapping, and beta testing.
  It does not establish citywide deployment. Home and About use the supported
  development description rather than claiming municipal adoption.
- Blog URLs are unchanged. Work and Contact use homepage anchors, reachable from
  all primary navigation, including blog pages.
- No new dependencies, analytics providers, or hosting configuration were added.
  Professional-intent measurement remains a follow-up under existing issue #89.

## Blob behavior

The server-rendered SVG contour form is visible before JavaScript, during dynamic
loading, when reduced motion is requested, and if WebGL initialization, shader
compilation, or context loss prevents rendering. The canvas replaces it only after
a successful render. The visual is decorative; text and contact do not depend on it.

The new shader uses broad deformation, shaded surfaces, and antialiased contour
lines. Pointer influence is bounded and applies only to fine pointers; touch
scrolling and pinch zoom retain browser defaults. Pause/resume stops actual
rendering. Frame-rate-independent motion stops offscreen and in hidden documents.
Theme changes update uniforms without recreating the renderer. Compact scenes use
lower geometry detail and a lower DPR cap. Resources are disposed on unmount.

## Validation

Passed locally:

- `npm run lint`
- `npm run typecheck`
- `npm run build` (41 routes)
- `npm run test` (25 tests)
- `npm run test:smoke:ci` (12 tests, no retries on the final run)
- `HOME_VISUAL_HEALTH_URL=http://127.0.0.1:4175 npm run health:home-visual`

New smoke checks cover the work → essay → contact journey; real shader rendering;
pixel stability while paused and movement after resume; renderer identity across
theme changes; reduced motion; 320px mobile navigation/overflow; WebGL creation
failure; real context loss; and useful content without JavaScript. WebGL tests
explicitly enable SwiftShader in the isolated headless test browser.

The health script now requires a visible initialized canvas or fallback instead of
merely collecting element counts. Its default local headless configuration used
the static fallback successfully. The local production server cannot serve Vercel's
`/_vercel/speed-insights/script.js`; this produces a known 404/MIME console message,
not a page runtime exception. The software-WebGL evidence captures had no page errors.

Inspected final light/dark desktop and mobile screenshots. The final 320px, 375px,
and 1440px captures have no horizontal overflow. Native-device GPU/battery behavior,
Safari, and real-user Core Web Vitals have not been measured in this change.

## Production-build comparison

A fresh local production build was captured before changes and again afterward.
Each run uses a fresh browser context, the same Chromium version, local HTTP,
software WebGL, and no CPU/network throttling. Three runs per viewport/theme.
The capture waits for network idle and another 1.5 seconds before reading buffered
PerformanceObserver entries. These are short local load measurements, not
Lighthouse scores or field performance; INP and sustained GPU frame rates are not
measured. Small millisecond differences should not be treated as improvements or
regressions in real-user experience.

| Viewport/theme | Before median FCP/LCP | After median FCP/LCP | After CLS, all runs |
| -------------- | --------------------: | -------------------: | ------------------: |
| 1440px light   |            72 / 72 ms |           64 / 64 ms |                   0 |
| 1440px dark    |            60 / 60 ms |           64 / 64 ms |                   0 |
| 375px light    |            60 / 60 ms |           60 / 60 ms |                   0 |
| 320px dark     |            56 / 56 ms |           60 / 60 ms |                   0 |

Same-origin resource transfer totals (excluding the navigation document) were
approximately 864 KB before and 866 KB after, including fonts and prefetched
resources. Reserving theme-control dimensions removed the hydration layout shift
seen in the initial v2 capture.

Reproduce against a local production server:

```sh
npm run build
npm run serve -- --hostname 127.0.0.1 --port 4175
# In another terminal, from the repository root:
node docs/perf/evidence/issue-105/capture.mjs after
```

The capture writes ignored artifacts under `output/website-v2/`. Retained data:
[before metrics](./evidence/issue-105/before-metrics.json) and
[after metrics](./evidence/issue-105/after-metrics.json).

## Visual evidence

Before, dark desktop:

![Before: name and role over the original blob](./evidence/issue-105/before-desktop-dark.png)

After, dark desktop:

![After: proposition and contact beside the contour blob](./evidence/issue-105/after-desktop-dark.png)

After, light desktop:

![After in light mode](./evidence/issue-105/after-desktop-light.png)

[Full mobile page](./evidence/issue-105/after-mobile-light.png)

## Risk and rollback

Medium risk: new visual art direction and WebGL lifecycle behavior. Server-rendered
content and a static visual cover failures. Existing routes, APIs, and data remain
compatible. Revert the PR to restore the previous presentation; no migration or
credential changes are involved. This change does not merge or deploy production.
