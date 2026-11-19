import * as THREE from 'three';
import { PHYSICS } from './config.js';
import { PROJECT_BY_OBJECT } from './projects.js';

/**
 * Deterministic frame capture for the bento-tile clip.
 *
 * Nothing here runs on requestAnimationFrame. The simulation is advanced
 * by an exact number of fixed steps per frame and each frame is rendered
 * and read back in an awaited loop, so the output is identical on every
 * run and is unaffected by a throttled or backgrounded tab — which is
 * precisely what makes real-time screen recording unreliable.
 *
 * Frames are POSTed to the dev-only endpoint in vite.config.js;
 * `npm run encode` turns the sequence into mp4 / webm / poster.
 */

export const WIDTH = 720;
export const HEIGHT = 720;
export const FPS = 30;
const DURATION = 12;
export const FRAMES = FPS * DURATION;

/** Simulated seconds by which every object has landed. */
const ALL_LANDED = 2.6;

/** First label appears, then one every LABEL_STAGGER, each over LABEL_FADE. */
const LABEL_START = 4.2;
const LABEL_STAGGER = 0.5;
const LABEL_FADE = 0.55;

/** Order the tags appear in — the same order the objects dropped. */
const LABEL_ORDER = [
  'marble',
  'orb',
  'controller',
  'keyboard',
  'omni',
  'keypad',
];

/** Steps per captured frame. 1/30 of a second at a 1/60 step = 2. */
const STEPS_PER_FRAME = Math.round((1 / FPS) / PHYSICS.timeStep);

/**
 * Simulated before frame 0, so the clip opens on objects already in the
 * air rather than on an empty floor. 45 steps = 0.75s exactly — enough
 * for the first object to have fallen into the middle of the frame.
 */
const PRE_ROLL_STEPS = 45;

/**
 * Seconds from the start of the simulation. Tightly staggered so several
 * objects are in the air at once and the opening reads as a cascade
 * rather than a queue.
 */
const SPAWN_AT = {
  marble: 0.0,
  orb: 0.15,
  controller: 0.3,
  keyboard: 0.48,
  omni: 0.66,
  keypad: 0.86,
};

/**
 * The camera swings out and comes back, ending exactly where it started,
 * so the clip loops without the camera jumping. A full 360 would also
 * loop, but at a speed slow enough to be pleasant it would need a ~45s
 * clip; this covers ~60 degrees of travel at about 5 deg/sec.
 */
const CAMERA = {
  angleFrom: -0.22,
  angleTo: 0.3,
  radiusFrom: 17.6,
  radiusTo: 16.4,
  heightFrom: 6.0,
  heightTo: 5.4,
  target: new THREE.Vector3(0, 0.3, 0),
};

/** Zero derivative at both ends, so the turn-around has no visible kink. */
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

export async function startCapture(ctx) {
  prepare(ctx);

  const labels = createLabels(ctx);

  await fetch('/__capture/reset', { method: 'POST' });

  let simTime = 0;
  let badgeFade = 0;
  let trackFade = 1;

  for (let i = 0; i < PRE_ROLL_STEPS; i += 1) {
    simTime = stepOnce(ctx, simTime);
  }
  syncAll(ctx);

  for (let frame = 0; frame < FRAMES; frame += 1) {
    // Camera time is normalised over the whole clip; everything else runs
    // on simulated seconds.
    const t = FRAMES > 1 ? frame / (FRAMES - 1) : 0;
    const clipTime = frame / FPS;

    placeCamera(ctx.camera, t);

    const settled = isSettled(ctx);
    badgeFade = updateBadge(ctx, badgeFade, settled);
    trackFade = updateTrack(ctx, simTime, trackFade, settled);
    updateLabels(labels, clipTime, ctx.camera);

    ctx.renderer.render(ctx.scene, ctx.camera);
    await postFrame(ctx.renderer.domElement, frame);

    for (let s = 0; s < STEPS_PER_FRAME; s += 1) {
      simTime = stepOnce(ctx, simTime);
    }
    syncAll(ctx);

    if (ctx.onProgress) ctx.onProgress(frame + 1, FRAMES);
  }

  return { frames: FRAMES, fps: FPS, width: WIDTH, height: HEIGHT };
}

