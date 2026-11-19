import { defineConfig } from 'vite';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const FRAME_DIR = resolve('assets/capture/frames');

/**
 * Dev-only endpoint that writes captured frames to disk.
 *
 * The capture page renders each frame deterministically and POSTs the PNG
 * here; `npm run encode` then feeds the sequence to ffmpeg. Nothing about
 * this ships — `apply: 'serve'` keeps it out of the production build.
 *
 * The only filename input is a frame index, which is coerced to a
 * non-negative integer and formatted, so no caller-supplied string ever
 * reaches the path.
 */
function captureFrameWriter() {
  return {
    name: 'capture-frame-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__capture', (req, res, next) => {
        if (req.method !== 'POST') return next();

        // req.url is the path after the '/__capture' mount point.
        const url = new URL(req.url, 'http://localhost');

        if (url.pathname === '/reset') {
          rmSync(FRAME_DIR, { recursive: true, force: true });
          mkdirSync(FRAME_DIR, { recursive: true });
          res.statusCode = 200;
          res.end('reset');
          return;
        }

        if (url.pathname !== '/frame') return next();

        const index = Number.parseInt(url.searchParams.get('i') ?? '', 10);
        if (!Number.isInteger(index) || index < 0 || index > 99999) {
          res.statusCode = 400;
          res.end('bad frame index');
          return;
        }

        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          const name = `frame-${String(index).padStart(5, '0')}.png`;
          mkdirSync(FRAME_DIR, { recursive: true });
          writeFileSync(resolve(FRAME_DIR, name), Buffer.concat(chunks));
          res.statusCode = 200;
          res.end(name);
        });
        req.on('error', () => {
          res.statusCode = 500;
          res.end('write failed');
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [captureFrameWriter()],
});
