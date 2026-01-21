# Test Strategy - QA Sandbox Automation

## 1. Overview

This document outlines the testing strategy for the QA Sandbox Test Cases Management application, covering UI and API test automation using Playwright with TypeScript.

## 2. Testing Approach

### 2.1 Test Pyramid
- **API Tests (40%)**: Fast, reliable contract and integration tests
- **UI Tests (50%)**: Critical user journeys and validations
- **Manual Tests (10%)**: Exploratory and usability testing

### 2.2 Test Types
- **Smoke Tests**: Critical path validation (login, create, delete)
- **Regression Tests**: Full suite covering all functionality
- **Negative Tests**: Error handling and validation
- **API Contract Tests**: Schema validation and status codes

## 3. Tooling & Framework

### 3.1 Core Stack
- **Framework**: Playwright v1.40+
- **Language**: TypeScript 5.3+
- **Test Runner**: Playwright Test
- **Node Version**: 20.x LTS

### 3.2 Reporters
- **HTML**: Visual test results with screenshots/videos
- **JUnit**: CI/CD integration and trend analysis
- **Allure** (optional): Rich reporting with history
- **List**: Console output for local development

### 3.3 Page Object Model
- **BasePage**: Common actions (click, type, goto, waitForVisible)
- **LoginPage**: Authentication flows (UI + API)
- **TestCasesPage**: CRUD operations (UI + API)

### 3.4 API Client
- **ApiClient**: Centralized API interactions
  - Login with token management
  - CRUD operations for test cases
  - Idempotent deletion (404 = success)
  - Snapshot-based batch operations

## 4. Test Environment

### 4.1 Environments
- **QA**: https://qa-sandbox.ni.htec.rs (primary)
- **API**: https://qa-sandbox.ni.htec.rs/api

### 4.2 Test Data
- **Credentials**: Stored in .env (not committed)
- **Test Cases**: Generated with unique timestamps
- **Cleanup**: Idempotent API cleanup before tests
- **Isolation**: Per-worker/browser data separation

## 5. Execution Strategy

### 5.1 Local Execution
```bash
npm run test:all          # All tests, all browsers
npm run test:ui           # UI tests only
npm run test:api          # API tests only
npm run test:headed       # With browser UI
npm run test:report       # Show HTML report
```

### 5.2 CI/CD Execution
```bash
npm run test:ci           # Parallel, 50% workers, all reporters
```

### 5.3 Parallelization
- **Local**: Unlimited workers (auto-detected CPU cores)
- **CI**: 50% of available workers
- **Strategy**: Test-level parallelization
- **Isolation**: Unique test data per execution

### 5.4 Browser Coverage
- **Chromium**: Primary browser (Desktop Chrome)
- **WebKit**: Secondary browser (Desktop Safari)
- **Firefox**: Optional (can be enabled)

## 6. Flakiness Mitigation

### 6.1 Strategies
1. **Semantic Locators**: getByRole, getByText, getByPlaceholder
2. **Auto-waiting**: Playwright built-in waits
3. **Idempotent Operations**: Cleanup handles already-deleted items
4. **Polling**: expect.poll() for eventual consistency
5. **Unique Data**: Timestamp-based titles prevent collisions
6. **Retry Logic**: 1 retry in CI for transient failures

### 6.2 Known Patterns
- **API Eventual Consistency**: Use expect.poll() after delete
- **Modal Ambiguity**: Use .first() or scope selectors
- **Parallel Deletion**: 404 treated as success (idempotent)

## 7. Data Management

### 7.1 Test Data Creation
- **Unique Titles**: `${title}-${Date.now()}-${Math.random()}`
- **API Creation**: Fast setup for UI tests
- **Fixtures**: testData.json for reusable test data

### 7.2 Cleanup Strategy
- **Before Tests**: API cleanup of existing data
- **After Tests**: Automatic (via beforeEach hooks)
- **Idempotent**: Multiple cleanup calls safe
- **Snapshot-based**: Delete from snapshot to avoid race conditions

## 8. Reporting & Artifacts

### 8.1 Generated Artifacts
- **HTML Report**: reports/html-report/index.html
- **JUnit XML**: reports/junit/results.xml
- **Videos**: test-results/**/video.webm (on failure or CI)
- **Screenshots**: test-results/**/screenshot.png (on failure)
- **Traces**: test-results/**/trace.zip (on first retry)
- **Allure Results**: reports/allure-results/ (if enabled)

### 8.2 CI/CD Publishing
- All artifacts published as build artifacts
- Retention: 30 days (configurable)
- Accessible via pipeline UI

## 9. CI/CD Integration

### 9.1 Pipeline Triggers
- **Push**: All branches
- **Pull Request**: Automatic validation
- **Scheduled**: Nightly regression (optional)

### 9.2 Pipeline Steps
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies (npm ci)
4. Install Playwright browsers
5. Run tests in parallel
6. Publish artifacts (reports, videos, traces)
7. Generate Allure report (optional)

### 9.3 Quality Gates
- **Smoke Tests**: Must pass 100%
- **Regression**: ≥95% pass rate
- **No Critical Failures**: High priority tests must pass

## 10. Maintenance

### 10.1 Test Review
- **Weekly**: Review flaky tests
- **Monthly**: Update test data and selectors
- **Quarterly**: Framework and dependency updates

### 10.2 Selector Strategy
- **Priority 1**: Semantic locators (getByRole, getByLabel)
- **Priority 2**: Text-based (getByText with exact match)
- **Priority 3**: Placeholder (getByPlaceholder)
- **Last Resort**: CSS/XPath (avoid if possible)

### 10.3 Code Quality
- **TypeScript**: Strict mode enabled
- **Linting**: Follow project conventions
- **DRY**: Reuse page objects and utilities
- **Minimal**: Only essential code, no over-engineering

## 11. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API Eventual Consistency | Flaky tests | Use expect.poll() for deletions |
| Parallel Data Conflicts | Test failures | Unique timestamps in titles |
| Selector Changes | Broken tests | Use semantic locators |
| Environment Instability | False failures | Retry logic + monitoring |
| Slow Test Execution | CI bottleneck | Parallel execution + API setup |

## 12. Success Metrics

- **Pass Rate**: ≥95% on main branch
- **Execution Time**: <2 minutes for full suite
- **Flakiness**: <2% retry rate
- **Coverage**: All critical paths automated
- **Maintenance**: <1 hour/week for updates

## 13. References

- [Playwright Documentation](https://playwright.dev)
- [Test Plan](./TEST_PLAN.md)
- [Project README](./README.md)