function prepare(ctx) {
  const { renderer, camera, controls, track } = ctx;

  document.documentElement.classList.add('is-capturing');
  document.documentElement.style.setProperty('--capture-w', `${WIDTH}px`);
  document.documentElement.style.setProperty('--capture-h', `${HEIGHT}px`);

  // Orbit damping would make the camera path non-deterministic.
  controls.enabled = false;

  // Pixel ratio 1 so the backing store is exactly WIDTH x HEIGHT.
  renderer.setPixelRatio(1);
  renderer.setSize(WIDTH, HEIGHT, true);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();

  track.setFade(1);

  for (const entity of ctx.entities.values()) {
    entity.despawnFrom(ctx.world);
  }
}

/**
 * The scroll track, driven by how far through the drop sequence we are
 * instead of by scroll position: the marker descends and each ring lights
 * as its object spawns, exactly as it reads on the site. It fades out
 * once everything has landed, handing over to the name.
 */
function updateTrack(ctx, simTime, fade, settled) {
  const active = new Set(
    [...ctx.entities.values()].filter((e) => e.active).map((e) => e.id)
  );
  ctx.track.update(clamp01(simTime / ALL_LANDED), active, simTime);

  const next = fade + ((settled ? 0 : 1) - fade) * 0.05;
  ctx.track.setFade(next);
  return next;
}

function isSettled(ctx) {
  const entities = [...ctx.entities.values()];
  return (
    entities.length > 0 &&
    entities.every(
      (e) =>
        e.active &&
        (e.body.sleepState > 0 || e.body.velocity.lengthSquared() < 0.09)
    )
  );
}

function stepOnce(ctx, simTime) {
  for (const [id, at] of Object.entries(SPAWN_AT)) {
    const entity = ctx.entities.get(id);
    if (entity && !entity.active && simTime >= at) {
      entity.spawnInto(ctx.world);
    }
  }
  ctx.world.step(PHYSICS.timeStep);
  return simTime + PHYSICS.timeStep;
}

function syncAll(ctx) {
  for (const entity of ctx.entities.values()) {
    if (entity.active) entity.sync();
  }
}

function placeCamera(camera, t) {
  // Triangle wave: out over the first half, back over the second, so the
  // last frame's camera matches the first frame's exactly.
  const pingPong = 1 - Math.abs(2 * t - 1);
  const e = easeInOutSine(pingPong);

  const angle = THREE.MathUtils.lerp(CAMERA.angleFrom, CAMERA.angleTo, e);
  const radius = THREE.MathUtils.lerp(CAMERA.radiusFrom, CAMERA.radiusTo, e);
  const height = THREE.MathUtils.lerp(CAMERA.heightFrom, CAMERA.heightTo, e);

  camera.position.set(
    Math.sin(angle) * radius,
    height,
    Math.cos(angle) * radius
  );
  camera.lookAt(CAMERA.target);
}

/** Fades the name in once everything has come to rest, as on the site. */
function updateBadge(ctx, fade, settled) {
  const next = fade + ((settled ? 1 : 0) - fade) * 0.06;

  if (ctx.badge) {
    ctx.badge.visible = next > 0.01;
    ctx.badge.traverse((child) => {
      if (child.isMesh) child.material.opacity = next;
    });
  }
  return next;
}

/* ------------------------------------------------------------- labels -- */

/**
 * The site's project tags are DOM elements, which `canvas.toBlob()` does
 * not see — only the WebGL canvas is read back. For the clip they are
 * rebuilt as sprites with a canvas texture, so they are part of the
 * render. Sprites always face the camera, which is what keeps them
 * readable while it orbits.
 */
function createLabels(ctx) {
  const labels = [];

  LABEL_ORDER.forEach((id, index) => {
    const entity = ctx.entities.get(id);
    const project = PROJECT_BY_OBJECT.get(id);
    if (!entity || !project) return;

    const sprite = makeLabelSprite(
      project.shortTitle ?? project.title,
      project.dateText ?? ''
    );
    // Drawn on top of the scene, like the DOM tags they replace.
    sprite.renderOrder = 10;
    ctx.scene.add(sprite);

    labels.push({
      sprite,
      entity,
      appearsAt: LABEL_START + index * LABEL_STAGGER,
    });
  });

  return labels;
}

const LIFT_STEP = 0.32;
const MAX_LIFTS = 12;

