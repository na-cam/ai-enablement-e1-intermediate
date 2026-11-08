import { test, expect } from '../../src/fixtures';
import { LoginPage } from '../../src/ui/pages/LoginPage';

/**
 * INTENTIONALLY FAILING test. It exists only to produce evidence of a failing
 * case (screenshot, video, trace, logs) for the report. It belongs to the
 * `demo-failure` project, which is NOT part of `npm test` or CI.
 *   npm run demo:failure
 */
test('DEMO: intentional failure produces screenshot, video and trace', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await expect(page.getByText('This text does not exist on the page')).toBeVisible({
    timeout: 2_000,
  });
});
