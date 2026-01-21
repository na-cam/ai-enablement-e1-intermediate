import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const credentials = {
  email: process.env.TEST_EMAIL || '',
  password: process.env.TEST_PASSWORD || ''
};

test.describe('Authentication Tests', () => {
  test('TC-005: API authentication returns valid token', async ({ request }) => {
    const loginPage = new LoginPage({ request } as any);
    
    const result = await loginPage.loginViaAPI(credentials.email, credentials.password);
    
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(20);
  });

  test('TC-026: API requires authentication token', async ({ request }) => {
    const response = await request.get('https://qa-sandbox.ni.htec.rs/api/candidate/testcases');
    
    expect(response.status()).toBe(401);
  });
});
