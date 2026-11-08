import { Locator, Page } from '@playwright/test';

export class BasePage {
  constructor(public readonly page: Page) {}

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  async type(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }
}
