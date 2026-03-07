# ankushp.com

## Playwright Smoke Tests

Run the critical blog smoke suite locally (headless):

```bash
npm run test:smoke
```

Run it locally with a visible browser:

```bash
npm run test:smoke:headed
```

CI command used in GitHub Actions:

```bash
npm run test:smoke:ci
```

CI installs Chromium with:

```bash
npx playwright install --with-deps chromium
```

## Operations runbooks

For operator/workflow guidance (CI checks, newsletter API observability, and content handoff), use:

- `docs/runbooks/README.md`
