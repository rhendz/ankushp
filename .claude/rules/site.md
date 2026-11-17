# Site rules

- **Public repository.** Code, plans, reviews, commits and pull request text are public. No secrets,
  tokens, account ids, `.env` files or private details, anywhere.
- **main deploys.** A merge into `main` goes to production. The developer merges.
- **Checks:** `bash scripts/pipeline-check.sh test` (vitest) and `bash scripts/pipeline-check.sh lint`
  run locally with no network and no browser. Typecheck, `npm run build` and the Playwright smoke run
  in GitHub Actions on the pull request. A check that did not run is not a pass.
- **Dependencies** change only when the plan names the package and version; `package.json` and
  `package-lock.json` change together.
- **Looks are the developer's call.** Nothing in the pipeline renders a page; say which routes to look at.
- **Commits and pull request titles:** `feat|bug|chore: <short description>`, explicit paths, never
  `git add -A`. A pipeline pull request's title starts with its job key (`P1H-123: ...`).
