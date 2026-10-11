# Website v2 — issue #105

Date: 2026-10-10. Base: `46f1730` (main). Branch: `ap/feat-website-v2`.

## Intent and content provenance

The homepage now explains Ankush's specialty, shows two selected work summaries,
links three existing technical essays, and offers explicit work/contact paths.
The responsive hero pairs the introduction with a luminous blue/violet/cyan blob.

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

The server-rendered SVG form is visible before JavaScript, during dynamic
loading, when reduced motion is requested, and if WebGL initialization, shader
compilation, or context loss prevents rendering. The canvas replaces it only after
a successful render. The visual is decorative; text and contact do not depend on it.

The shader evaluates two octaves of rotating flow noise on the GPU. Analytic noise
derivatives produce the deformed surface normal without neighboring noise samples
or CPU geometry updates. One indexed mesh and one draw call produce the surface,
specular lighting, and Fresnel rim; a static CSS gradient supplies the halo. There
are no render targets, bloom passes, textures, or new runtime dependencies.

Desktop geometry uses 6,016 triangles and compact geometry 2,976, compared with
48,020 in the original mesh and 27,380 / 12,500 in the first v2 iteration. Fewer
triangles alone do not establish a speedup: the new vertex shader does more work
per vertex. Actual draw cadence measurements are recorded below.

Pointer influence uses an exact critically damped spring and a localized surface
pull, including its derivative in the lighting. Touch keeps native scrolling.
Animation uses elapsed frame time. Pause, offscreen, and document-hidden states
stop the frame loop. Theme changes update a uniform without recreating the renderer.
DPR is capped at 1.75 desktop / 1.5 compact, bounded by device DPR. Sustained slow
frames reduce resolution in 0.25 steps to 1; recovery requires a longer stable
window and cooldowns prevent frequent buffer reallocations. Cancellable idle-time shader preparation
retains the poster until the first successful render. Resources are disposed on unmount.

Implementation references:

