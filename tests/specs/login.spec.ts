import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const credentials = {
  email: process.env.TEST_EMAIL || '',
  password: process.env.TEST_PASSWORD || ''
};

test.describe('Login Tests', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.assertLoginSuccess();
  });

  test('should show error with invalid email', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('invalid@email.com', credentials.password);
    await loginPage.assertLoginFailure();
  });

  test('should show error with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(credentials.email, 'WrongPassword123!');
    await loginPage.assertLoginFailure();
  });

  test('should show required field errors when fields are empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto(loginPage.url);
    await loginPage.click(loginPage.loginButton);
    await loginPage.assertRequiredFieldErrors();
  });
});
