# Playwright TypeScript Project

## Setup

```bash
npm install
npx playwright install
```

## Run Tests

```bash
npm test                # Run all tests
npm run test:headed     # Run with browser UI
npm run test:ui         # Run with Playwright UI mode
npm run report          # Show HTML report
```

## Project Structure

- `tests/pages/` - Page Object Models
- `tests/specs/` - Test specifications
- `tests/fixtures/` - Custom fixtures
- `tests/utils/` - Helper utilities
- `test-results/` - Test execution results
- `docs/` - Documentation

## Configuration

- Parallel execution enabled
- Retry on failure (1x locally, 2x in CI)
- Browsers: Chromium, Firefox, WebKit
- Reporters: HTML + JUnit
- Captures: Screenshots, videos, traces on failure
