import { STAGES } from '../config.js';

/**
 * Drives stage spawning from scroll position.
 *
 * The old `fillCircles()` had the entire six-stage visibility block nested
 * *inside* `circles.forEach(...)`, so all six checks ran six times on every
 * single scroll event — 36 branches per event, unthrottled.
 *
 * This version listens once, defers to requestAnimationFrame, walks each
 * stage exactly once, and uses separate spawn/release thresholds so a
 * stage sitting on its boundary cannot flicker.
 *
 * It owns no DOM. Progress is read by the 3D scroll track (core/track.js),
 * which renders the indicator inside the scene itself.
 */
export class ScrollController {
  /**
   * @param {object} opts
   * @param {(id:string)=>void} opts.onSpawn
   * @param {(id:string)=>void} opts.onDespawn
   * @param {(progress:number)=>void} [opts.onProgress]
   */
  constructor({ onSpawn, onDespawn, onProgress }) {
    this.onSpawn = onSpawn;
    this.onDespawn = onDespawn;
    this.onProgress = onProgress;

    this.enabled = false;
    this.progress = 0;
    this.queued = false;
    this.active = new Set();

    this.handleScroll = this.handleScroll.bind(this);
    this.update = this.update.bind(this);
  }

  mount() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleScroll, { passive: true });
  }

  /** Nothing spawns until loading has finished. */
  enable() {
    this.enabled = true;
    this.handleScroll();
  }

  handleScroll() {
    if (this.queued) return;
    this.queued = true;
    requestAnimationFrame(this.update);
  }

  /** Scroll position as 0..1, guarding the divide-by-zero on short pages. */
  computeProgress() {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(Math.max(window.scrollY / scrollable, 0), 1);
  }

  update() {
    this.queued = false;
    if (!this.enabled) return;

    this.progress = this.computeProgress();

    for (const stage of STAGES) {
      const isActive = this.active.has(stage.id);

      if (!isActive && this.progress >= stage.at) {
        this.active.add(stage.id);
        this.onSpawn(stage.id);
      } else if (isActive && this.progress < stage.release) {
        this.active.delete(stage.id);
        this.onDespawn(stage.id);
      }
    }

    this.onProgress?.(this.progress);
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleScroll);
  }
}
