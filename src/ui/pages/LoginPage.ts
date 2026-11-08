import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly path = '/login';

  get emailInput() {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get passwordInput() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }

  get errorMessage() {
    return this.page.getByText(/is not authorized/i);
  }

  get emailRequiredError() {
    return this.page.getByText('Email is required');
  }

  get passwordRequiredError() {
    return this.page.getByText('Password is required');
  }

  async open(): Promise<void> {
    await this.goto(this.path);
  }

  async login(email: string, password: string): Promise<void> {
    await this.open();
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  async assertLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/.*dashboard/);
  }

  async assertLoginFailure(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async assertRequiredFieldErrors(): Promise<void> {
    await expect(this.emailRequiredError).toBeVisible();
    await expect(this.passwordRequiredError).toBeVisible();
  }
}
