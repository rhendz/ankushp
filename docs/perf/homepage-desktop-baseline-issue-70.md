# Desktop Homepage Perf Baseline (`/`) - Issue #70 (BEA-1)

Date: 2026-03-09  
Owner: @ankushp  
Scope: desktop route `/` baseline for follow-on issues #69 and #71.

## Method

- Build + serve production app locally (`next build` + `next start --port 3000`).
- Run 3 Lighthouse desktop passes against `http://127.0.0.1:3000/`.
- Use median of 3 runs as baseline.
- Sample window (UTC): `2026-03-09T08:07:54Z` to `2026-03-09T08:08:20Z`.

Commands used:

```bash
npm run build
npm run serve -- --port 3000
npx -y lighthouse http://127.0.0.1:3000/ --preset=desktop --output=json --output=html --output-path=docs/perf/evidence/issue-70/lighthouse-desktop-run-<n> --quiet --chrome-flags='--headless=new --no-sandbox'
```

## Baseline Metrics (Desktop `/`)

| Metric | Run 1 | Run 2 | Run 3 | Baseline (Median) |
|---|---:|---:|---:|---:|
| FCP (ms) | 599.0 | 212.4 | 331.7 | **331.7** |
| LCP (ms) | 1418.8 | 1132.4 | 1170.7 | **1170.7** |
| TTFB (ms) | 81.0 | 5.0 | 4.0 | **5.0** |
| RES (ms)
(defined here as Lighthouse Speed Index proxy) | 668.5 | 212.4 | 331.7 | **331.7** |

Notes:
- `RES` is tracked as a render-speed proxy (`Speed Index`) for this baseline run so #69/#71 have an explicit numeric gate.
- Run 1 is a warmer/cold-start outlier versus runs 2-3; median is used to stabilize baseline.

## Top Bottlenecks Identified

1. Large route payload on `/`.
   - Lighthouse total transfer size is ~`1,236 KiB`.
2. Significant unused JavaScript on initial desktop load.
   - Estimated savings: ~`241 KiB`.
3. One render-blocking CSS request in critical path.
   - `/_next/static/css/ddb6f57988626c71.css`.

## Success Thresholds for Follow-On Issues

## Issue #69 (`feat: homepage shell + deferred 3D loading`)

Pass:
- FCP <= `260 ms` (>= 20% better than 331.7 ms baseline).
- LCP <= `935 ms` (>= 20% better than 1170.7 ms baseline).
- RES (proxy) <= `265 ms` (>= 20% better than 331.7 ms baseline).
- No visual regression in final hero state after deferred content settles.

Fail:
- Any of FCP/LCP/RES misses target by >5%.
- New CLS/INP regressions observed in post-change checks.

## Issue #71 (`chore: server path and caching`)

Pass:
- TTFB median <= `4 ms` (improvement from 5.0 ms baseline).
- P95 TTFB trend (Speed Insights when available) <= `100 ms` for desktop `/`.
- Caching strategy for `/` documented with expected cache behavior and invalidation notes.

Fail:
- TTFB median worsens above baseline (`>5 ms`) after caching/server-path changes.
- Unexplained variance spikes across sequential runs.

## Evidence

- Raw run summary CSV: `docs/perf/evidence/issue-70/lighthouse-desktop-summary.csv`
- Lighthouse desktop run 1: `docs/perf/evidence/issue-70/lighthouse-desktop-run-1.report.html`
- Lighthouse desktop run 2: `docs/perf/evidence/issue-70/lighthouse-desktop-run-2.report.html`
- Lighthouse desktop run 3: `docs/perf/evidence/issue-70/lighthouse-desktop-run-3.report.html`
- Desktop route screenshot: `docs/perf/evidence/issue-70/homepage-desktop.png`

## Follow-up Checklist

- Attach a Vercel Speed Insights screenshot/link for desktop `/` (FCP/LCP/TTFB/RES) to issue #70.
- Re-run this exact baseline flow after #69 and #71 to compare against gates above.
