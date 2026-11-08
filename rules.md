# rules.md — Test automation rules (Playwright + TypeScript)

Reusable rule set. Give this file to the AI assistant at the start of any new automation project and replace the project-specific values in section 12.

## 1. Architecture
- Strict split between layers; nothing in `tests/` talks to the browser or HTTP directly.
  ```
  src/api/        ApiClient + DTO types (no browser code)
  src/ui/pages/   Page Object Model (no HTTP code)
  src/fixtures/   Playwright fixtures that wire api + ui together (hybrid flows)
  src/config/     environment resolution
  src/utils/      logger, helpers
  tests/api/      *.api.spec.ts  (request context only, no `page`)
  tests/ui/       *.ui.spec.ts   (browser; may use the `api` fixture for setup/teardown)
  tests/data/     static test data (JSON)
  scripts/        maintenance/reporting tooling run by humans or CI (NOT tests, NOT wrappers)
  docs/           plan, strategy, evidence
  ```
- Playwright projects mirror the split: `api`, `ui-chromium`, `ui-webkit`. A spec lives in exactly one layer.
- Page objects: one class per page, extend `BasePage`, expose locators as getters, actions as `async` methods, assertions as `assert*/expect*` methods. No `expect` in specs for page-internal details that a page method can own.

## 2. Locator hierarchy (in order)
1. `getByRole` (with name) 2. `getByLabel` 3. `getByPlaceholder` 4. `getByText` 5. `getByTestId`
6. CSS/XPath — **fallback only**, with a comment explaining why nothing above works.
Never: positional selectors (`nth-child`), auto-generated class names.

## 3. Test data
- Unique per test: `${title}-${Date.now()}-${random}`; never rely on data from another test.
- Static inputs in `tests/data/*.json`; secrets only from env (`.env.<TEST_ENV>` / CI secrets), never committed.
- **No junk left behind.** Anything a test creates is deleted by the fixture teardown (`api.cleanup()` deletes tracked ids/titles). Never "delete all" in tests — the account is shared by parallel workers.
- `npm run cleanup` resets the sandbox after an aborted run.

## 4. Hybrid approach
- Prefer API for **setup and teardown**, UI only for the behaviour under test.
- Authenticate through the API once and inject the bearer token into the browser (`authedPage` fixture) instead of typing credentials in every UI test. Exactly one UI test exercises the real login form per browser.
- Analyse network: UI tests log XHR/fetch timings; requests slower than `SLOW_REQUEST_MS` are collected and reported (annotation + assertion in the performance test).

## 5. Coding standards
- Files: PascalCase for classes (`LoginPage.ts`), camelCase for functions, `kebab/lower` for specs: `<feature>.<layer>.spec.ts`.
- Test titles start with the plan id: `TC-011: title is required`.
- One behaviour per test; arrange via API, act via UI, assert on user-visible outcome.
- Assertions: web-first only (`await expect(locator).toBeVisible()`); no `waitForTimeout`, no `force: true`, no `test.skip` in committed code.
- Timeouts: test 30 s, expect 5 s, action 10 s (set in config, not per test). Retries: 1 on CI, 0 locally. Fix flakiness at the root; do not raise timeouts to hide it.
- Errors: API client throws with status and body; negative tests use `send()` which never throws.
- Types: `strict` TypeScript, no `any`, no unused variables.

## 6. Static analysis
- ESLint (`typescript-eslint` + `eslint-plugin-playwright`) and `tsc --noEmit` must pass: `npm run lint && npm run typecheck`. Both run first in CI and block the test job.

## 7. Logging
- Every API call is logged by `ApiClient.send()` (method, url, status, duration, request/response body) to `reports/logs/api-worker<N>.log`.
- Every UI XHR/fetch is logged by the overridden `page` fixture to `reports/logs/ui-worker<N>.log`.
- JSON lines, one file per worker. Secrets (`authorization`, `password`, `token`, `refreshToken`) are redacted.

## 8. Environments
- `TEST_ENV` selects the environment (default `qa`); `.env.<TEST_ENV>` then `.env` are loaded; real env vars/CI secrets win. `BASE_URL` / `API_URL` override URLs.
- Add an environment by adding its URL to `src/config/env.ts` (or set `BASE_URL`).

## 9. Reporting
- Reporters: `list`, `html` → `reports/html-report`, `junit` → `reports/junit/results.xml`.
- Video `on` for UI projects, screenshots + traces on failure, all under `reports/test-results`.
- **Never pass `--reporter` on the CLI** — it replaces the reporters (and their output paths) from the config. That mistake produced an empty `reports/html-report` and the CI error "No files were found".
- CI publishes the whole `reports/` folder as one artifact with `if-no-files-found: error`.
- `reports/` is git-ignored: no generated data in the repository. A curated MP4 and screenshots go to `docs/evidence/`.

## 10. CI/CD
- Pipeline: install → typecheck + lint → install browsers → test (parallel, 2 browsers + API) → publish artifact (`if: always()`).
- Triggers: push/PR, manual (`workflow_dispatch` with `test_env`), nightly cron.
- Credentials via CI secrets `TEST_EMAIL`, `TEST_PASSWORD`.

## 11. Definition of done for a new test
Plan id assigned → correct layer/folder → semantic locators → unique data → cleanup registered → lint/typecheck green → passes on both browsers (UI) in parallel.

## 12. Project-specific values (replace for a new project)
- App: QA Sandbox, `https://qa-sandbox.ni.htec.rs`; API under `/api`; login `POST /candidate/login`; resource `/candidate/testcases`.
- Token storage key used by the SPA: `AUTH_STORAGE_KEY` (default `jwtSandboxToken`, refresh token `jwtSandboxRefreshToken`) — verify in DevTools → Application → Local Storage.

## 13. Reusable prompts
- **Scaffold:** "Read rules.md and docs/TEST_PLAN.md. Scaffold the framework exactly with that layout, then implement the tests for plan ids X–Y in the correct layer."
- **Review:** "Check the diff against rules.md sections 1–5 and list violations only."
- **Debug CI artifacts:** "Here is the workflow log and playwright.config.ts. Explain why the artifact path is empty and where each reporter writes."
