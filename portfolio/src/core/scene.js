import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SCENE, resolveView } from '../config.js';

/**
 * Renderer, camera, lights and ground.
 *
 * Deliberately contains no debug helpers. The old scene shipped a
 * PointLightHelper to production — that was the floating wireframe
 * diamond visible on the live site.
 */
/**
 * @param {HTMLCanvasElement} canvas
 * @param {{capture?: boolean}} [options] `capture` turns on
 *   preserveDrawingBuffer, without which `canvas.toBlob()` reads an
 *   already-cleared buffer and every captured frame comes out blank.
 */
export function createScene(canvas, { capture = false } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE.background);
  scene.fog = new THREE.Fog(SCENE.fog.color, SCENE.fog.near, SCENE.fog.far);

  const camera = new THREE.PerspectiveCamera(
    SCENE.cameraFov,
    window.innerWidth / window.innerHeight,
    SCENE.cameraNear,
    SCENE.cameraFar
  );
  const home = resolveView('home');
  camera.position.set(home.position.x, home.position.y, home.position.z);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: capture,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Cap at 2: on a 3x phone this is the difference between 30fps and 60fps.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 6;
  controls.maxDistance = 42;
  // Stop the camera dropping below the floor.
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(home.target.x, home.target.y, home.target.z);
  // Scroll drives the stage sequence, so the wheel must not also zoom.
  controls.enableZoom = false;
  controls.update();

  // --- lighting -----------------------------------------------------------
  const ambient = new THREE.AmbientLight(0xa9c4e0, 0.55);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(8, 16, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 60;
  key.shadow.camera.left = -20;
  key.shadow.camera.right = 20;
  key.shadow.camera.top = 20;
  key.shadow.camera.bottom = -20;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6ea8ff, 0.9);
  rim.position.set(-10, 7, -9);
  scene.add(rim);

  const bounce = new THREE.PointLight(0xffd9a0, 18, 36, 2);
  bounce.position.set(0, 2.5, 4);
  scene.add(bounce);

  // --- ground -------------------------------------------------------------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(SCENE.groundSize, SCENE.groundSize),
    new THREE.MeshStandardMaterial({
      color: 0x20262d,
      roughness: 0.92,
      metalness: 0.04,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = SCENE.groundY;
  ground.receiveShadow = true;
  // Excluded from raycasting so clicking the floor never selects anything.
  ground.userData.ignoreRaycast = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(SCENE.groundSize, 60, 0x2f3944, 0x252d36);
  grid.position.y = SCENE.groundY + 0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  grid.userData.ignoreRaycast = true;
  scene.add(grid);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', resize);

  return { scene, camera, renderer, controls, resize };
}
