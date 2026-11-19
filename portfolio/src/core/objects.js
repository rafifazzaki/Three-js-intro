import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { PhysicsEntity } from './physics.js';

/**
 * Object definitions.
 *
 * `spawn` is where the body is dropped from. The old scene dropped almost
 * everything from (0-2, 7-15, 0-2) — nearly the same column — so objects
 * landed on top of each other and shoved each other around. Each one now
 * gets its own drop point.
 *
 * `size` is the object's longest dimension in world units. The old code
 * used raw scale factors (0.01, 0.03, 0.1, 1) hand-tuned per model, which
 * meant nothing about the result was predictable — the collision boxes had
 * to be guessed separately and never matched. Normalising to a target size
 * makes every model land at a known scale, so the shape can be fitted to
 * it automatically.
 *
 * `tilt` gives a little initial rotation so nothing lands perfectly flat.
 */
const DEFINITIONS = [
  {
    id: 'marble',
    url: '/obj/marble_test.glb',
    size: 1.7,
    shape: 'sphere',
    mass: 6,
    spawn: { x: -4.5, y: 9, z: 2.5 },
  },
  {
    id: 'orb',
    procedural: 'orb',
    size: 2,
    shape: 'sphere',
    mass: 6,
    spawn: { x: 3.8, y: 11, z: 3.2 },
  },
  {
    id: 'controller',
    url: '/obj/game_controller2.glb',
    size: 3.4,
    shape: 'box',
    mass: 4,
    spawn: { x: 5.2, y: 10, z: -2.6 },
    tilt: { axis: [0, 0, 1], angle: 0.35 },
  },
  {
    id: 'keyboard',
    url: '/obj/mech_keyboard.glb',
    size: 6.2,
    shape: 'box',
    mass: 9,
    spawn: { x: -5.4, y: 12, z: -3.4 },
    tilt: { axis: [1, 0, 0], angle: 0.22 },
  },
  {
    id: 'omni',
    url: '/obj/omnidirectional.glb',
    size: 3.2,
    shape: 'box',
    mass: 7,
    spawn: { x: 0.6, y: 13, z: -6.2 },
    tilt: { axis: [0, 1, 0], angle: 0.6 },
  },
  {
    id: 'keypad',
    url: '/obj/keypad.glb',
    size: 2.6,
    shape: 'box',
    mass: 3,
    spawn: { x: -1.6, y: 14, z: 5.6 },
    tilt: { axis: [0, 0, 1], angle: -0.3 },
  },
];

/**
 * The LinkedIn badge is decorative — it hovers, it never falls.
 *
 * The model is text geometry lying flat in the XZ plane (2.4 x 0.08 x 0.21
 * once normalised), so head-on it is an invisible sliver. In the old scene
 * it was parked at y=46 with three point lights around it and was only
 * ever glimpsed from the contact camera. Standing it upright and giving it
 * an emissive material makes it legible from the default view.
 */
const DECOR = {
  id: 'contactLinkedin',
  url: '/obj/contact-linkedin.glb',
  size: 4.2,
  // Sits above the band where the object tags land, so the two do not
  // collide once everything has settled.
  position: { x: 0, y: 5.1, z: 0 },
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};

/**
 * Normalises a loaded GLTF scene:
 *  - scales it so its longest dimension equals `size`
 *  - re-centres the geometry on its own bounding box
 *  - tags every mesh with the object id for raycasting
 *  - enables shadows
 *
 * Re-centring is what fixes the visual offset. The old code nudged each
 * model inside a wrapper Group by hand (`keyboard.position.set(-3.2, -1.5, 0)`)
 * while the Group followed the physics body, so the model you saw was
 * always displaced from the box it was actually colliding with. Here the
 * model's centre *is* the body's centre, so collisions line up with what
 * is drawn.
 *
 * @returns {{ pivot: THREE.Group, size: THREE.Vector3 }}
 */
function normaliseModel(gltfScene, { id, size: targetSize }) {
  const model = gltfScene;

  // Measure at scale 1, then scale to the requested longest dimension.
  model.scale.setScalar(1);
  model.updateMatrixWorld(true);
  const raw = new THREE.Box3()
    .setFromObject(model)
    .getSize(new THREE.Vector3());
  const longest = Math.max(raw.x, raw.y, raw.z) || 1;
  model.scale.setScalar(targetSize / longest);
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());

  // Shift so the model's bounding-box centre sits on the pivot origin.
  model.position.sub(centre);

  const pivot = new THREE.Group();
  pivot.name = id;
  pivot.add(model);

  pivot.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      // Cloning the material means hover tinting one object can never
      // bleed into another that happens to share a GLTF material.
      child.material = child.material.clone();
      child.userData.objectId = id;
    }
    child.userData.objectId = id;
  });

  return { pivot, size };
}

