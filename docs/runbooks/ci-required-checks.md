# CI Required Checks Runbook

This runbook documents pull request checks and local verification workflow.

## Workflows

- Required checks workflow: `.github/workflows/required-checks.yml`
- Playwright smoke workflow: `.github/workflows/playwright-smoke.yml`

## Required checks

`required-checks.yml` runs these jobs on pull requests:

- `lint`: `npm run lint`
- `build`: `npm run build`
- `test`: `npm run test` only when a `test` script exists in `package.json`

## Playwright smoke checks

`playwright-smoke.yml` runs:

- `npm ci`
- `npx playwright install --with-deps chromium`
- `npm run test:smoke:ci`

## Local verification

Run these commands before requesting review:

```bash
npm run lint
npm run build
npm run test
npm run test:smoke
```

If `npm run test` is not defined in `package.json`, skip it and verify smoke tests instead.

## Branch protection baseline

For `main`, require these status checks:

- `lint`
- `build`
- `test`