- [psrdnoise3, Stefan Gustavson and Ian McEwan](https://github.com/stegu/psrdnoise/blob/main/src/psrdnoise3.glsl): vendored with the full MIT notice in `components/home/shaders/psrdnoise.ts`.
- [Exact damped springs](https://www.ryanjuckett.com/damped-springs/): timestep-independent interaction.
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html): shader preparation and drawing-buffer control.
- [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices): bounded rendering cost and resource lifecycle.

## Validation

Passed locally:

- `npm run lint`
- `npm run typecheck`
- `npm run build` (41 routes)
- `npm run test` (28 tests)
- `npm run test:smoke:ci` (13 tests passed; existing blog-navigation check needed one retry)
- `HOME_VISUAL_HEALTH_URL=http://127.0.0.1:4175 npm run health:home-visual`

New smoke checks cover the work → essay → contact journey; real shader rendering;
pixel stability while paused and movement after resume; zero draw submissions while
paused/offscreen and resumed submissions when visible; renderer identity across
theme changes; reduced motion; 320px mobile navigation/overflow; WebGL creation
failure; real context loss; and useful content without JavaScript. WebGL tests
explicitly enable SwiftShader in the isolated headless test browser.

The health script now requires a visible initialized canvas or fallback instead of
merely collecting element counts. Its default local headless configuration used
the static fallback successfully. The local production server cannot serve Vercel's
`/_vercel/speed-insights/script.js`; this produces a known 404/MIME console message,
not a page runtime exception. The software-WebGL evidence captures had no page errors.

Inspected final light/dark desktop and mobile screenshots. The final 320px, 375px,
and 1440px captures have no horizontal overflow. Native Metal rendering was measured
on this Mac; actual phones, battery behavior, Safari, and field Core Web Vitals remain
unmeasured.

## Production-build comparison

A fresh local production build was captured before changes and again afterward.
Each run uses a fresh browser context, the same Chromium version, local HTTP,
software WebGL, and no CPU/network throttling. Three runs per viewport/theme.
The capture waits for network idle and another 1.5 seconds before reading buffered
PerformanceObserver entries. These are short local load measurements, not
Lighthouse scores or field performance; INP is not measured. Animation cadence is
measured separately below. Small millisecond differences should not be treated as improvements or
regressions in real-user experience.

| Viewport/theme | Before median FCP/LCP | After median FCP/LCP | After CLS, all runs |
| -------------- | --------------------: | -------------------: | ------------------: |
| 1440px light   |            72 / 72 ms |           60 / 60 ms |                   0 |
| 1440px dark    |            60 / 60 ms |           60 / 60 ms |                   0 |
| 375px light    |            60 / 60 ms |           56 / 56 ms |                   0 |
| 320px dark     |            56 / 56 ms |           56 / 56 ms |                   0 |

Same-origin resource transfer totals (excluding the navigation document) were
approximately 864 KB before and 870 KB after, including fonts and prefetched
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

## Animation measurements

`scripts/blob-performance-check.mjs` instruments the blob's WebGL draw submissions
from the test browser, without adding application telemetry. Each of three scenarios
runs three times for ten seconds after a two-second warmup. Desktop is 1440×1000;
compact is a 375×812 viewport, both at device DPR 2. The compact scene is scrolled
into view. Pointer runs dispatch a circular movement pattern. These are intervals
between draw submissions, not GPU execution time; this implementation makes one
draw per rendered frame. Adaptive production quality remains enabled, with actual
buffer sizes recorded. This measures the complete production policy rather than
isolating shader ALU cost at fixed resolution.

Native runs use Chromium 145 with `--use-angle=metal`, verified as
**ANGLE Metal Renderer: Apple M2 Pro**. The first-v2 contour baseline is the deployed
preview at `8c14fc0`; the revised version is a local production build. Load times
are not compared across those hosts. Builds/tests were stopped during the animation
measurements. Both run on this shared workstation, not an isolated performance lab.

| Scenario        | Contour median p50 / p95 | Revised median p50 / p95 | Revised buffer |
| --------------- | -----------------------: | -----------------------: | -------------- |
| desktop-idle    |             8.3 / 9.8 ms |             8.3 / 9.6 ms | 833x833        |
| desktop-pointer |             8.3 / 9.8 ms |             8.3 / 9.1 ms | 833x833        |
| compact-idle    |             8.3 / 9.2 ms |             8.3 / 9.1 ms | 514x514        |

The revised version retained the same ~8.3 ms median cadence (about 120 Hz), with
no draw intervals over 50 ms in any native run. Resolution stayed at its initial
cap in every native run. This demonstrates smooth cadence on this GPU; it does
not establish lower GPU execution time or performance on a phone.

A separate SwiftShader comparison found a regression on desktop: median p50 draw
interval **18.9 → 41.6 ms** at idle, and **19.2 → 37.2 ms** with pointer movement.
Compact improved **42.5 → 20.0 ms**. The adaptive drawing buffer stepped down under
software-renderer pressure. These results are retained rather than presented as a
universal speedup. Software measurements used the same final steady-state shader,
mesh, and quality policy, before the startup lifecycle fix. Baseline desktop run 1
overlapped the end of validation work; baseline runs 2/3 did not. The report uses
medians but does not infer a hardware result from those software runs.

Reproduce native measurements on a Mac with Metal support:

```sh
BLOB_PERF_BACKEND=metal node scripts/blob-performance-check.mjs revised-metal
# Default backend exercises SwiftShader:
node scripts/blob-performance-check.mjs revised-software
```

Raw data: [Metal before](./evidence/issue-105/contour-metal.json),
[Metal after](./evidence/issue-105/revised-metal.json),
[SwiftShader before](./evidence/issue-105/contour-software.json),
[SwiftShader after](./evidence/issue-105/revised-software.json).

## Visual evidence

Before, dark desktop:

![Before: name and role over the original blob](./evidence/issue-105/before-desktop-dark.png)

After, dark desktop:

![After: proposition and contact beside the luminous blob](./evidence/issue-105/after-desktop-dark.png)

After, light desktop:

![After in light mode](./evidence/issue-105/after-desktop-light.png)

[Full mobile page](./evidence/issue-105/after-mobile-light.png)

## Risk and rollback

Medium risk: new visual art direction and WebGL lifecycle behavior. Server-rendered
content and a static visual cover failures. Existing routes, APIs, and data remain
compatible. Revert the PR to restore the previous presentation; no migration or
credential changes are involved. This change does not merge or deploy production.
