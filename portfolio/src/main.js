import * as THREE from 'three';
import '../styles/base.css';
import '../styles/hud.css';
import '../styles/loader.css';

import { createScene } from './core/scene.js';
import { createPhysics } from './core/physics.js';
import { loadObjects } from './core/objects.js';
import { createScrollTrack } from './core/track.js';
import { Hud } from './ui/hud.js';
import { Labels } from './ui/labels.js';
import { ScrollController } from './ui/scroll.js';
import { Interactions } from './ui/interactions.js';
import { CameraDirector } from './ui/camera.js';
import { SCROLL_PAGES, requiredDistance, PHYSICS } from './config.js';

/**
 * ?capture=1 renders the bento-tile clip instead of running the site:
 * deterministic stepping, scripted camera, and no HUD at all. See
 * src/capture.js.
 */
const CAPTURE = new URLSearchParams(location.search).has('capture');

const canvas = document.getElementById('scene');
const loaderEl = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderText = document.getElementById('loader-text');

// The scrollable height is set from config in one place. The old site had
// `min-height: 500vh` in style.css fighting `height: 200vh` in scroll.css.
document.body.style.setProperty('--scroll-pages', String(SCROLL_PAGES));

const { scene, camera, renderer, controls } = createScene(canvas, {
  capture: CAPTURE,
});
const { world, step, objectMaterial } = createPhysics();

const hud = new Hud(document.getElementById('hud'));
const director = new CameraDirector(camera, controls);

hud.onViewChange = (view) => {
  director.flyTo(view);
  // A panel covers the scene, so the tags over it would float on top.
  labels?.setEnabled(!hud.openPanel);
};

/**
 * How far back the camera must sit depends on the aspect ratio, so a
 * resize can change the correct framing — rotating a phone, dragging a
 * window narrow. Re-frame only when that distance has moved meaningfully,
 * so ordinary resizes and mobile browser-chrome height changes never yank
 * a camera the user has orbited.
 */
let lastDistance = requiredDistance();
let reframeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(reframeTimer);
  reframeTimer = setTimeout(() => {
    const distance = requiredDistance();
    const ratio = distance / lastDistance;
    if (ratio > 0.92 && ratio < 1.08) return;
    lastDistance = distance;
    director.flyTo(director.current, 700);
  }, 180);
});

let entities = new Map();
let interactions = null;
let labels = null;
let badge = null;
let badgeBaseY = 0;
let ready = false;

const scroller = new ScrollController({
  onSpawn: (id) => entities.get(id)?.spawnInto(world),
  onDespawn: (id) => {
    entities.get(id)?.despawnFrom(world);
    // Hide a detail card whose object just left the scene.
    if (hud.detail.dataset.open === 'true') hud.hideDetail();
  },
  onProgress: (progress) => hud.updateRail(scroller.active, progress),
});
scroller.mount();

const track = createScrollTrack(scene);

/**
 * Cross-fade between the scroll track and the name text.
 *
 * 0 = track visible, text hidden (still dropping objects)
 * 1 = track gone, text visible (everything has landed)
 *
 * Eased every frame rather than switched, so scrolling back up reverses it
 * smoothly instead of popping.
 */
let handoff = 0;

/** Seconds all six objects have been in the scene, 0 when any is missing. */
let completeFor = 0;

/** Grace period after which the hand-off runs regardless of residual motion. */
const SETTLE_GRACE = 3.5;

/**
 * True once all six objects have spawned and come to rest.
 *
 * The grace period matters: two objects that land touching can nudge each
 * other for a long time without ever triggering cannon's sleep threshold.
 * Gating the cross-fade purely on "everything asleep" let that stall the
 * hand-off indefinitely, so after SETTLE_GRACE it proceeds anyway.
 */
function allSettled(delta) {
  if (entities.size === 0) return false;

  for (const entity of entities.values()) {
    if (!entity.active) {
      completeFor = 0;
      return false;
    }
  }
  completeFor += delta;

  for (const entity of entities.values()) {
    // sleepState > 0 is cannon's SLEEPY or SLEEPING; the speed check
    // catches an object still drifting too slowly to have triggered it.
    const resting =
      entity.body.sleepState > 0 || entity.body.velocity.length() < 0.3;
    if (!resting) return completeFor > SETTLE_GRACE;
  }
  return true;
}

