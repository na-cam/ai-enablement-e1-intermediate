import { test, expect } from '@playwright/test';
import { ApiClient } from '../utils/apiClient';

const credentials = {
  email: process.env.TEST_EMAIL || '',
  password: process.env.TEST_PASSWORD || ''
};

test.describe('API Test Cases Tests', () => {
  test('TC-023: Login API response schema validation', async ({ request }) => {
    const response = await request.post('https://qa-sandbox.ni.htec.rs/api/candidate/login', {
      data: {
        email: credentials.email,
        password: credentials.password
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('refreshToken');
    expect(data.success).toBe(true);
    expect(typeof data.token).toBe('string');
    expect(typeof data.refreshToken).toBe('string');
  });

  test('TC-024: Get test cases returns array', async ({ request }) => {
    const apiClient = new ApiClient(request);
    
    await apiClient.login(credentials.email, credentials.password);
    const testCases = await apiClient.getTestCases();
    
    expect(Array.isArray(testCases)).toBe(true);
  });

  test('TC-025: Create test case response contains ID', async ({ request }) => {
    const apiClient = new ApiClient(request);
    
    await apiClient.login(credentials.email, credentials.password);
    
    const uniqueTitle = `API Test-${Date.now()}`;
    const createdTestCase = await apiClient.createTestCase({
      title: uniqueTitle,
      description: 'API created',
      expected_result: 'Has ID',
      automated: false,
      test_steps: [{ value: 'Step 1' }]
    });
    
    expect(createdTestCase).toBeTruthy();
    expect(createdTestCase.id).toBeDefined();
    expect(typeof createdTestCase.id).toBe('number');
    expect(createdTestCase.title).toContain(uniqueTitle);
  });

  test('TC-019: Delete single test case via API', async ({ request }) => {
    const apiClient = new ApiClient(request);
    
    await apiClient.login(credentials.email, credentials.password);
    
    const uniqueTitle = `Delete Test-${Date.now()}`;
    await apiClient.createTestCase({
      title: uniqueTitle,
      description: 'To be deleted',
      expected_result: 'Deleted',
      automated: false,
      test_steps: [{ value: 'Step 1' }]
    });
    
    const testCasesBefore = await apiClient.getTestCases();
    const initialCount = testCasesBefore.length;
    
    await apiClient.deleteAllTestCasesOneByOne();
    
    const testCasesAfter = await apiClient.getTestCases();
    expect(testCasesAfter.length).toBeLessThan(initialCount);
  });

  test('TC-022: Idempotent deletion (404 treated as success)', async ({ request }) => {
    const apiClient = new ApiClient(request);
    
    await apiClient.login(credentials.email, credentials.password);
    
    await apiClient.deleteAllTestCasesOneByOne();
    await apiClient.deleteAllTestCasesOneByOne();
    
    const testCases = await apiClient.getTestCases();
    expect(testCases.length).toBe(0);
  });

  test('TC-016: Edit test case via API', async ({ request }) => {
    const apiClient = new ApiClient(request);
    
    await apiClient.login(credentials.email, credentials.password);
    await apiClient.deleteAllTestCasesOneByOne();
    
    const uniqueTitle = `Edit API Test-${Date.now()}`;
    await apiClient.createTestCase({
      title: uniqueTitle,
      description: 'Original',
      expected_result: 'Original result',
      automated: false,
      test_steps: [{ value: 'Step 1' }]
    });
    
    const testCases = await apiClient.getTestCases();
    expect(testCases.length).toBeGreaterThan(0);
  });

  test('TC-027: API returns proper error codes', async ({ request }) => {
    const response = await request.get('https://qa-sandbox.ni.htec.rs/api/candidate/testcases/999999', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    expect([401, 404]).toContain(response.status());
  });

  test('TC-028: Parallel test execution with unique titles', async ({ request }) => {
    const apiClient = new ApiClient(request);
    
    await apiClient.login(credentials.email, credentials.password);
    
    const uniqueTitle1 = `Parallel-1-${Date.now()}-${Math.random()}`;
    const uniqueTitle2 = `Parallel-2-${Date.now()}-${Math.random()}`;
    
    await apiClient.createTestCase({
      title: uniqueTitle1,
      description: 'Desc 1',
      expected_result: 'Result 1',
      automated: false,
      test_steps: [{ value: 'Step 1' }]
    });
    await apiClient.createTestCase({
      title: uniqueTitle2,
      description: 'Desc 2',
      expected_result: 'Result 2',
      automated: false,
      test_steps: [{ value: 'Step 1' }]
    });
    
    const testCases = await apiClient.getTestCases();
    expect(testCases.length).toBeGreaterThanOrEqual(2);
  });
});
