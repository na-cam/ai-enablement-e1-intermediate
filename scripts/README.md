# Test Execution Scripts

This directory contains executable scripts for running Playwright tests.

## Unix/Linux/Mac Scripts

### run-ui.sh
Runs UI tests on Chromium and WebKit browsers.
```bash
chmod +x scripts/run-ui.sh
./scripts/run-ui.sh
```

### run-api.sh
Runs API tests only.
```bash
chmod +x scripts/run-api.sh
./scripts/run-api.sh
```

### run-all.sh
Runs all tests with full reporting.
```bash
chmod +x scripts/run-all.sh
./scripts/run-all.sh
```

## Windows Scripts

### run-ui.cmd
Runs UI tests on Chromium and WebKit browsers.
```cmd
scripts\run-ui.cmd
```

### run-api.cmd
Runs API tests only.
```cmd
scripts\run-api.cmd
```

### run-all.cmd
Runs all tests with full reporting.
```cmd
scripts\run-all.cmd
```

## NPM Scripts (Cross-platform)

Alternatively, use npm scripts which work on all platforms:

```bash
npm run test:ui       # UI tests only
npm run test:api      # API tests only
npm run test:all      # All tests
npm run test:ci       # CI mode with full reporting
npm run test:report   # View HTML report
```
