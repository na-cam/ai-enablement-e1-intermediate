import fs from 'fs';
import path from 'path';

export type LogChannel = 'api' | 'ui';

const LOG_DIR = path.resolve('reports', 'logs');
const SENSITIVE = /^(authorization|password|token|refreshtoken|cookie|set-cookie)$/i;

/** Replaces secrets so logs can be published safely as CI artifacts. */
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        SENSITIVE.test(k) ? '***' : redact(v),
      ]),
    );
  }
  return value;
}

/**
 * Appends one JSON line per event to reports/logs/<channel>-worker<N>.log.
 * One file per worker avoids interleaved writes when running in parallel.
 */
export function log(channel: LogChannel, entry: Record<string, unknown>): void {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const worker = process.env.TEST_PARALLEL_INDEX ?? '0';
  const line = JSON.stringify({ ts: new Date().toISOString(), ...(redact(entry) as object) });
  fs.appendFileSync(path.join(LOG_DIR, `${channel}-worker${worker}.log`), `${line}\n`);
}
