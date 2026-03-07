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

CI also installs Chromium with:

```bash
npx playwright install --with-deps chromium
```
