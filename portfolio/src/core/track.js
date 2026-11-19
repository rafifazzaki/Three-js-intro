import * as THREE from 'three';
import { STAGES, SCENE } from '../config.js';

/**
 * A vertical "drop shaft" at the centre of the scene that visualises
 * scroll progress in 3D.
 *
 * A marker descends the spine as you scroll, and each of the six rings
 * lights as its object spawns — so the indicator and the thing it is
 * indicating occupy the same space, instead of the progress living in a
 * separate HTML rail off to the side.
 *
 * Once every object has landed and come to rest, the whole track fades out
 * and hands off to the name text (see the cross-fade in main.js).
 */

/**
 * Kept short enough that the marker's starting position is comfortably
 * inside the frame at the home camera. An earlier version ran to y=11,
 * which put the top of the track — and so the start of the scroll — above
 * the top edge of the viewport.
 */
const TOP_Y = 6.4;
const BOTTOM_Y = SCENE.groundY + 0.15;

export function createScrollTrack(scene) {
  const group = new THREE.Group();
  const materials = [];

  /** Tracks base opacity so the master fade can scale every material. */
  const makeMaterial = (color, opacity) => {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      toneMapped: false,
    });
    material.userData.baseOpacity = opacity;
    materials.push(material);
    return material;
  };

  // --- spine --------------------------------------------------------------
  const spineMaterial = makeMaterial(0x5b9dff, 0.2);
  const spine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, TOP_Y - BOTTOM_Y, 6),
    spineMaterial
  );
  spine.position.y = (TOP_Y + BOTTOM_Y) / 2;
  group.add(spine);

  // --- one ring per stage -------------------------------------------------
  const ticks = STAGES.map((stage) => {
    const y = THREE.MathUtils.lerp(TOP_Y, BOTTOM_Y, stage.at);
    const material = makeMaterial(0x5b9dff, 0.26);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.017, 8, 32),
      material
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    group.add(ring);
    return { id: stage.id, mesh: ring, material, y, lit: 0 };
  });

  // --- travelling marker --------------------------------------------------
  const markerMaterial = makeMaterial(0xdce9ff, 0.95);
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 16, 16),
    markerMaterial
  );
  group.add(marker);

  const haloMaterial = makeMaterial(0x5b9dff, 0.3);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    haloMaterial
  );
  marker.add(halo);

  scene.add(group);

  let fade = 1;

  return {
    group,

    /**
     * @param {number} progress 0..1 scroll position
     * @param {Set<string>} active ids of stages currently spawned
     * @param {number} elapsed seconds, for the pulse
     */
    update(progress, active, elapsed) {
      marker.position.y = THREE.MathUtils.lerp(TOP_Y, BOTTOM_Y, progress);

      const pulse = 1 + Math.sin(elapsed * 3.4) * 0.12;
      halo.scale.setScalar(pulse);

      for (const tick of ticks) {
        // Ease each ring toward lit/unlit rather than snapping.
        const target = active.has(tick.id) ? 1 : 0;
        tick.lit += (target - tick.lit) * 0.12;
        tick.material.userData.baseOpacity = 0.18 + tick.lit * 0.72;
        tick.mesh.scale.setScalar(1 + tick.lit * 0.25);
      }

      this.setFade(fade);
    },

    /** Master opacity, 1 = fully visible, 0 = gone. */
    setFade(value) {
      fade = value;
      for (const material of materials) {
        material.opacity = material.userData.baseOpacity * fade;
      }
      group.visible = fade > 0.01;
    },
  };
}
