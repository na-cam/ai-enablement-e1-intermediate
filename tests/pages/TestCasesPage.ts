import { BasePage } from './BasePage';
import { ApiClient } from '../utils/apiClient';
import { TestCase } from '../utils/types';

export class TestCasesPage extends BasePage {
  private apiClient: ApiClient;

  constructor(page: any) {
    super(page);
    this.apiClient = new ApiClient(page.request);
  }

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

  get testStepInput() {
    return this.page.getByPlaceholder('Test step');
  }

  setToken(token: string) {
    this.apiClient.setAuthToken(token);
  }

  async navigateToTestCases() {
    await this.click(this.testCasesLink);
  }

  async createTestCase_UI(title: string, description: string, expectedResult: string, steps: string[]) {
    await this.click(this.createButton);
    await this.type(this.titleInput, title);
    await this.type(this.descriptionInput, description);
    await this.type(this.expectedResultInput, expectedResult);

    for (const step of steps) {
      const stepInputs = this.page.locator('input[placeholder="Test step"]');
      const count = await stepInputs.count();
      await stepInputs.nth(count - 1).fill(step);
      await this.click(this.addTestStepDiv);
    }

    await this.click(this.submitButton);
  }

  async createTestCase_API(title: string, description: string, expectedResult: string, steps: string[]): Promise<TestCase> {
    return await this.apiClient.createTestCase({
      title,
      description,
      expected_result: expectedResult,
      automated: false,
      test_steps: steps.map(s => ({ value: s }))
    });
  }

  async getTestCases_API(): Promise<TestCase[]> {
    return await this.apiClient.getTestCases();
  }

  async editTestCase_API(id: number, updates: Partial<TestCase>): Promise<TestCase> {
    return await this.apiClient.updateTestCase(id, updates);
  }

  async deleteAllTestCases_API() {
    await this.apiClient.deleteAllTestCasesOneByOne();
    await this.page.waitForTimeout(500);
  }

  async openTestCaseByTitle(title: string) {
    await this.click(this.page.getByText(title, { exact: true }).first());
  }

  async editAllTestCases() {
    const titles = await this.page.locator('.preview-card-title-value').allTextContents();
    
    for (let i = 0; i < titles.length; i++) {
      await this.openTestCaseByTitle(titles[i]);
      
      const suffix = i % 2 === 0 ? '(even)' : '(odd)';
      const newTitle = `${titles[i]} ${suffix}`;
      const newDescription = `Description for ${titles[i]}`;
      
      await this.titleInput.clear();
      await this.type(this.titleInput, newTitle);
      await this.descriptionInput.clear();
      await this.type(this.descriptionInput, newDescription);
      
      const stepCount = await this.page.getByPlaceholder('Test step').count();
      for (let j = 0; j < stepCount; j++) {
        const stepInput = this.page.getByPlaceholder('Test step').nth(j);
        const currentValue = await stepInput.inputValue();
        await stepInput.clear();
        await this.type(stepInput, `${j}: ${currentValue}`);
      }
      
      await this.click(this.submitButton);
      await this.page.waitForTimeout(500);
    }
  }
}
