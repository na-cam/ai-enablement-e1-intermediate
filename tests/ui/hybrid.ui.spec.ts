import { test, expect } from '../../src/fixtures';
import { env } from '../../src/config/env';
import { TestCasesPage } from '../../src/ui/pages/TestCasesPage';

test.describe('UI: Hybrid flows (API token + network analysis)', () => {
  test('TC-038: bearer token injection skips the UI login form', async ({ authedPage }) => {
    await authedPage.goto('/dashboard');
    await expect(authedPage).toHaveURL(/dashboard/);
    await expect(authedPage.getByRole('button', { name: 'Login' })).toHaveCount(0);
  });

  test('TC-008: unauthenticated user cannot open the dashboard (security)', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test('TC-039: no XHR/fetch call exceeds the slow-request threshold', async ({
    authedPage,
    networkMonitor,
  }) => {
    const testCases = new TestCasesPage(authedPage);
    await authedPage.goto('/dashboard');
    await testCases.navigateToTestCases();
    await expect(testCases.createButton).toBeVisible();

    expect(
      networkMonitor.slow,
      `Requests slower than ${env.slowRequestMs}ms: ${JSON.stringify(networkMonitor.slow)}`,
    ).toHaveLength(0);
  });
});
