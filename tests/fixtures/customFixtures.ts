import { test as base } from '@playwright/test';

type CustomFixtures = {
  customData: string;
};

export const test = base.extend<CustomFixtures>({
  customData: async ({}, use) => {
    await use('example-data');
  },
});

export { expect } from '@playwright/test';
