import dotenv from 'dotenv';

/**
 * Environment selection.
 *   TEST_ENV=qa (default) | staging | prod ...
 * Loads `.env.<TEST_ENV>` first, then `.env` as a fallback. Real environment
 * variables (CI secrets) always win because dotenv never overrides them.
 */
export const ENV_NAME = process.env.TEST_ENV || 'qa';

dotenv.config({ path: `.env.${ENV_NAME}` });
dotenv.config();

/** Known environments. Add new ones here or provide BASE_URL explicitly. */
const KNOWN_ENVIRONMENTS: Record<string, string> = {
  qa: 'https://qa-sandbox.ni.htec.rs',
};

function resolveBaseUrl(): string {
  const url = process.env.BASE_URL || KNOWN_ENVIRONMENTS[ENV_NAME];
  if (!url) {
    throw new Error(
      `Unknown TEST_ENV "${ENV_NAME}". Set BASE_URL or add the environment to src/config/env.ts`,
    );
  }
  return url.replace(/\/$/, '');
}

export const env = {
  name: ENV_NAME,
  baseUrl: resolveBaseUrl(),
  get apiUrl(): string {
    return process.env.API_URL || `${this.baseUrl}/api`;
  },
  email: process.env.TEST_EMAIL || '',
  password: process.env.TEST_PASSWORD || '',
  /** localStorage key the SPA reads the bearer token from (used by the hybrid fixture). */
  tokenStorageKey: process.env.AUTH_STORAGE_KEY || 'jwtSandboxToken',
  refreshTokenStorageKey: process.env.AUTH_REFRESH_STORAGE_KEY || 'jwtSandboxRefreshToken',
  /** Requests slower than this are flagged as performance anomalies (ms). */
  slowRequestMs: Number(process.env.SLOW_REQUEST_MS || 3000),
};
