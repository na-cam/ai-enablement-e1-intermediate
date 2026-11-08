# QA Sandbox — Playwright UI + API test suite

TypeScript + Playwright. Rules for the project: [rules.md](rules.md). Test plan: [docs/TEST_PLAN.md](docs/TEST_PLAN.md). Strategy: [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md). Prompt history: [docs/PROMPT_HISTORY.md](docs/PROMPT_HISTORY.md).

## Setup
Requires Node.js 20+.
```bash
npm install
npx playwright install chromium webkit
cp .env.example .env      # then fill in TEST_EMAIL / TEST_PASSWORD
```

## Structure
| Path | Purpose |
|---|---|
| `tests/api/` | API tests (`*.api.spec.ts`), no browser |
| `tests/ui/` | UI tests (`*.ui.spec.ts`), incl. hybrid flows |
| `tests/data/` | static test data |
| `src/api/` | `ApiClient` (logging, timing, tracked cleanup) |
| `src/ui/pages/` | Page Object Model |
| `src/fixtures/` | `api`, `anonApi`, `authedPage` (bearer token injected), network logging |
| `src/config/` | environment selection |
| `scripts/` | maintenance/reporting tools (`cleanup-test-data.ts`, `make-evidence-video.mjs`) |
| `reports/` | generated, git-ignored: HTML, JUnit, videos, traces, logs |
| `docs/evidence/` | curated proof: MP4 of a run, prompt-count image |

## Run
```bash
npm test                  # everything (parallel): ui-chromium, ui-webkit, api
npm run test:ui           # UI on both browsers
npm run test:api          # API only
npm run test:chromium     # one browser
npm run report            # open the HTML report (reports/html-report)
npm run lint && npm run typecheck
npm run cleanup           # delete all test cases on the account (maintenance)
npm run evidence:video    # build docs/evidence/test-run.mp4 from the last run's videos
```
Other environment: `TEST_ENV=staging BASE_URL=https://... npm test` (or a `.env.staging` file).

## Reports and logs
After a run, everything is under `reports/`:
- `html-report/index.html` — open with `npm run report` (includes video, screenshots, traces per test; always open through this command or serve the whole folder, not the lone `index.html`)
- `junit/results.xml`
- `test-results/` — videos (`.webm`), traces, screenshots
- `logs/api-worker*.log`, `logs/ui-worker*.log` — every API call and UI XHR/fetch (redacted JSON lines)

## CI/CD
- GitHub Actions: [.github/workflows/ci.yml](.github/workflows/ci.yml) — lint/typecheck → tests → uploads artifact **playwright-report** (the whole `reports/` folder). Triggers: push/PR, manual, nightly 01:00 UTC.
- Azure DevOps: [azure-pipelines.yml](azure-pipelines.yml) — same flow plus nightly schedule.
- Add repository secrets `TEST_EMAIL` and `TEST_PASSWORD` (Settings → Secrets and variables → Actions).

### Why the earlier run had no artifact
`test:ci` passed `--reporter=list,junit,html` on the CLI, which overrides the reporters in `playwright.config.ts` including their output paths. The HTML went to the default `playwright-report/`, while the workflow uploaded the empty `reports/html-report`. Fixed by removing the CLI override and uploading the single `reports/` folder with `if-no-files-found: error`.
