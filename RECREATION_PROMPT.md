# Recreation prompt

Use this with an AI coding assistant to rebuild the project from scratch. Give it [rules.md](rules.md) and [docs/TEST_PLAN.md](docs/TEST_PLAN.md) first.

> Build a Playwright + TypeScript test suite for https://qa-sandbox.ni.htec.rs (login and Test Cases management), following rules.md exactly.
>
> **Structure:** `tests/api/*.api.spec.ts`, `tests/ui/*.ui.spec.ts`, `tests/data/`, `src/api` (ApiClient, types), `src/ui/pages` (POM: BasePage, LoginPage, TestCasesPage), `src/fixtures`, `src/config/env.ts`, `src/utils/logger.ts`, `scripts/` (maintenance tools only), `docs/`.
> **Projects:** `api`, `ui-chromium`, `ui-webkit`, parallel. Reporters set only in `playwright.config.ts` (HTML → reports/html-report, JUnit → reports/junit, videos on, output in reports/test-results); never use `--reporter` on the CLI.
> **API:** login `POST /api/candidate/login` (returns token + refreshToken), `/api/candidate/testcases` CRUD. ApiClient logs every call (redacted), tracks created ids, treats 404 on delete as success.
> **Hybrid:** fixtures `api` (logged in, auto cleanup), `anonApi`, `authedPage` (token injected into localStorage keys `jwtSandboxToken` and `jwtSandboxRefreshToken`), page override that logs XHR/fetch and flags slow requests.
> **Tests:** at least 30 cases with plan ids (TC-xxx): login positive/negative, token security, create/edit/delete, required-field validation, API contract, performance budget, hybrid network check. Unique data per test, no "delete all".
> **Tooling:** ESLint (typescript-eslint + eslint-plugin-playwright), `tsc --noEmit`, `TEST_ENV` for multiple environments.
> **CI:** GitHub Actions + Azure Pipelines: typecheck + lint, install browsers, run tests, upload the whole `reports/` folder (`if-no-files-found: error`), nightly cron, secrets `TEST_EMAIL` / `TEST_PASSWORD`.
> **Docs:** README with run instructions, TEST_PLAN, TEST_STRATEGY, PROMPT_HISTORY.
