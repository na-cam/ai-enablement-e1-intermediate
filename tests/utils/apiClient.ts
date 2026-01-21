import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { LoginResponse, TestCase } from './types';

export class ApiClient {
  private token?: string;
  private _refreshToken?: string;

  constructor(
    private request: APIRequestContext,
    private baseUrl: string = 'https://qa-sandbox.ni.htec.rs/api'
  ) {}

  get authToken(): string | undefined {
    return this.token;
  }

  get refreshToken(): string | undefined {
    return this._refreshToken;
  }

  public setAuthToken(token: string) {
    this.token = token;
  }

  private authHeaders(extra?: Record<string, string>) {
    return {
      ...(extra || {}),
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      'Content-Type': 'application/json',
    };
  }

  public async login(email: string, password: string): Promise<{ token: string; refreshToken: string }> {
    const resp = await this.request.post(`${this.baseUrl}/candidate/login`, {
      data: { email, password }
    });

    if (!resp.ok()) {
      throw new Error(`Login failed: ${resp.status()} | ${await resp.text()}`);
    }

    const data: LoginResponse = await resp.json();

    if (!data.success || !data.token) {
      throw new Error(`Invalid login response: ${JSON.stringify(data)}`);
    }

    this.token = data.token;
    this._refreshToken = data.refreshToken;

    return { token: data.token, refreshToken: data.refreshToken };
  }

  public async getTestCases(): Promise<TestCase[]> {
    const resp = await this.request.get(`${this.baseUrl}/candidate/testcases`, {
      headers: this.authHeaders()
    });

    if (!resp.ok()) {
      throw new Error(`getTestCases failed: ${resp.status()}`);
    }

    return await resp.json();
  }

  public async createTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
    const uniqueTitle = `${testCase.title}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const uniqueTestCase = { ...testCase, title: uniqueTitle };
    
    const resp = await this.request.post(`${this.baseUrl}/candidate/testcases`, {
      headers: this.authHeaders(),
      data: uniqueTestCase
    });

    if (!resp.ok()) {
      const text = await resp.text().catch(() => '');
      throw new Error(`createTestCase failed: ${resp.status()} | ${text}`);
    }

    const result = await resp.json();
    
    if (Array.isArray(result)) {
      const created = result.find(tc => tc.title === uniqueTitle);
      if (!created) {
        throw new Error(`Created test case not found in response`);
      }
      return created;
    }
    
    return result;
  }

  public async updateTestCase(id: number, testCase: Partial<TestCase>): Promise<TestCase> {
    const resp = await this.request.put(`${this.baseUrl}/candidate/testcases/${id}`, {
      headers: this.authHeaders(),
      data: testCase
    });

    if (!resp.ok()) {
      const text = await resp.text().catch(() => '');
      throw new Error(`updateTestCase failed: ${resp.status()} | ${text}`);
    }

    return await resp.json();
  }

  public async deleteTestCaseById(id: number): Promise<void> {
    const resp = await this.request.delete(`${this.baseUrl}/candidate/testcases/${id}`, {
      headers: this.authHeaders()
    });

    if (resp.status() === 404) {
      return;
    }

    if (!resp.ok()) {
      const text = await resp.text().catch(() => '');
      throw new Error(`deleteTestCaseById failed (${id}): ${resp.status()} ${text}`);
    }
  }

  public async deleteAllTestCasesOneByOne(): Promise<void> {
    const snapshot = await this.getTestCases();
    for (const tc of snapshot) {
      const id = tc.id!;
      await this.deleteTestCaseById(id);
      await expect.poll(async () => {
        const list = await this.getTestCases();
        return list.some(x => x.id === id);
      }).toBe(false);
    }
  }


}
