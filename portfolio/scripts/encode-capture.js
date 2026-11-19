/**
 * Encodes the captured PNG sequence into the files the bento tile uses.
 *
 * Run `npm run capture` first — that prints the URL to open, which writes
 * assets/capture/frames/. Then `npm run encode` produces, in public/clip/:
 *
 *   portfolio.mp4    h.264, for Safari / iOS
 *   portfolio.webm   VP9, smaller where it is supported
 *   portfolio.jpg    poster frame, also the prefers-reduced-motion still
 *
 * Deliberately not a GIF: the scene is a dark background with smooth
 * gradients, which bands badly at 256 colours, and GIF would be an order
 * of magnitude larger than either video for the same clip.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const FRAME_DIR = resolve('assets/capture/frames');
const OUT_DIR = resolve('public/clip');
const FPS = 30;
/** Poster is taken late, after the tags are up but before the fade-out. */
const POSTER_AT = 0.78;

/**
 * A short dip to black at each end. The camera already returns to its
 * start position, but the scene state cannot — the clip opens on falling
 * objects and ends on settled ones with their tags up — so the seam is
 * hidden rather than matched.
 */
const FADE = 0.4;

if (!existsSync(FRAME_DIR)) {
  console.error(`No frames at ${FRAME_DIR}. Run "npm run capture" first.`);
  process.exit(1);
}

const frames = readdirSync(FRAME_DIR).filter((f) => f.endsWith('.png'));
if (frames.length === 0) {
  console.error(`No .png frames in ${FRAME_DIR}. Run "npm run capture" first.`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const pattern = join(FRAME_DIR, 'frame-%05d.png');
const ff = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });

const duration = frames.length / FPS;
const fadeOutStart = Math.max(duration - FADE, 0).toFixed(3);
const fades = `fade=t=in:st=0:d=${FADE},fade=t=out:st=${fadeOutStart}:d=${FADE}`;

console.log(`${frames.length} frames at ${FPS}fps (${duration.toFixed(1)}s)\n`);

// h.264. yuv420p and even dimensions are what make it play everywhere;
// faststart puts the index first so it can begin before fully loading.
ff([
  '-framerate', String(FPS),
  '-i', pattern,
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '24',
  '-pix_fmt', 'yuv420p',
  '-vf', `scale=trunc(iw/2)*2:trunc(ih/2)*2,${fades}`,
  '-movflags', '+faststart',
  '-an',
  join(OUT_DIR, 'portfolio.mp4'),
]);

// VP9. -b:v 0 is required for -crf to act as true constant quality.
ff([
  '-framerate', String(FPS),
  '-i', pattern,
  '-c:v', 'libvpx-vp9',
  '-crf', '36',
  '-b:v', '0',
  '-row-mt', '1',
  '-pix_fmt', 'yuv420p',
  '-vf', fades,
  '-an',
  join(OUT_DIR, 'portfolio.webm'),
]);

const posterIndex = Math.min(
  frames.length - 1,
  Math.round((frames.length - 1) * POSTER_AT)
);
ff([
  '-i', join(FRAME_DIR, `frame-${String(posterIndex).padStart(5, '0')}.png`),
  '-q:v', '4',
  join(OUT_DIR, 'portfolio.jpg'),
]);

const kb = (p) => `${Math.round(statSync(p).size / 1024)}kB`;
for (const name of ['portfolio.mp4', 'portfolio.webm', 'portfolio.jpg']) {
  console.log(`${name.padEnd(18)} ${kb(join(OUT_DIR, name))}`);
}
console.log(`\nposter from frame ${posterIndex}`);
