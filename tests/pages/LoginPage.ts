import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ApiClient } from '../utils/apiClient';

export class LoginPage extends BasePage {
  readonly url = 'https://qa-sandbox.ni.htec.rs/login';
  private apiClient: ApiClient;

  constructor(page: any) {
    super(page);
    this.apiClient = new ApiClient(page.request);
  }

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

  async login(email: string, password: string) {
    await this.goto(this.url);
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  async loginViaAPI(email: string, password: string): Promise<string> {
    const result = await this.apiClient.login(email, password);
    return result.token;
  }

  async assertLoginSuccess() {
    await expect(this.page).toHaveURL(/.*dashboard/);
  }

  async assertLoginFailure() {
    await expect(this.errorMessage).toBeVisible();
  }

  async assertRequiredFieldErrors() {
    await expect(this.emailRequiredError).toBeVisible();
    await expect(this.passwordRequiredError).toBeVisible();
  }
}
