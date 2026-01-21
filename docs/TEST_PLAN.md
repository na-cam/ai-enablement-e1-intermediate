# Test Plan - QA Sandbox Test Cases Management

## 1. Scope

### In Scope
- Authentication (Login/Logout)
- Test Cases Management (Create, Read, Update, Delete)
- Navigation and Authorization
- Field Validations
- API Contract Testing
- Multi-browser Support (Chromium, WebKit)
- Parallel Execution

### Out of Scope
- Performance Testing
- Load Testing
- Mobile Browser Testing
- Accessibility Testing (WCAG)

## 2. Test Environment

- **Base URL**: https://qa-sandbox.ni.htec.rs
- **API Base**: https://qa-sandbox.ni.htec.rs/api
- **Browsers**: Chromium, WebKit
- **Execution**: Parallel (50% workers in CI)

## 3. Test Data Strategy

- Use environment variables for credentials (.env file)
- Generate unique test case titles with timestamps to avoid collisions
- Idempotent cleanup via API before UI tests
- Isolated test data per worker/browser

## 4. Test Cases

### Authentication (TC-001 to TC-005)

| ID | Title | Type | Priority | Tags |
|----|-------|------|----------|------|
| TC-001 | Valid login with correct credentials | UI | High | smoke, auth |
| TC-002 | Login fails with invalid email | UI | High | negative, auth |
| TC-003 | Login fails with invalid password | UI | High | negative, auth |
| TC-004 | Required field validation on empty login | UI | Medium | validation, auth |
| TC-005 | API authentication returns valid token | API | High | smoke, api, auth |

**TC-001: Valid login with correct credentials**
- **Pre-conditions**: User has valid credentials
- **Steps**: 
  1. Navigate to /login
  2. Enter valid email
  3. Enter valid password
  4. Click Login button
- **Expected**: User redirected to dashboard, URL contains /dashboard

**TC-002: Login fails with invalid email**
- **Pre-conditions**: None
- **Steps**:
  1. Navigate to /login
  2. Enter invalid email
  3. Enter valid password
  4. Click Login
- **Expected**: Error message displayed, user remains on login page

**TC-003: Login fails with invalid password**
- **Pre-conditions**: None
- **Steps**:
  1. Navigate to /login
  2. Enter valid email
  3. Enter wrong password
  4. Click Login
- **Expected**: Error message displayed

**TC-004: Required field validation on empty login**
- **Pre-conditions**: None
- **Steps**:
  1. Navigate to /login
  2. Leave email and password empty
  3. Click Login
- **Expected**: "Email is required" and "Password is required" messages shown

**TC-005: API authentication returns valid token**
- **Pre-conditions**: Valid credentials available
- **Steps**:
  1. POST /api/candidate/login with valid credentials
- **Expected**: Response contains success=true, token, refreshToken

### Navigation (TC-006 to TC-008)

| ID | Title | Type | Priority | Tags |
|----|-------|------|----------|------|
| TC-006 | Navigate to Test Cases page after login | UI | High | smoke, navigation |
| TC-007 | Test Cases page shows New Test Case button | UI | Medium | navigation |
| TC-008 | Unauthenticated user redirected to login | UI | High | security, navigation |

**TC-006: Navigate to Test Cases page after login**
- **Pre-conditions**: User logged in
- **Steps**:
  1. Click "Test Cases" link
- **Expected**: Test Cases page loads, "New Test Case" button visible

**TC-007: Test Cases page shows New Test Case button**
- **Pre-conditions**: User on Test Cases page
- **Steps**:
  1. Verify UI elements present
- **Expected**: "New Test Case" link visible

**TC-008: Unauthenticated user redirected to login**
- **Pre-conditions**: User not logged in
- **Steps**:
  1. Navigate directly to /test-cases
- **Expected**: Redirected to /login

### Test Case Creation (TC-009 to TC-014)

