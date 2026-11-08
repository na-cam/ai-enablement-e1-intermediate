import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

/**
 * All generated output lives under ./reports so CI can publish ONE folder:
 *   reports/html-report   HTML report (open index.html via `npm run report`)
 *   reports/junit         JUnit XML
 *   reports/test-results  videos, traces, screenshots (per test)
 *   reports/logs          API + UI network logs (JSON lines)
 * NOTE: never pass --reporter on the CLI; it silently overrides the paths below.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: 'reports/test-results',
  globalSetup: './src/config/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? '50%' : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    actionTimeout: 10_000,
    baseURL: env.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on',
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],
  projects: [
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { video: 'off', screenshot: 'off' },
    },
    // Only registered by `npm run demo:failure` (see scripts/run-failure-demo.mjs);
    // never part of the normal run or CI.
    ...(process.env.DEMO_FAILURE
      ? [
          {
            name: 'demo-failure',
            testDir: './tests/demo',
            retries: 0,
            use: { ...devices['Desktop Chrome'] },
          },
        ]
      : []),
  ],
});
