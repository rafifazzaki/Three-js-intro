/**
 * Every tunable number lives here so the scene can be retuned without
 * hunting through logic. The old main.js scattered magic numbers across
 * 1000 lines; this is the single source of truth.
 */

export const SCENE = {
  groundY: -1.5,
  groundSize: 120,
  cameraFov: 60,
  cameraNear: 0.1,
  cameraFar: 500,
  // Where the camera rests on the landing view.
  homePosition: { x: 0, y: 6, z: 18 },
  homeTarget: { x: 0, y: 0, z: 0 },
  background: 0x0d0f12,
  fog: { color: 0x0d0f12, near: 28, far: 90 },
};

export const CAMERA_VIEWS = {
  home: {
    position: { x: 0, y: 6, z: 18 },
    target: { x: 0, y: 0, z: 0 },
  },
  cv: {
    position: { x: 14, y: 9, z: 14 },
    target: { x: 0, y: 1, z: 0 },
  },
  contact: {
    position: { x: 0, y: 4, z: 9 },
    target: { x: 0, y: 3.5, z: 0 },
  },
};

export const PHYSICS = {
  gravity: -14,
  // Fixed simulation step. Real delta is accumulated against this so the
  // simulation is frame-rate independent.
  timeStep: 1 / 60,
  maxSubSteps: 4,
  // Clamp the delta so a backgrounded tab does not fast-forward the world.
  maxDelta: 1 / 15,
  friction: 0.45,
  restitution: 0.12,
  linearDamping: 0.12,
  angularDamping: 0.22,
  sleepSpeedLimit: 0.14,
  sleepTimeLimit: 0.6,
};

/**
 * Scroll stages. Each entry drops one object into the scene.
 *
 * `at` is the scroll progress (0-1) that spawns the object.
 * `release` is the progress below which it is removed again — the gap
 * between the two is hysteresis, so jittering on the threshold does not
 * respawn the object dozens of times per second.
 */
export const STAGES = [
  { id: 'marble', at: 0.04, release: 0.015 },
  { id: 'orb', at: 0.2, release: 0.17 },
  { id: 'controller', at: 0.37, release: 0.34 },
  { id: 'keyboard', at: 0.54, release: 0.51 },
  { id: 'omni', at: 0.71, release: 0.68 },
  { id: 'keypad', at: 0.88, release: 0.85 },
];

// Total scrollable height, as a multiple of the viewport.
export const SCROLL_PAGES = 4;

/**
 * Layout breakpoint. Kept in sync with the `max-width: 720px` block in
 * styles/hud.css — the HUD switches layout here. Camera framing does not
 * use it; that is derived from the aspect ratio instead (see below).
 */
export const BREAKPOINTS = {
  mobile: 720,
};

/**
 * A phone viewport is far narrower than it is tall, so the same camera
 * distance crops objects off the sides. Pull back on narrow screens.
 *
 * The old site handled this by calling `modelLinedUp()` below 682px, which
 * teleported every object into a hand-placed row — and still dropped them
 * all into the middle of the screen on top of each other.
 */
/** Half-width of the scene that must stay in frame, in world units. */
export const SCENE_RADIUS = 9.5;

/**
 * Distance the camera needs to keep SCENE_RADIUS inside the horizontal
 * field of view at the current aspect ratio.
 *
 * A perspective camera's vertical FOV is fixed, so the horizontal FOV
 * shrinks with the viewport. A portrait phone therefore needs roughly
 * twice the distance of a landscape desktop for the same spread to fit.
 *
 * Derived rather than switched on a breakpoint: a 660px-wide desktop
 * window is not a phone and should not get a phone's framing, and there is
 * no jump as the window crosses any particular width.
 */
export function requiredDistance() {
  const aspect = window.innerWidth / window.innerHeight;
  const vHalf = (SCENE.cameraFov * Math.PI) / 360;
  const hHalf = Math.atan(Math.tan(vHalf) * aspect);
  return SCENE_RADIUS / Math.tan(hHalf);
}

/**
 * Scales a view's position along its own direction so the whole scene
 * fits, never moving closer than the view was authored at.
 *
 * Pulling the camera is the only lever used. Drawing the spawn points
 * inward instead was tried and reverted: it packed the objects close
 * enough that their footprints overlapped, and they shoved each other
 * indefinitely rather than ever coming to rest.
 */
export function resolveView(name) {
  const view = CAMERA_VIEWS[name] ?? CAMERA_VIEWS.home;
  const { x, y, z } = view.position;

  const base = Math.hypot(x, y, z);
  const scale = Math.max(requiredDistance() / base, 1);

  return {
    position: { x: x * scale, y: y * scale, z: z * scale },
    target: view.target,
  };
}