function makeShape(kind, size) {
  if (kind === 'sphere') {
    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    return new CANNON.Sphere(Math.max(radius, 0.05));
  }
  // Box half-extents, with a small inset so resting objects do not
  // visually intersect the floor by a hairline.
  return new CANNON.Box(
    new CANNON.Vec3(
      Math.max(size.x * 0.5 - 0.01, 0.02),
      Math.max(size.y * 0.5 - 0.01, 0.02),
      Math.max(size.z * 0.5 - 0.01, 0.02)
    )
  );
}

function buildOrb({ size }) {
  const radius = size / 2;
  const pivot = new THREE.Group();
  pivot.name = 'orb';
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(radius, 4),
    new THREE.MeshStandardMaterial({
      color: 0xe58943,
      roughness: 0.3,
      metalness: 0.35,
      emissive: 0x3a1c05,
      emissiveIntensity: 0.4,
    })
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.objectId = 'orb';
  pivot.userData.objectId = 'orb';
  pivot.add(mesh);
  return { pivot, size: new THREE.Vector3(size, size, size) };
}

/**
 * Loads everything and returns the physics entities plus the decorative
 * badge. Resolves once every asset is in.
 *
 * @param {THREE.Scene} scene
 * @param {CANNON.Material} objectMaterial
 * @param {(loaded:number, total:number)=>void} onProgress
 */
export async function loadObjects(scene, objectMaterial, onProgress) {
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => onProgress(loaded, total);

  const loader = new GLTFLoader(manager);

  // The models in public/obj are Draco-compressed (see `npm run models`),
  // so the decoder has to be wired up or nothing loads. Decoder files are
  // copied from three into public/draco — `decoderPath` is a URL, not a
  // bundler import, so they must be served as static assets.
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');
  loader.setDRACOLoader(draco);

  const load = (url) =>
    new Promise((resolve, reject) =>
      loader.load(url, resolve, undefined, reject)
    );

  const entities = new Map();

  const results = await Promise.all(
    DEFINITIONS.map(async (def) => {
      const built = def.procedural
        ? buildOrb(def)
        : normaliseModel((await load(def.url)).scene, def);
      return { def, ...built };
    })
  );

  for (const { def, pivot, size } of results) {
    scene.add(pivot);

    const body = new CANNON.Body({
      mass: def.mass,
      shape: makeShape(def.shape, size),
      material: objectMaterial,
    });

    let spawnQuaternion;
    if (def.tilt) {
      spawnQuaternion = new CANNON.Quaternion();
      spawnQuaternion.setFromAxisAngle(
        new CANNON.Vec3(...def.tilt.axis),
        def.tilt.angle
      );
    }

    entities.set(
      def.id,
      new PhysicsEntity({
        id: def.id,
        mesh: pivot,
        body,
        spawn: def.spawn,
        spawnQuaternion,
        halfHeight: size.y * 0.5,
      })
    );
  }

  // --- decorative badge ---------------------------------------------------
  const badgeGltf = await load(DECOR.url);
  const { pivot: badge } = normaliseModel(badgeGltf.scene, DECOR);
  badge.position.set(DECOR.position.x, DECOR.position.y, DECOR.position.z);

  // The inner model carries the stand-up rotation so the pivot's own
  // rotation stays free for the idle sway in the render loop.
  badge.children[0].rotation.set(
    DECOR.rotation.x,
    DECOR.rotation.y,
    DECOR.rotation.z
  );

  // Self-lit, so it reads against the dark background from any angle
  // instead of depending on three point lights parked beside it.
  //
  // Starts fully transparent: the scroll track holds the centre of the
  // scene until every object has landed, then cross-fades to this.
  badge.traverse((child) => {
    if (!child.isMesh) return;
    child.material = new THREE.MeshStandardMaterial({
      color: 0x0a66c2,
      emissive: 0x2f7fe0,
      emissiveIntensity: 1.1,
      roughness: 0.35,
      metalness: 0.2,
      transparent: true,
      opacity: 0,
    });
    child.castShadow = false;
  });
  badge.visible = false;

  const badgeLight = new THREE.PointLight(0x4aa3ff, 10, 16, 2);
  badgeLight.position.set(0, DECOR.position.y, 2.5);
  scene.add(badgeLight);

  scene.add(badge);

  // Everything is decoded; release the Draco worker pool.
  draco.dispose();

  return { entities, badge };
}
