# Test Strategy - QA Sandbox Automation

## 1. Scope
UI and API automation of **Login** and **Test Cases management** for https://qa-sandbox.ni.htec.rs using Playwright + TypeScript. Detailed cases: [TEST_PLAN.md](TEST_PLAN.md). Working rules: [../rules.md](../rules.md).

## 2. Approach
- **Layers:** `tests/api` (request context, no browser) and `tests/ui` (browser). Page objects in `src/ui/pages`, API client in `src/api`.
- **Hybrid:** the API is used for setup, teardown and authentication. The bearer token is injected into the browser (`authedPage`), so UI tests skip the login form. One UI test per browser still uses the real login form.
- **Types:** smoke, regression, negative, security (missing/invalid token, wrong credentials), performance (API response budget, slow XHR detection in the browser).
- **Locators:** semantic first (`getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`); CSS/XPath only as a documented fallback.

## 3. Environments
`TEST_ENV` (default `qa`) selects `.env.<TEST_ENV>`; `BASE_URL`/`API_URL` override URLs. See `.env.example` and `.env.staging.example`. Credentials come from `.env` locally and from CI secrets (`TEST_EMAIL`, `TEST_PASSWORD`) in pipelines.

## 4. Test data and cleanup
- Unique titles (`<title>-<timestamp>-<random>`), static inputs in `tests/data/testData.json`.
- `ApiClient` tracks every test case it creates (by id) and UI-created ones (by title); the `api` fixture deletes them in teardown. Tests never delete "everything", because parallel workers share one account.
- `npm run cleanup` resets the account after an aborted run.
- Generated output (`reports/`) is git-ignored.

## 5. Execution
- `npm test` runs three projects in parallel: `ui-chromium`, `ui-webkit`, `api`.
- CI: 50% workers, 1 retry. Local: all cores, no retries.
- Timeouts: test 30 s, expect 5 s, action 10 s (config only).

## 6. Logging and reporting
- API calls and UI XHR/fetch calls are logged as JSON lines in `reports/logs/` (secrets redacted).
- HTML report (`reports/html-report`), JUnit (`reports/junit/results.xml`), videos/traces/screenshots (`reports/test-results`).
- Evidence for a failing case: `npm run demo:failure` runs an intentionally failing test (separate `demo-failure` project, never part of CI) and stores screenshot, video and trace in `docs/evidence/failure-demo/`.
- MP4 of a full run: `npm run evidence:video` → `docs/evidence/test-run.mp4`.

## 7. CI/CD
GitHub Actions (`.github/workflows/ci.yml`) and Azure Pipelines (`azure-pipelines.yml`): typecheck + lint → install browsers → tests → publish the whole `reports/` folder as artifact `playwright-report`. Triggers: push/PR, manual (`test_env` input), nightly 01:00 UTC.

Lesson learned: never pass `--reporter` on the command line; it overrides the reporters and output paths from `playwright.config.ts` and caused the original "No files were found" artifact error.

## 8. Quality gates
- ESLint (typescript-eslint + eslint-plugin-playwright) and `tsc --noEmit` must pass before tests run.
- All tests pass on both browsers; no skipped tests in committed code.

## 9. Risks
| Risk | Mitigation |
|---|---|
| Shared account used by parallel workers | id-based cleanup, unique titles |
| Sandbox slowness | API for setup, performance thresholds configurable (`SLOW_REQUEST_MS`) |
| UI changes | semantic locators, selectors confined to page objects |
| Unverified server behaviour (e.g. account lockout, duplicate titles) | listed as not automated in TEST_PLAN.md |
