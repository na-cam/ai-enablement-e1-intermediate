import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** UI-only page object. Anything that talks to the API lives in src/api. */
export class TestCasesPage extends BasePage {
  get testCasesLink() {
    return this.page.getByRole('link', { name: 'Test Cases' }).first();
  }

  get createButton() {
    return this.page.getByRole('link', { name: 'New Test Case' });
  }

  get titleInput() {
    return this.page.getByPlaceholder('Title');
  }

  get descriptionInput() {
    return this.page.getByPlaceholder('Description');
  }

  get expectedResultInput() {
    return this.page.getByPlaceholder('Expected Result');
  }

  get addTestStepDiv() {
    return this.page.getByText('Add Test Step', { exact: true });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  get testStepInputs() {
    return this.page.getByPlaceholder('Test step');
  }

  get titleRequiredError() {
    return this.page.getByText('Title is required');
  }

  testCaseByTitle(title: string) {
    return this.page.getByText(title, { exact: true }).first();
  }

  async navigateToTestCases(): Promise<void> {
    await this.click(this.testCasesLink);
  }

  async createTestCase(
    title: string,
    description: string,
    expectedResult: string,
    steps: string[],
  ): Promise<void> {
    await this.click(this.createButton);
    await this.type(this.titleInput, title);
    await this.type(this.descriptionInput, description);
    await this.type(this.expectedResultInput, expectedResult);

    for (const step of steps) {
      await this.type(this.testStepInputs.last(), step);
      await this.click(this.addTestStepDiv);
    }
    await this.click(this.submitButton);
  }

  async openTestCaseByTitle(title: string): Promise<void> {
    await this.click(this.testCaseByTitle(title));
  }

  /** Edits one test case: appends a suffix to the title and prefixes each filled step. */
  async editTestCase(title: string, titleSuffix: string): Promise<string> {
    await this.openTestCaseByTitle(title);
    const newTitle = `${title} ${titleSuffix}`;
    await this.titleInput.clear();
    await this.type(this.titleInput, newTitle);

    const stepCount = await this.testStepInputs.count();
    for (let i = 0; i < stepCount; i++) {
      const input = this.testStepInputs.nth(i);
      const current = await input.inputValue();
      if (current) await this.type(input, `${i}: ${current}`);
    }
    await this.click(this.submitButton);
    return newTitle;
  }

  async expectTestCaseVisible(title: string): Promise<void> {
    await expect(this.testCaseByTitle(title)).toBeVisible();
  }

  async expectTestCaseHidden(title: string): Promise<void> {
    await expect(this.page.getByText(title, { exact: true })).toHaveCount(0);
  }
}