/**
 * Positions the tags above their objects and lifts any that would cover
 * one already placed.
 *
 * Overlap is resolved in screen space, not world space: two objects far
 * apart in the scene can still line up from a given camera angle, and
 * since the camera orbits, which pairs collide keeps changing. Sprite
 * size on screen is derived from distance and the vertical FOV.
 */
function updateLabels(labels, clipTime, camera) {
  const tanHalfFov = Math.tan((camera.fov * Math.PI) / 360);
  const placed = [];
  const point = new THREE.Vector3();

  for (const label of labels) {
    const opacity = clamp01((clipTime - label.appearsAt) / LABEL_FADE);
    label.sprite.material.opacity = opacity;
    label.sprite.visible = opacity > 0.01;

    // A little pop as it arrives, settling to full size.
    const scale = 0.94 + 0.06 * opacity;
    const w = label.sprite.userData.w * scale;
    const h = label.sprite.userData.h * scale;
    label.sprite.scale.set(w, h, 1);

    if (!label.sprite.visible) continue;

    const body = label.entity.body.position;
    const baseY = body.y + label.entity.halfHeight + 0.5;

    let lift = 0;
    let box = null;

    for (let attempt = 0; attempt <= MAX_LIFTS; attempt += 1) {
      point.set(body.x, baseY + lift, body.z);
      const distance = camera.position.distanceTo(point);
      point.project(camera);

      const halfH = h / 2 / (distance * tanHalfFov);
      const halfW = w / 2 / (distance * tanHalfFov * camera.aspect);
      box = { x: point.x, y: point.y, halfW, halfH };

      if (!collides(box, placed)) break;
      lift += LIFT_STEP;
    }

    placed.push(box);
    label.sprite.position.set(body.x, baseY + lift, body.z);
  }
}

function collides(box, placed) {
  for (const other of placed) {
    if (
      Math.abs(box.x - other.x) < box.halfW + other.halfW &&
      Math.abs(box.y - other.y) < box.halfH + other.halfH
    ) {
      return true;
    }
  }
  return false;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function makeLabelSprite(title, date) {
  // Drawn at 2x and scaled down, so the text stays sharp when the camera
  // pushes in.
  const s = 2;
  const stack =
    '"Century Gothic", CenturyGothic, Geneva, system-ui, sans-serif';
  const titleFont = `600 ${22 * s}px ${stack}`;
  const dateFont = `500 ${18 * s}px ${stack}`;

  const measure = document.createElement('canvas').getContext('2d');
  measure.font = titleFont;
  const titleWidth = measure.measureText(title).width;
  measure.font = dateFont;
  const dateWidth = date ? measure.measureText(date).width : 0;

  const gap = date ? 12 * s : 0;
  const padX = 16 * s;
  const padY = 10 * s;
  const lineHeight = 26 * s;

  const w = Math.ceil(padX * 2 + titleWidth + gap + dateWidth);
  const h = Math.ceil(padY * 2 + lineHeight);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');

  g.fillStyle = 'rgba(13, 16, 21, 0.74)';
  roundRect(g, 0, 0, w, h, 11 * s);
  g.fill();

  g.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  g.lineWidth = 1.5 * s;
  roundRect(g, 0.75 * s, 0.75 * s, w - 1.5 * s, h - 1.5 * s, 11 * s);
  g.stroke();

  const baseline = h / 2 + 8 * s;
  g.textBaseline = 'alphabetic';
  g.font = titleFont;
  g.fillStyle = '#eef3f8';
  g.fillText(title, padX, baseline);

  if (date) {
    g.font = dateFont;
    g.fillStyle = '#5b9dff';
    g.fillText(date, padX + titleWidth + gap, baseline);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    })
  );

  const worldHeight = 0.58;
  sprite.userData.h = worldHeight;
  sprite.userData.w = worldHeight * (w / h);
  sprite.scale.set(sprite.userData.w, worldHeight, 1);
  sprite.visible = false;
  return sprite;
}

/* -------------------------------------------------------------- output -- */

async function postFrame(canvas, index) {
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );
  if (!blob) throw new Error(`frame ${index}: canvas.toBlob returned null`);

  const response = await fetch(`/__capture/frame?i=${index}`, {
    method: 'POST',
    body: blob,
  });
  if (!response.ok) {
    throw new Error(`frame ${index}: ${response.status}`);
  }
}
