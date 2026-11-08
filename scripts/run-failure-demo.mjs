/**
 * Evidence helper: runs the intentionally failing demo test and copies its
 * screenshot, video and trace into docs/evidence/failure-demo/.
 *   npm run demo:failure
 * The demo test is expected to fail; this script only reports a problem if no
 * evidence was produced.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('docs', 'evidence', 'failure-demo');
const SRC = path.resolve('reports', 'test-results');

spawnSync('npx', ['playwright', 'test', '--project=demo-failure'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, DEMO_FAILURE: '1' },
});

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

const wanted = walk(SRC).filter((f) => /\.(png|webm|zip|md)$/.test(f));
if (wanted.length === 0) {
  console.error('No failure evidence found in reports/test-results.');
  process.exit(1);
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const file of wanted) fs.copyFileSync(file, path.join(OUT, path.basename(file)));
console.log(`Copied ${wanted.length} evidence file(s) to ${OUT}`);
