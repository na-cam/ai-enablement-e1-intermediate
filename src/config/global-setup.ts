import fs from 'fs';
import path from 'path';

/** Start every run with empty logs so metrics and artifacts only describe this run. */
export default function globalSetup(): void {
  fs.rmSync(path.resolve('reports', 'logs'), { recursive: true, force: true });
  fs.rmSync(path.resolve('reports', 'api-metrics.md'), { force: true });
}
