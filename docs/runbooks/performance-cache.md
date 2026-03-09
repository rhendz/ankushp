# Performance Cache Runbook

This runbook defines the response-cache strategy for high-traffic content routes.

## Goal

Reduce repeat-request latency (especially TTFB) for public content routes while keeping content freshness acceptable.

## Current Policy

The following routes send:

`Cache-Control: public, s-maxage=600, stale-while-revalidate=86400`

- `/`
- `/about`
- `/blog`
- `/blog/posts`
- `/blog/posts/:path*`
- `/blog/tags`
- `/blog/tags/:path*`
- `/sitemap.xml`
- `/robots.txt`

## Why

- `s-maxage=600`: edge cache can serve for 10 minutes before revalidation.
- `stale-while-revalidate=86400`: stale responses can be served while cache refresh happens in background.

This helps smooth latency spikes and cold starts for public pages.

## Verify

Run:

```bash
curl -I https://ankushp.com/
curl -I https://ankushp.com/blog
curl -I https://ankushp.com/blog/posts/the-missing-layer-in-your-ai-stack-intermediate-knowledge
```

Confirm `Cache-Control` matches the policy above.

## Rollback

Revert the `contentCacheHeaders` additions in `next.config.js` and redeploy.
