import { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(public page: Page) {}

  async goto(url: string) {
    await this.page.goto(url);
  }

  async waitForVisible(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
  }

  async click(locator: Locator) {
    await locator.click();
  }

  async type(locator: Locator, value: string) {
    await locator.fill(value);
  }
}