| ID | Title | Type | Priority | Tags |
|----|-------|------|----------|------|
| TC-009 | Create test case via UI with all fields | UI | High | smoke, crud |
| TC-010 | Create test case via API | API | High | smoke, api, crud |
| TC-011 | Title field is required | UI | High | validation |
| TC-012 | Create test case with multiple steps | UI | Medium | crud |
| TC-013 | Create test case with special characters in title | UI | Medium | boundary |
| TC-014 | API returns 400 for duplicate title | API | Medium | negative, api |

**TC-009: Create test case via UI with all fields**
- **Pre-conditions**: User logged in, on Test Cases page
- **Steps**:
  1. Click "New Test Case"
  2. Fill Title, Description, Expected Result
  3. Add test steps
  4. Click Submit
- **Expected**: Test case appears in list

**TC-010: Create test case via API**
- **Pre-conditions**: Valid auth token
- **Steps**:
  1. POST /api/candidate/testcases with valid payload
- **Expected**: 200/201 response, test case created with ID

**TC-011: Title field is required**
- **Pre-conditions**: User on New Test Case form
- **Steps**:
  1. Leave Title empty
  2. Fill other fields
  3. Click Submit
- **Expected**: "Title is required" error shown

**TC-012: Create test case with multiple steps**
- **Pre-conditions**: User on New Test Case form
- **Steps**:
  1. Fill basic fields
  2. Add 5 test steps using "Add Test Step"
  3. Submit
- **Expected**: Test case created with all 5 steps

**TC-013: Create test case with special characters in title**
- **Pre-conditions**: User on New Test Case form
- **Steps**:
  1. Enter title with special chars: "Test @#$% Case"
  2. Fill other fields
  3. Submit
- **Expected**: Test case created successfully

**TC-014: API returns 400 for duplicate title**
- **Pre-conditions**: Test case with title "Duplicate" exists
- **Steps**:
  1. POST /api/candidate/testcases with same title
- **Expected**: 400/404 response with error message

### Test Case Editing (TC-015 to TC-018)

| ID | Title | Type | Priority | Tags |
|----|-------|------|----------|------|
| TC-015 | Edit test case title via UI | UI | High | crud |
| TC-016 | Edit test case via API | API | High | api, crud |
| TC-017 | Edit multiple test cases in batch | UI | Medium | regression |
| TC-018 | Update test case steps | UI | Medium | crud |

**TC-015: Edit test case title via UI**
- **Pre-conditions**: Test case exists
- **Steps**:
  1. Click on test case
  2. Modify title
  3. Click Submit
- **Expected**: Title updated, changes visible in list

**TC-016: Edit test case via API**
- **Pre-conditions**: Test case exists, valid token
- **Steps**:
  1. PUT /api/candidate/testcases/{id} with updated data
- **Expected**: 200 response, test case updated

**TC-017: Edit multiple test cases in batch**
- **Pre-conditions**: Multiple test cases exist
- **Steps**:
  1. Edit all test cases programmatically
  2. Verify changes
- **Expected**: All test cases updated with even/odd suffixes

**TC-018: Update test case steps**
- **Pre-conditions**: Test case with steps exists
- **Steps**:
  1. Open test case
  2. Modify step descriptions
  3. Submit
- **Expected**: Steps updated successfully

### Test Case Deletion (TC-019 to TC-022)

| ID | Title | Type | Priority | Tags |
|----|-------|------|----------|------|
| TC-019 | Delete single test case via API | API | High | api, crud |
| TC-020 | Delete all test cases via API | API | High | api, crud |
| TC-021 | Delete non-existent test case returns 404 | API | Medium | negative, api |
| TC-022 | Idempotent deletion (404 treated as success) | API | High | api, reliability |

**TC-019: Delete single test case via API**
- **Pre-conditions**: Test case exists
- **Steps**:
  1. DELETE /api/candidate/testcases/{id}
- **Expected**: 200 response, test case removed

