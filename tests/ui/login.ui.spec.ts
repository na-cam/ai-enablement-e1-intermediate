import { test } from '../../src/fixtures';
import { env } from '../../src/config/env';
import { LoginPage } from '../../src/ui/pages/LoginPage';

test.describe('UI: Login', () => {
  test('TC-001: valid credentials reach the dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(env.email, env.password);
    await loginPage.assertLoginSuccess();
  });

  test('TC-002: invalid email shows an error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('invalid@email.com', env.password);
    await loginPage.assertLoginFailure();
  });

  test('TC-003: invalid password shows an error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(env.email, 'WrongPassword123!');
    await loginPage.assertLoginFailure();
  });

  test('TC-004: empty fields show required errors', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.click(loginPage.loginButton);
    await loginPage.assertRequiredFieldErrors();
  });
});
