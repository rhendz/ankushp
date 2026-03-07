# Newsletter API Observability Runbook

This runbook explains the structured logs emitted by `app/api/newsletter/route.ts`.

## Log format

All newsletter API logs are emitted with a stable prefix and JSON payload:

- Prefix: `[newsletter-api]`
- Fields:
  - `event`: event name
  - `provider`: configured provider name or `null`
  - `configured`: whether provider + required env are configured
  - `errorCategory`: one of `provider`, `missing-config`, `api-failure` (present on failures)
  - `errorCode`: stable diagnostic code (present on failures)
  - `responseStatus`: HTTP status returned to client

Logs intentionally exclude secrets and user-provided email values.

## Event reference

- `newsletter.get.available`: GET health/status check confirms configuration is usable.
- `newsletter.get.unavailable`: GET status shows provider is unavailable or misconfigured.
- `newsletter.post.received`: POST subscribe request reached API.
- `newsletter.post.success`: subscription succeeded.
- `newsletter.post.already-subscribed`: provider reported duplicate email.
- `newsletter.post.failed`: subscribe request failed.

## Error categories and codes

- `provider`
  - `NEWSLETTER_PROVIDER_UNAVAILABLE`: provider is missing/unsupported.
  - `NEWSLETTER_EMAIL_REQUIRED`: request payload omitted email.
- `missing-config`
  - `NEWSLETTER_NOT_CONFIGURED`: provider exists but required env vars are missing.
- `api-failure`
  - `NEWSLETTER_PROVIDER_API_ERROR`: provider request failed (network or provider HTTP error).
  - Provider-specific API codes may appear in `errorCode` when safely available.

## Manual verification checklist

1. Configured success path
- Set valid provider env vars.
- `GET /api/newsletter` should log `newsletter.get.available`.
- `POST /api/newsletter` with valid email should log `newsletter.post.received` then `newsletter.post.success`.

2. Missing provider / unsupported provider path
- Set `siteMetadata.newsletter.provider` to an unsupported value.
- `GET /api/newsletter` should log `newsletter.get.unavailable` with `errorCategory=provider`.
- `POST /api/newsletter` should log `newsletter.post.failed` with `errorCode=NEWSLETTER_PROVIDER_UNAVAILABLE`.

3. Missing env configuration path
- Use a supported provider but remove required env vars.
- `GET /api/newsletter` should log `newsletter.get.unavailable` with `errorCategory=missing-config`.
- `POST /api/newsletter` should log `newsletter.post.failed` with `errorCode=NEWSLETTER_NOT_CONFIGURED`.

4. Provider API failure path
- Keep provider configured but force provider failure (invalid provider key or temporary outage).
- `POST /api/newsletter` should log `newsletter.post.failed` with `errorCategory=api-failure` and `responseStatus>=400`.
