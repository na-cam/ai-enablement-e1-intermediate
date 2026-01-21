import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TestCasesPage } from '../pages/TestCasesPage';

const credentials = {
  email: process.env.TEST_EMAIL || '',
  password: process.env.TEST_PASSWORD || ''
};

test.describe('Field Validation Tests', () => {
  test('TC-013: Create test case with special characters in title', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testCasesPage = new TestCasesPage(page);
    
    const token = await loginPage.loginViaAPI(credentials.email, credentials.password);
    testCasesPage.setToken(token);
    await testCasesPage.deleteAllTestCases_API();

    await loginPage.login(credentials.email, credentials.password);
    await testCasesPage.navigateToTestCases();
    
    const uniqueTitle = `Test @#$% Case-${Date.now()}`;
    await testCasesPage.createTestCase_UI(
      uniqueTitle,
      'Description with special chars',
      'Expected result',
      ['Step 1']
    );

    await expect(page.getByText(uniqueTitle, { exact: true }).first()).toBeVisible();
  });

  test('TC-012: Create test case with multiple steps', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testCasesPage = new TestCasesPage(page);
    
    const token = await loginPage.loginViaAPI(credentials.email, credentials.password);
    testCasesPage.setToken(token);
    await testCasesPage.deleteAllTestCases_API();

    await loginPage.login(credentials.email, credentials.password);
    await testCasesPage.navigateToTestCases();
    
    const uniqueTitle = `Multi-Step Test-${Date.now()}`;
    await testCasesPage.createTestCase_UI(
      uniqueTitle,
      'Test with 5 steps',
      'All steps executed',
      ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5']
    );

    await expect(page.getByText(uniqueTitle, { exact: true }).first()).toBeVisible();
  });

  test('TC-018: Update test case steps', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testCasesPage = new TestCasesPage(page);
    
    await loginPage.login(credentials.email, credentials.password);
    await testCasesPage.navigateToTestCases();
    
    const uniqueTitle = `Update Steps Test-${Date.now()}`;
    await testCasesPage.createTestCase_UI(
      uniqueTitle,
      'Original description',
      'Original result',
      ['Original Step 1', 'Original Step 2']
    );
    
    await expect(page.getByText(uniqueTitle, { exact: true }).first()).toBeVisible();
  });
});
