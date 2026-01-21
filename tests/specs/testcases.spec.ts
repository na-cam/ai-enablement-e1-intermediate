import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TestCasesPage } from '../pages/TestCasesPage';
import testData from '../fixtures/testData.json';

const credentials = {
  email: process.env.TEST_EMAIL || '',
  password: process.env.TEST_PASSWORD || ''
};

test.describe('Test Cases Management', () => {
  test('should navigate to Test Cases page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testCasesPage = new TestCasesPage(page);
    
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.assertLoginSuccess();
    await testCasesPage.navigateToTestCases();
    await expect(page.getByRole('link', { name: 'New Test Case' })).toBeVisible();
  });

  test('should create test case via UI', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testCasesPage = new TestCasesPage(page);
    
    const token = await loginPage.loginViaAPI(credentials.email, credentials.password);
    testCasesPage.setToken(token);
    await testCasesPage.deleteAllTestCases_API();

    await loginPage.login(credentials.email, credentials.password);
    await testCasesPage.navigateToTestCases();
    await testCasesPage.createTestCase_UI(
      testData.testCase1.title,
      testData.testCase1.description,
      testData.testCase1.expectedResult,
      testData.testCase1.steps
    );
   // await expect(page.getByText(testData.testCase1.title, { exact: true })).toBeVisible();
  });

  test('should show required field validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testCasesPage = new TestCasesPage(page);
    
    await loginPage.login(credentials.email, credentials.password);
    await testCasesPage.navigateToTestCases();
    await testCasesPage.click(testCasesPage.createButton);
    await testCasesPage.type(testCasesPage.descriptionInput, 'Some description');
    await testCasesPage.type(testCasesPage.expectedResultInput, 'Some result');
    await testCasesPage.click(testCasesPage.submitButton);
    await expect(page.getByText('Title is required')).toBeVisible();
  });

  test('should edit all test cases', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testCasesPage = new TestCasesPage(page);
    
    const token = await loginPage.loginViaAPI(credentials.email, credentials.password);
    testCasesPage.setToken(token);
    await testCasesPage.deleteAllTestCases_API();

    await testCasesPage.createTestCase_API(
      testData.testCase1.title,
      testData.testCase1.description,
      testData.testCase1.expectedResult,
      testData.testCase1.steps
    );
    await testCasesPage.createTestCase_API(
      testData.testCase2.title,
      testData.testCase2.description,
      testData.testCase2.expectedResult,
      testData.testCase2.steps
    );
    await testCasesPage.createTestCase_API(
      testData.testCase3.title,
      testData.testCase3.description,
      testData.testCase3.expectedResult,
      testData.testCase3.steps
    );

    await loginPage.login(credentials.email, credentials.password);
    await testCasesPage.navigateToTestCases();
    await testCasesPage.editAllTestCases();

  });

  test('should delete all test cases via API', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testCasesPage = new TestCasesPage(page);
    
    const token = await loginPage.loginViaAPI(credentials.email, credentials.password);
    testCasesPage.setToken(token);

    const createdTitle1 = await testCasesPage.createTestCase_API(
      testData.testCase1.title,
      testData.testCase1.description,
      testData.testCase1.expectedResult,
      testData.testCase1.steps
    );
    const createdTitle2 = await testCasesPage.createTestCase_API(
      testData.testCase2.title,
      testData.testCase2.description,
      testData.testCase2.expectedResult,
      testData.testCase2.steps
    );

    await testCasesPage.deleteAllTestCases_API();

    await loginPage.login(credentials.email, credentials.password);
    await testCasesPage.navigateToTestCases();
    await page.waitForLoadState('networkidle');
  });
});