**TC-020: Delete all test cases via API**
- **Pre-conditions**: Multiple test cases exist
- **Steps**:
  1. Get all test cases
  2. Delete each one by one
  3. Poll until list is empty
- **Expected**: All test cases deleted, API returns empty array

**TC-021: Delete non-existent test case returns 404**
- **Pre-conditions**: None
- **Steps**:
  1. DELETE /api/candidate/testcases/99999
- **Expected**: 404 response

**TC-022: Idempotent deletion (404 treated as success)**
- **Pre-conditions**: Test case already deleted
- **Steps**:
  1. Attempt to delete same ID again
- **Expected**: No error thrown, operation succeeds

### API Contract Tests (TC-023 to TC-027)

| ID | Title | Type | Priority | Tags |
|----|-------|------|----------|------|
| TC-023 | Login API response schema validation | API | High | api, contract |
| TC-024 | Get test cases returns array | API | High | api, contract |
| TC-025 | Create test case response contains ID | API | High | api, contract |
| TC-026 | API requires authentication token | API | High | api, security |
| TC-027 | API returns proper error codes | API | Medium | api, negative |

**TC-023: Login API response schema validation**
- **Pre-conditions**: None
- **Steps**:
  1. POST /api/candidate/login
  2. Validate response structure
- **Expected**: Response has success, token, refreshToken fields

**TC-024: Get test cases returns array**
- **Pre-conditions**: Valid auth token
- **Steps**:
  1. GET /api/candidate/testcases
- **Expected**: Response is array of test case objects

**TC-025: Create test case response contains ID**
- **Pre-conditions**: Valid auth token
- **Steps**:
  1. POST /api/candidate/testcases
  2. Check response
- **Expected**: Response contains id field (number)

**TC-026: API requires authentication token**
- **Pre-conditions**: None
- **Steps**:
  1. GET /api/candidate/testcases without token
- **Expected**: 401 Unauthorized response

**TC-027: API returns proper error codes**
- **Pre-conditions**: Various scenarios
- **Steps**:
  1. Test invalid requests
- **Expected**: Appropriate HTTP status codes (400, 401, 404)

### Concurrency & Parallel Execution (TC-028 to TC-030)

| ID | Title | Type | Priority | Tags |
|----|-------|------|----------|------|
| TC-028 | Parallel test execution with unique titles | UI+API | High | reliability |
| TC-029 | Multiple browsers can run simultaneously | UI | High | parallel |
| TC-030 | Cleanup is idempotent across workers | API | High | reliability |

**TC-028: Parallel test execution with unique titles**
- **Pre-conditions**: Tests run in parallel
- **Steps**:
  1. Create test cases with timestamp-based unique titles
  2. Verify no collisions
- **Expected**: All tests pass without conflicts

**TC-029: Multiple browsers can run simultaneously**
- **Pre-conditions**: Chromium and WebKit configured
- **Steps**:
  1. Run same tests on both browsers in parallel
- **Expected**: Both pass without interference

**TC-030: Cleanup is idempotent across workers**
- **Pre-conditions**: Multiple workers running
- **Steps**:
  1. Delete test cases from multiple workers
  2. Handle 404 gracefully
- **Expected**: No failures, all cleanups succeed

## 5. Execution Strategy

- **Smoke Tests**: TC-001, TC-005, TC-006, TC-009, TC-010
- **Regression**: All tests
- **Parallel Workers**: 50% in CI, unlimited locally
- **Retry Strategy**: 1 retry in CI, 0 locally
- **Browsers**: Chromium (primary), WebKit (secondary)

## 6. Reporting

- HTML Report: reports/html-report/
- JUnit XML: reports/junit/results.xml
- Videos: test-results/**/video.webm
- Traces: On first retry
- Screenshots: On failure

## 7. Exit Criteria

- All smoke tests pass (100%)
- Regression suite ≥ 95% pass rate
- No critical/high priority failures
- All reports generated successfully
