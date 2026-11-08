import { test, expect } from '../../src/fixtures';
import { TestCase } from '../../src/api/types';

const base = (title: string): Partial<TestCase> => ({
  title,
  description: 'API created',
  expected_result: 'Expected',
  automated: false,
  test_steps: [{ value: 'Step 1' }],
});

test.describe('API: Test cases', () => {
  test('TC-024: list returns an array', async ({ api }) => {
    expect(Array.isArray(await api.getTestCases())).toBe(true);
  });

  test('TC-025: create returns an item with a numeric id', async ({ api }) => {
    const created = await api.createTestCase(base('API Create'));
    expect(typeof created.id).toBe('number');
    expect(created.title).toContain('API Create');
  });

  test('TC-016: edit via API changes the stored title', async ({ api }) => {
    const created = await api.createTestCase(base('API Edit'));
    const newTitle = `${created.title} (edited)`;
    await api.updateTestCase(created.id!, { ...created, title: newTitle });
    const stored = (await api.getTestCases()).find((t) => t.id === created.id);
    expect(stored?.title).toBe(newTitle);
  });

  test('TC-019: delete single test case removes only that item', async ({ api }) => {
    const a = await api.createTestCase(base('API Delete A'));
    const b = await api.createTestCase(base('API Delete B'));
    await api.deleteTestCaseById(a.id!);
    const ids = (await api.getTestCases()).map((t) => t.id);
    expect(ids).not.toContain(a.id);
    expect(ids).toContain(b.id);
  });

  test('TC-022: deleting twice is idempotent', async ({ api }) => {
    const created = await api.createTestCase(base('API Idempotent'));
    await api.deleteTestCaseById(created.id!);
    await expect(api.deleteTestCaseById(created.id!)).resolves.toBeUndefined();
  });

  test('TC-027: unknown id with invalid token gives a client error', async ({ anonApi }) => {
    const { response } = await anonApi.send('get', '/candidate/testcases/999999', {
      auth: 'invalid-token',
    });
    expect([401, 404]).toContain(response.status());
  });

  test('TC-028: parallel creates keep titles unique', async ({ api }) => {
    const [a, b] = await Promise.all([
      api.createTestCase(base('Parallel')),
      api.createTestCase(base('Parallel')),
    ]);
    expect(a.title).not.toBe(b.title);
    expect(a.id).not.toBe(b.id);
  });

  test('TC-034: create without title is rejected (negative)', async ({ api }) => {
    const { title: _omit, ...withoutTitle } = base('x');
    const { response } = await api.send('post', '/candidate/testcases', { data: withoutTitle });
    expect(response.ok()).toBeFalsy();
  });

  test('TC-035: create without a token is rejected (security)', async ({ anonApi }) => {
    const { response } = await anonApi.send('post', '/candidate/testcases', {
      data: base('No token'),
      auth: false,
    });
    expect(response.status()).toBe(401);
  });

  test.describe('performance', () => {
    const BUDGET_MS = 3000;

    test('TC-036: GET list responds within budget', async ({ api }) => {
      const { response, durationMs } = await api.send('get', '/candidate/testcases');
      expect(response.ok()).toBeTruthy();
      test.info().annotations.push({ type: 'duration', description: `${durationMs}ms` });
      expect(durationMs).toBeLessThan(BUDGET_MS);
    });

    test('TC-037: POST create responds within budget', async ({ api }) => {
      const started = Date.now();
      await api.createTestCase(base('API Perf'));
      const elapsed = Date.now() - started;
      test.info().annotations.push({ type: 'duration', description: `${elapsed}ms` });
      expect(elapsed).toBeLessThan(BUDGET_MS);
    });
  });
});
