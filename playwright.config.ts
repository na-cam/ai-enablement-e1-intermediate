import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? '50%' : undefined,
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    actionTimeout: 10000,
    baseURL: process.env.BASE_URL || 'https://qa-sandbox.ni.htec.rs',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'on' : 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }]
  ],
  projects: [
    {
      name: 'ui-chromium',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /api\..*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-webkit',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /api\..*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'api',
      testMatch: /api\..*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
