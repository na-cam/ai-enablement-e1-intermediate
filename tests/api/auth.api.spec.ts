import { test, expect } from '../../src/fixtures';
import { env } from '../../src/config/env';

test.describe('API: Authentication', () => {
  test('TC-005: authentication returns a valid bearer token', async ({ anonApi }) => {
    const { token } = await anonApi.login(env.email, env.password);
    expect(token.length).toBeGreaterThan(20);
  });

  test('TC-023: login response schema', async ({ anonApi }) => {
    const { response } = await anonApi.send('post', '/candidate/login', {
      data: { email: env.email, password: env.password },
      auth: false,
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(typeof data.token).toBe('string');
    expect(typeof data.refreshToken).toBe('string');
  });

  test('TC-026: protected endpoint requires a token', async ({ anonApi }) => {
    const { response } = await anonApi.send('get', '/candidate/testcases', { auth: false });
    expect(response.status()).toBe(401);
  });

  test('TC-031: wrong password is rejected and no token is issued', async ({ anonApi }) => {
    const { response } = await anonApi.send('post', '/candidate/login', {
      data: { email: env.email, password: 'definitely-wrong-password' },
      auth: false,
    });
    expect(response.ok()).toBeFalsy();
    expect(await response.text()).not.toContain('"token"');
  });

  test('TC-032: empty credentials are rejected', async ({ anonApi }) => {
    const { response } = await anonApi.send('post', '/candidate/login', {
      data: { email: '', password: '' },
      auth: false,
    });
    expect(response.ok()).toBeFalsy();
  });

  test('TC-033: malformed bearer token is rejected (security)', async ({ anonApi }) => {
    const { response } = await anonApi.send('get', '/candidate/testcases', {
      auth: 'not.a.valid.jwt',
    });
    expect(response.status()).toBeGreaterThanOrEqual(401);
    expect(response.status()).toBeLessThan(500);
  });
});
