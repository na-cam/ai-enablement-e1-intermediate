import { test, expect } from '../../src/fixtures';
import { env } from '../../src/config/env';
import { LoginPage } from '../../src/ui/pages/LoginPage';
import { TestCasesPage } from '../../src/ui/pages/TestCasesPage';
import testData from '../data/testData.json';

const uniq = (title: string) => `${title}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

test.describe('UI: Test cases', () => {
  test('TC-006: navigate to Test Cases after UI login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testCases = new TestCasesPage(page);
    await loginPage.login(env.email, env.password);
    await loginPage.assertLoginSuccess();
    await testCases.navigateToTestCases();
    await expect(testCases.createButton).toBeVisible();
  });

  test('TC-009: create a test case via UI (hybrid: API token, UI create)', async ({ authedPage, api }) => {
    const testCases = new TestCasesPage(authedPage);
    const t = testData.testCase1;
    const title = uniq(t.title);
    api.trackTitle(title);

    await authedPage.goto('/dashboard');
    await testCases.navigateToTestCases();
    await testCases.createTestCase(title, t.description, t.expectedResult, t.steps);
    await testCases.expectTestCaseVisible(title);
  });

  test('TC-011: title is required', async ({ authedPage }) => {
    const testCases = new TestCasesPage(authedPage);
    await authedPage.goto('/dashboard');
    await testCases.navigateToTestCases();
    await testCases.click(testCases.createButton);
    await testCases.type(testCases.descriptionInput, 'Some description');
    await testCases.type(testCases.expectedResultInput, 'Some result');
    await testCases.click(testCases.submitButton);
    await expect(testCases.titleRequiredError).toBeVisible();
  });

  test('TC-015: edit a test case created via API (hybrid)', async ({ authedPage, api }) => {
    const testCases = new TestCasesPage(authedPage);
    const t = testData.testCase2;
    const created = await api.createTestCase({
      title: t.title,
      description: t.description,
      expected_result: t.expectedResult,
      automated: false,
      test_steps: t.steps.map((value) => ({ value })),
    });

    await authedPage.goto('/dashboard');
    await testCases.navigateToTestCases();
    const newTitle = await testCases.editTestCase(created.title, '(edited)');
    api.trackTitle(newTitle);
    await testCases.expectTestCaseVisible(newTitle);
  });

  test('TC-020: test case deleted via API disappears from the UI', async ({ authedPage, api }) => {
    const testCases = new TestCasesPage(authedPage);
    const t = testData.testCase3;
    const created = await api.createTestCase({
      title: t.title,
      description: t.description,
      expected_result: t.expectedResult,
      automated: false,
      test_steps: t.steps.map((value) => ({ value })),
    });
    await api.deleteTestCaseById(created.id!);

    await authedPage.goto('/dashboard');
    await testCases.navigateToTestCases();
    await testCases.expectTestCaseHidden(created.title);
  });
});
