# Recreation Prompt

## Project Overview
Create a comprehensive Playwright TypeScript test automation framework for the QA Sandbox application (https://qa-sandbox.ni.htec.rs) with Page Object Model architecture, API integration, and CI/CD pipelines.

## Requirements

### 1. Framework Setup
- Initialize Playwright TypeScript project with multi-browser support (Chromium, WebKit)
- Configure parallel execution (50% workers in CI, unlimited locally)
- Set up HTML and JUnit reporters with custom output directories
- Enable video recording in CI, traces on first retry
- Configure 30s test timeout, 5s expect timeout

### 2. Page Object Model
- **BasePage**: Base class with goto(), click(), type(), waitForVisible() methods
- **LoginPage**: 
  - Semantic locators (getByRole, getByPlaceholder)
  - login() method for UI login
  - loginViaAPI() method returning auth token
  - Assertion methods for error messages
- **TestCasesPage**:
  - createTestCase_UI() with dynamic test step inputs
  - createTestCase_API() returning TestCase object
  - deleteAllTestCases_API() with idempotent cleanup
  - editAllTestCases() with even/odd logic
  - getTestCases_API() method

### 3. API Client
- **ApiClient** class with:
  - login() returning token and refreshToken
  - getTestCases() returning TestCase array
  - createTestCase() with unique title generation (timestamp + random) and array response handling
  - updateTestCase() for editing
  - deleteTestCaseById() treating 404 as success
  - deleteAllTestCasesOneByOne() with expect.poll() for eventual consistency
- Base URL: https://qa-sandbox.ni.htec.rs/api
- Endpoints: /candidate/login, /candidate/testcases

### 4. TypeScript Types
- LoginResponse: success, token, refreshToken
- TestCase: id, title, expected_result, description, automated, test_steps
- TestStep: id, testcase_id, value

### 5. Test Suites (36 tests total)

#### Login Tests (4 tests)
- Valid credentials login
- Invalid email error
- Invalid password error
- Empty fields validation

#### Test Cases Management (5 tests)
- Navigate to test cases page
- Create test case via UI
- Field validation
- Edit all test cases
- Delete all via API

#### Authentication Tests (2 tests)
- TC-005: API authentication returns valid token
- TC-026: API requires authentication token (401)

#### Validation Tests (3 tests)
- TC-012: Create with multiple steps
- TC-013: Special characters in title
- TC-018: Update test case steps

#### API Contract Tests (8 tests)
- TC-023: Login API schema validation
- TC-024: Get test cases returns array
- TC-025: Create response contains ID
- TC-019: Delete single test case
- TC-022: Idempotent deletion
- TC-016: Edit test case via API
- TC-027: Proper error codes
- TC-028: Parallel execution with unique titles

### 6. Configuration
- Three projects: ui-chromium, ui-webkit, api
- API tests match pattern: api.*.spec.ts
- UI tests exclude API pattern
- Environment variables via .env file
- Credentials: TEST_EMAIL, TEST_PASSWORD

### 7. CI/CD Pipelines

#### GitHub Actions (.github/workflows/ci.yml)
- Trigger on push/pull_request to main
- Node 20, Ubuntu latest
- Install dependencies and Playwright browsers
- Run all tests with npm run test:ci
- Upload artifacts: HTML report, JUnit results, videos, traces, screenshots

#### Azure Pipelines (azure-pipelines.yml)
- Same functionality as GitHub Actions
- Publish test results to Azure DevOps

### 8. Scripts
Create executable scripts in scripts/ directory:
- run-ui.sh/cmd: Run UI tests only
- run-api.sh/cmd: Run API tests only
- run-all.sh/cmd: Run all tests

### 9. Documentation
- TEST_PLAN.md: 30 test cases with ID, title, type, priority, steps, expected results
- TEST_STRATEGY.md: Testing approach, tooling, environments, execution strategy, flakiness mitigation
- README.md: Setup instructions, test execution commands, project structure

### 10. Package.json Scripts
- test:ui, test:api, test:all, test:ci
- test:chromium, test:webkit
- test:headed, test:debug, test:report

## Key Implementation Details
- Use semantic locators (getByRole, getByText, getByPlaceholder) - avoid CSS selectors
- API creates unique titles: `${title}-${Date.now()}-${Math.floor(Math.random()*10000)}`
- API createTestCase returns array - find created item by matching unique title
- Test step UI: Fill input with placeholder "Test step", click "Add Test Step" div after each
- Idempotent deletion: 404 response treated as success
- Use expect.poll() for eventual consistency after deletions
- All tests must be isolated with unique data
- 100% pass rate required (36/36 tests passing)

## Success Criteria
- All 36 tests passing
- Multi-browser execution (Chromium + WebKit)
- API tests use request context, not page context
- Parallel execution working
- CI/CD pipelines functional
- Complete documentation
- Cross-platform scripts
