/**
 * Compresses every model in assets/models-src into public/obj.
 *
 * Source .glb files are the originals and are never shipped; only the
 * compressed output under public/ is served. Re-run with `npm run models`
 * after adding or replacing a source model.
 *
 * Draco handles geometry, WebP handles textures. On the current set this
 * takes 8.4 MB down to roughly 340 KB.
 *
 * The decoder that reads these back at runtime lives in public/draco and is
 * wired up in src/core/objects.js — if it ever goes missing, models stop
 * loading entirely rather than just loading slowly.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SRC = resolve('assets/models-src');
const OUT = resolve('public/obj');
const TEXTURE_SIZE = 1024;

mkdirSync(OUT, { recursive: true });

const models = readdirSync(SRC).filter((f) => f.endsWith('.glb'));

if (!models.length) {
  console.error(`No .glb files found in ${SRC}`);
  process.exit(1);
}

const kb = (p) => Math.round(statSync(p).size / 1024);
let before = 0;
let after = 0;

for (const name of models) {
  const from = join(SRC, name);
  const to = join(OUT, name);

  execFileSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      'gltf-transform',
      'optimize',
      from,
      to,
      '--compress',
      'draco',
      '--texture-compress',
      'webp',
      '--texture-size',
      String(TEXTURE_SIZE),
    ],
    { stdio: 'ignore' }
  );

  before += kb(from);
  after += kb(to);
  console.log(`${name.padEnd(28)} ${kb(from)}kB -> ${kb(to)}kB`);
}

const saved = Math.round((1 - after / before) * 100);
console.log(`\ntotal ${before}kB -> ${after}kB (${saved}% smaller)`);
