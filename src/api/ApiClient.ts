import { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import { log } from '../utils/logger';
import { LoginResponse, TestCase } from './types';

type Method = 'get' | 'post' | 'put' | 'delete';

export interface TimedResponse {
  response: APIResponse;
  durationMs: number;
}

/**
 * Thin API client. Every call is logged (request + response + duration) and
 * every test case created through it is tracked so it can be removed again.
 */
export class ApiClient {
  private token?: string;
  private refresh?: string;
  private readonly createdIds = new Set<number>();
  private readonly trackedTitles = new Set<string>();

  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string = env.apiUrl,
  ) {}

  get authToken(): string | undefined {
    return this.token;
  }

  get refreshToken(): string | undefined {
    return this.refresh;
  }

  setAuthToken(token: string): void {
    this.token = token;
  }

  /** Remember a title created through the UI so cleanup() can delete it. */
  trackTitle(title: string): void {
    this.trackedTitles.add(title);
  }

  /** Low-level call: logged, timed, never throws on HTTP errors. */
  async send(
    method: Method,
    path: string,
    options: { data?: unknown; auth?: boolean | string } = {},
  ): Promise<TimedResponse> {
    const { data, auth = true } = options;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof auth === 'string') headers.Authorization = `Bearer ${auth}`;
    else if (auth && this.token) headers.Authorization = `Bearer ${this.token}`;

    const url = `${this.baseUrl}${path}`;
    const started = Date.now();
    const response = await this.request[method](url, { headers, data });
    const durationMs = Date.now() - started;

    const bodyText = await response.text().catch(() => '');
    log('api', {
      method: method.toUpperCase(),
      url,
      requestHeaders: headers,
      requestBody: data,
      status: response.status(),
      durationMs,
      responseBody: bodyText.slice(0, 2000),
    });
    return { response, durationMs };
  }

  async login(email: string, password: string): Promise<{ token: string; refreshToken: string }> {
    const { response } = await this.send('post', '/candidate/login', {
      data: { email, password },
      auth: false,
    });
    if (!response.ok()) {
      throw new Error(`Login failed: ${response.status()} | ${await response.text()}`);
    }
    const data: LoginResponse = await response.json();
    if (!data.success || !data.token) {
      throw new Error('Invalid login response (success flag or token missing)');
    }
    this.token = data.token;
    this.refresh = data.refreshToken;
    return { token: data.token, refreshToken: data.refreshToken };
  }

  async getTestCases(): Promise<TestCase[]> {
    const { response } = await this.send('get', '/candidate/testcases');
    if (!response.ok()) throw new Error(`getTestCases failed: ${response.status()}`);
    return response.json();
  }

  /** Creates a test case with a unique title and registers it for cleanup. */
  async createTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
    const uniqueTitle = `${testCase.title}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const { response } = await this.send('post', '/candidate/testcases', {
      data: { ...testCase, title: uniqueTitle },
    });
    if (!response.ok()) {
      throw new Error(`createTestCase failed: ${response.status()} | ${await response.text()}`);
    }
    const result = await response.json();
    // The API answers with the full list; pick the new item by its unique title.
    const created: TestCase | undefined = Array.isArray(result)
      ? result.find((tc: TestCase) => tc.title === uniqueTitle)
      : result;
    if (!created) throw new Error('Created test case not found in response');
    if (created.id !== undefined) this.createdIds.add(created.id);
    return created;
  }

  async updateTestCase(id: number, testCase: Partial<TestCase>): Promise<TestCase> {
    const { response } = await this.send('put', `/candidate/testcases/${id}`, { data: testCase });
    if (!response.ok()) {
      throw new Error(`updateTestCase failed: ${response.status()} | ${await response.text()}`);
    }
    return response.json();
  }

  /** Idempotent: 404 counts as already deleted. */
  async deleteTestCaseById(id: number): Promise<void> {
    const { response } = await this.send('delete', `/candidate/testcases/${id}`);
    if (response.status() === 404) return;
    if (!response.ok()) {
      throw new Error(`deleteTestCaseById failed (${id}): ${response.status()}`);
    }
    this.createdIds.delete(id);
  }

  /**
   * Removes only the data this client created (by id) or was told about (by
   * title). Safe to run in parallel with other workers on the same account.
   */
  async cleanup(): Promise<void> {
    if (!this.token) return;
    const titles = [...this.trackedTitles];
    if (titles.length > 0) {
      const all = await this.getTestCases().catch(() => [] as TestCase[]);
      for (const tc of all) {
        if (tc.id !== undefined && titles.some((t) => tc.title.includes(t))) {
          this.createdIds.add(tc.id);
        }
      }
    }
    for (const id of [...this.createdIds]) {
      await this.deleteTestCaseById(id).catch(() => undefined);
    }
    this.createdIds.clear();
    this.trackedTitles.clear();
  }
}
