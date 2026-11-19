import * as THREE from 'three';
import { PROJECT_BY_OBJECT } from '../projects.js';

/**
 * Floating name + date tags that sit above each object in the scene, so
 * you can tell what everything is without clicking it.
 *
 * These are plain DOM elements projected from world space rather than 3D
 * text: text stays crisp at any distance, wraps and ellipsises normally,
 * and costs nothing to restyle — where the old site's one piece of 3D text
 * was a 1.1 MB mesh.
 *
 * A tag appears only once its object has come to rest, so they do not
 * chase six falling objects around the screen.
 */
export class Labels {
  /**
   * @param {HTMLElement} root
   * @param {Map<string, import('../core/physics.js').PhysicsEntity>} entities
   * @param {THREE.Camera} camera
   */
  constructor(root, entities, camera) {
    this.entities = entities;
    this.camera = camera;
    this.enabled = true;
    this.hovered = null;
    this.projected = new THREE.Vector3();

    this.layer = document.createElement('div');
    this.layer.className = 'hud-labels';
    root.appendChild(this.layer);

    this.elements = new Map();
    for (const [id] of entities) {
      const project = PROJECT_BY_OBJECT.get(id);
      if (!project) continue;

      const el = document.createElement('div');
      el.className = 'scene-label';
      // Short title, not the full one: six full titles at once overlap
      // each other badly at this camera distance.
      el.innerHTML = `
        <span class="scene-label-title">${
          project.shortTitle ?? project.title
        }</span>
        ${
          project.dateText
            ? `<span class="scene-label-date">${project.dateText}</span>`
            : ''
        }`;
      el.title = project.title;
      this.layer.appendChild(el);
      this.elements.set(id, el);
    }
  }

  /** Hidden wholesale while a panel covers the scene. */
  setEnabled(value) {
    this.enabled = value;
    this.layer.classList.toggle('is-hidden', !value);
  }

  setHovered(id) {
    if (this.hovered === id) return;
    this.hovered = id;
    for (const [key, el] of this.elements) {
      el.classList.toggle('is-hovered', key === id);
    }
  }

  update() {
    if (!this.enabled) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const placed = [];

    for (const [id, el] of this.elements) {
      const entity = this.entities.get(id);
      if (!entity?.active) {
        el.classList.remove('is-visible');
        continue;
      }

      const resting =
        entity.body.sleepState > 0 ||
        entity.body.velocity.lengthSquared() < 0.35;
      if (!resting) {
        el.classList.remove('is-visible');
        continue;
      }

      this.projected.set(
        entity.body.position.x,
        entity.body.position.y + entity.halfHeight + 0.35,
        entity.body.position.z
      );
      this.projected.project(this.camera);

      // z outside [-1, 1] means the point is behind the camera or beyond
      // the far plane; projecting it would place the tag at a mirrored
      // position on screen.
      if (this.projected.z > 1 || this.projected.z < -1) {
        el.classList.remove('is-visible');
        continue;
      }

      let x = (this.projected.x * 0.5 + 0.5) * width;
      let y = (-this.projected.y * 0.5 + 0.5) * height;

      // Size is constant once rendered, so measure once rather than
      // forcing a layout read every frame for every tag.
      if (!el.dataset.w && el.offsetWidth) {
        el.dataset.w = el.offsetWidth;
        el.dataset.h = el.offsetHeight;
      }
      const w = Number(el.dataset.w) || 90;
      const h = Number(el.dataset.h) || 22;

      // Keep the tag inside the viewport. An object near the edge of a
      // narrow screen would otherwise have half its label cut off.
      const margin = 6;
      x = Math.min(Math.max(x, w / 2 + margin), width - w / 2 - margin);

      // Tags are anchored above their object. Where two would collide,
      // lift the later one clear so both stay readable.
      let guard = 0;
      while (guard < 14 && overlaps(x, y, w, h, placed)) {
        y -= h + 4;
        guard += 1;
      }
      placed.push({ x, y, w, h });

      el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(
        y
      )}px, 0) translate(-50%, -100%)`;
      el.classList.add('is-visible');
    }
  }
}

/** Axis-aligned hit test against already-placed tags. */
function overlaps(x, y, w, h, placed) {
  const left = x - w / 2;
  const top = y - h;
  for (const r of placed) {
    const rLeft = r.x - r.w / 2;
    const rTop = r.y - r.h;
    if (
      left < rLeft + r.w &&
      left + w > rLeft &&
      top < rTop + r.h &&
      top + h > rTop
    ) {
      return true;
    }
  }
  return false;
}
