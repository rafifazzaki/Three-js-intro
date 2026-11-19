/**
 * Prints what to open to record the clip.
 *
 * Capturing needs a real WebGL context, so it runs in a browser rather
 * than in Node. Rather than pull in Puppeteer and a bundled Chromium
 * (~300MB) for a one-off asset, the capture page drives itself: open the
 * URL, wait for the tab title to read "capture complete", then encode.
 */
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const FRAME_DIR = resolve('assets/capture/frames');
const PORT = process.env.PORT ?? 5174;
const URL = `http://localhost:${PORT}/?capture=1`;

const existing = existsSync(FRAME_DIR)
  ? readdirSync(FRAME_DIR).filter((f) => f.endsWith('.png')).length
  : 0;

console.log(`
  1. npm run dev        (in another terminal, if it is not already up)
  2. open  ${URL}
     The tab title counts frames, then reads "capture complete".
     Frames are written to assets/capture/frames/.
  3. npm run encode     -> public/clip/portfolio.{mp4,webm,jpg}
`);

if (existing > 0) {
  console.log(`  ${existing} frames already captured; opening the URL replaces them.\n`);
}
