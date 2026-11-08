/**
 * Maintenance script (NOT a test): removes every test case on the configured
 * account. Use it to reset the sandbox after an aborted run.
 *   npm run cleanup            (TEST_ENV selects the environment)
 */
import { request } from '@playwright/test';
import { ApiClient } from '../src/api/ApiClient';
import { env } from '../src/config/env';

async function main(): Promise<void> {
  const context = await request.newContext();
  const api = new ApiClient(context);
  await api.login(env.email, env.password);
  const all = await api.getTestCases();
  for (const tc of all) {
    if (tc.id !== undefined) await api.deleteTestCaseById(tc.id);
  }
  console.log(`[${env.name}] removed ${all.length} test case(s)`);
  await context.dispose();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
