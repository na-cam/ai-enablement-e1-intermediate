/**
 * Reporting helper: converts the .webm videos Playwright recorded
 * (reports/test-results/**\/video.webm) into one watchable MP4.
 *   npm run test:chromium && npm run evidence:video
 * Output: docs/evidence/test-run.mp4
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const SRC = path.resolve('reports', 'test-results');
const OUT_DIR = path.resolve('docs', 'evidence');

function findVideos(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findVideos(full);
    return entry.name.endsWith('.webm') ? [full] : [];
  });
}

const videos = findVideos(SRC).sort();
if (videos.length === 0) {
  console.error('No videos found. Run the UI tests first (npm run test:chromium).');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const inputs = videos.flatMap((v) => ['-i', v]);
const scaled = videos
  .map((_, i) => `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25[v${i}]`)
  .join(';');
const concat = `${videos.map((_, i) => `[v${i}]`).join('')}concat=n=${videos.length}:v=1:a=0[out]`;
const output = path.join(OUT_DIR, 'test-run.mp4');

const result = spawnSync(
  ffmpegPath,
  ['-y', ...inputs, '-filter_complex', `${scaled};${concat}`, '-map', '[out]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', output],
  { stdio: 'inherit' },
);
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Wrote ${output} (${videos.length} recordings)`);