const clock = new THREE.Clock();

function animate() {
  // Capture mode drives its own render loop; this one must not also run,
  // or it would step the physics between captured frames.
  if (CAPTURE) return;
  requestAnimationFrame(animate);

  // Clamped here, not just inside step(): a tab that was hidden for a
  // minute reports a delta of that whole minute, which would otherwise
  // fast-forward the settle timer and cross-fade to the name while the
  // objects are still visibly in the air.
  //
  // No `document.hidden` guard — browsers already stop firing rAF for a
  // hidden tab, and some embedded webviews report hidden while still
  // running it, which would freeze the scene outright.
  const delta = Math.min(clock.getDelta(), PHYSICS.maxDelta);
  const elapsed = clock.getElapsedTime();

  director.update(performance.now());

  if (ready) {
    // Physics is stepped only once loading is done, so objects are not
    // quietly simulated behind the loading screen.
    step(delta);
    for (const entity of entities.values()) {
      if (entity.active) entity.sync();
    }
    track.update(scroller.progress, scroller.active, elapsed);

    // Ease toward the target; ~0.9s each way at 60fps.
    const target = allSettled(delta) ? 1 : 0;
    handoff += (target - handoff) * Math.min(delta * 4, 1);

    track.setFade(1 - handoff);

    if (badge) {
      badge.position.y = badgeBaseY + Math.sin(elapsed * 1.1) * 0.16;
      badge.rotation.y = Math.sin(elapsed * 0.4) * 0.35;
      // Hidden outright below the threshold so it also stops being
      // raycastable — a transparent badge must not be clickable.
      badge.visible = handoff > 0.02;
      badge.traverse((child) => {
        if (child.isMesh) child.material.opacity = handoff;
      });
    }
  }

  controls.update();
  // Render last, after meshes have been synced this frame — the old loop
  // rendered before syncing, so every frame drew the previous step.
  renderer.render(scene, camera);

  // After render, so the tags follow the camera position just drawn.
  if (labels) {
    labels.setHovered(interactions?.hovered ?? null);
    labels.update();
  }
}
animate();

async function boot() {
  try {
    const loaded = await loadObjects(scene, objectMaterial, (done, total) => {
      const pct = Math.round((done / total) * 100);
      loaderBar.style.width = `${pct}%`;
      loaderText.textContent = `Loading ${pct}%`;
    });

    entities = loaded.entities;
    badge = loaded.badge;
    badgeBaseY = badge.position.y;

    if (CAPTURE) {
      loaderEl.remove();
      const { startCapture } = await import('./capture.js');
      window.__capture = startCapture({
        scene,
        camera,
        renderer,
        controls,
        world,
        entities,
        badge,
        track,
        onProgress: (done, total) => {
          document.title = `capture ${done}/${total}`;
        },
      });
      await window.__capture;
      document.title = 'capture complete';
      return;
    }

    interactions = new Interactions({
      renderer,
      camera,
      entities,
      badge,
      onSelect: (project) => hud.showDetail(project),
    });

    labels = new Labels(document.getElementById('hud'), entities, camera);

    ready = true;
    interactions.enable();
    scroller.enable();

    // Dev-only inspection handle. Stripped from production builds.
    if (import.meta.env.DEV) {
      window.__portfolio = {
        THREE,
        scene,
        world,
        entities,
        scroller,
        hud,
        camera,
        badge,
      };
    }

    loaderEl.classList.add('is-done');
    setTimeout(() => loaderEl.remove(), 600);
    document.body.classList.add('is-ready');
  } catch (error) {
    console.error('Failed to load scene assets', error);
    loaderText.textContent = 'Could not load the 3D scene.';
    loaderBar.style.width = '100%';
    loaderBar.style.background = '#b4503c';
  }
}

boot();
