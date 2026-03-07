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

## Required CI checks

This repository enforces pull request quality checks through GitHub Actions in `.github/workflows/required-checks.yml`.

Checks run on every pull request:

- `lint`: runs `npm run lint`
- `build`: runs `npm run build`
- `test`: runs `npm run test` only when a `test` script exists in `package.json`

### Branch protection setup

To enforce clear pass/fail gates before merge, configure GitHub branch protection for `main` with these required status checks:

- `lint`
- `build`
- `test`
