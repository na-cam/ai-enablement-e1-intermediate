/**
 * Reporting helper: summarises API response times from reports/logs/api-worker*.log
 * into reports/api-metrics.md (count, min, avg, p95, max per endpoint, error count).
 *   npm run metrics     (run after the tests; CI does this automatically)
 */
import fs from 'fs';
import path from 'path';

interface Entry {
  method: string;
  url: string;
  status: number;
  durationMs: number;
}

const LOG_DIR = path.resolve('reports', 'logs');
const OUT = path.resolve('reports', 'api-metrics.md');

function readEntries(): Entry[] {
  if (!fs.existsSync(LOG_DIR)) return [];
  return fs
    .readdirSync(LOG_DIR)
    .filter((f) => f.startsWith('api-worker'))
    .flatMap((f) => fs.readFileSync(path.join(LOG_DIR, f), 'utf8').split('\n'))
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Entry);
}

/** /api/candidate/testcases/123 -> /api/candidate/testcases/:id */
function endpointKey(e: Entry): string {
  const p = new URL(e.url).pathname.replace(/\/\d+(?=\/|$)/g, '/:id');
  return `${e.method} ${p}`;
}

function percentile(sorted: number[], p: number): number {
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
}

const entries = readEntries();
if (entries.length === 0) {
  console.error('No API log entries found. Run the tests first.');
  process.exit(1);
}

const groups = new Map<string, Entry[]>();
for (const e of entries) {
  const key = endpointKey(e);
  groups.set(key, [...(groups.get(key) ?? []), e]);
}

const rows = [...groups.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, list]) => {
    const times = list.map((e) => e.durationMs).sort((a, b) => a - b);
    const avg = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
    const errors = list.filter((e) => e.status >= 400).length;
    return `| ${key} | ${list.length} | ${times[0]} | ${avg} | ${percentile(times, 95)} | ${times[times.length - 1]} | ${errors} |`;
  });

const all = entries.map((e) => e.durationMs).sort((a, b) => a - b);
const report = [
  '# API performance metrics',
  '',
  `Calls: ${entries.length} | p95: ${percentile(all, 95)} ms | max: ${all[all.length - 1]} ms`,
  '',
  '| Endpoint | Calls | Min ms | Avg ms | p95 ms | Max ms | HTTP >= 400 |',
  '|---|---|---|---|---|---|---|',
  ...rows,
  '',
  '_HTTP >= 400 includes the expected responses of negative tests._',
  '',
].join('\n');

fs.writeFileSync(OUT, report);
console.log(report);
