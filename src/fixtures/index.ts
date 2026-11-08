import { Page, test as base } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';
import { env } from '../config/env';
import { log } from '../utils/logger';

interface SlowRequest {
  url: string;
  ms: number;
}

type Fixtures = {
  /** Unauthenticated client (negative / security tests). */
  anonApi: ApiClient;
  /** Logged-in client; everything it creates is deleted after the test. */
  api: ApiClient;
  /** Page already authenticated by injecting the API bearer token (skips UI login). */
  authedPage: Page;
  /** XHR/fetch calls of the page that exceeded env.slowRequestMs. */
  networkMonitor: { slow: SlowRequest[] };
};

const slowByPage = new WeakMap<Page, SlowRequest[]>();

export const test = base.extend<Fixtures>({
  // Override the built-in page so EVERY UI test logs its XHR/fetch traffic.
  // Only requested by UI tests, so API-only tests never start a browser page.
  page: async ({ page }, use, testInfo) => {
    const slow: SlowRequest[] = [];
    slowByPage.set(page, slow);

    page.on('requestfinished', async (request) => {
      if (!['fetch', 'xhr'].includes(request.resourceType())) return;
      const response = await request.response();
      const timing = request.timing();
      const ms = timing.responseEnd >= 0 ? Math.round(timing.responseEnd) : 0;
      log('ui', {
        test: testInfo.title,
        method: request.method(),
        url: request.url(),
        status: response?.status(),
        durationMs: ms,
      });
      if (ms > env.slowRequestMs) slow.push({ url: request.url(), ms });
    });
    page.on('requestfailed', (request) => {
      log('ui', {
        test: testInfo.title,
        url: request.url(),
        failure: request.failure()?.errorText,
      });
    });

    await use(page);

    for (const s of slow) {
      testInfo.annotations.push({ type: 'slow-request', description: `${s.ms}ms ${s.url}` });
    }
  },

  anonApi: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  api: async ({ request }, use) => {
    const client = new ApiClient(request);
    await client.login(env.email, env.password);
    await use(client);
    await client.cleanup();
  },

  authedPage: async ({ page, api }, use) => {
    // Hybrid flow: the token obtained over the API is placed where the SPA expects it.
    await page.addInitScript(
      ([tokenKey, token, refreshKey, refresh]) => {
        window.localStorage.setItem(tokenKey, token);
        window.localStorage.setItem(refreshKey, refresh);
      },
      [
        env.tokenStorageKey,
        api.authToken as string,
        env.refreshTokenStorageKey,
        api.refreshToken ?? '',
      ],
    );
    await use(page);
  },

  networkMonitor: async ({ authedPage }, use) => {
    await use({ slow: slowByPage.get(authedPage) ?? [] });
  },
});

export { expect } from '@playwright/test';
