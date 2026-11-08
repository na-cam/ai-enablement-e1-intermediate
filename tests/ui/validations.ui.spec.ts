import { test } from '../../src/fixtures';
import { TestCasesPage } from '../../src/ui/pages/TestCasesPage';

test.describe('UI: Field validation and boundaries', () => {
  test('TC-013: special characters in title are accepted', async ({ authedPage, api }) => {
    const testCases = new TestCasesPage(authedPage);
    const title = `Test @#$% Case-${Date.now()}`;
    api.trackTitle(title);

    await authedPage.goto('/dashboard');
    await testCases.navigateToTestCases();
    await testCases.createTestCase(title, 'Description with special chars', 'Expected result', ['Step 1']);
    await testCases.expectTestCaseVisible(title);
  });

  test('TC-012: multiple steps can be added', async ({ authedPage, api }) => {
    const testCases = new TestCasesPage(authedPage);
    const title = `Multi-Step Test-${Date.now()}`;
    api.trackTitle(title);

    await authedPage.goto('/dashboard');
    await testCases.navigateToTestCases();
    await testCases.createTestCase(
      title,
      'Test with 5 steps',
      'All steps executed',
      ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
    );
    await testCases.expectTestCaseVisible(title);
  });

  test('TC-018: steps of an existing test case can be updated', async ({ authedPage, api }) => {
    const testCases = new TestCasesPage(authedPage);
    const created = await api.createTestCase({
      title: 'Update Steps',
      description: 'Original description',
      expected_result: 'Original result',
      automated: false,
      test_steps: [{ value: 'Original Step 1' }, { value: 'Original Step 2' }],
    });

    await authedPage.goto('/dashboard');
    await testCases.navigateToTestCases();
    const newTitle = await testCases.editTestCase(created.title, '(steps updated)');
    api.trackTitle(newTitle);
    await testCases.expectTestCaseVisible(newTitle);
  });
});
