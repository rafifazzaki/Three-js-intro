import * as THREE from 'three';
import { PROJECT_BY_OBJECT, PROFILE } from '../projects.js';

const HIGHLIGHT = new THREE.Color(0x2f6bd4);

/**
 * Hover and click handling for the 3D objects.
 *
 * The old version stored `INTERSECTED.currentHex` from a single mesh, then
 * `traverse`d the whole object writing red into every material it found.
 * Restoring only put the one mesh back, and because GLTF materials are
 * shared between meshes, tinting one object could leave another one red
 * permanently. This tracks the object *id*, drives `emissive` instead of
 * `color` (so the base colour is never destroyed), and restores every mesh
 * it touched.
 */
export class Interactions {
  /**
   * @param {object} opts
   * @param {THREE.WebGLRenderer} opts.renderer
   * @param {THREE.Camera} opts.camera
   * @param {Map<string, {mesh: THREE.Object3D}>} opts.entities
   * @param {THREE.Object3D} opts.badge
   * @param {(project:object)=>void} opts.onSelect
   */
  constructor({ renderer, camera, entities, badge, onSelect }) {
    this.renderer = renderer;
    this.camera = camera;
    this.entities = entities;
    this.badge = badge;
    this.onSelect = onSelect;

    this.enabled = false;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hovered = null;
    this.saved = new Map();
    // A drag that ends over an object must not count as a click.
    this.downAt = null;

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', this.onPointerMove.bind(this));
    dom.addEventListener('pointerdown', this.onPointerDown.bind(this));
    dom.addEventListener('pointerup', this.onPointerUp.bind(this));
    dom.addEventListener('pointerleave', () => this.setHover(null));
  }

  enable() {
    this.enabled = true;
  }

  get targets() {
    const list = [...this.entities.values()]
      .filter((e) => e.active)
      .map((e) => e.mesh);
    // Only while it has actually faded in — see the cross-fade in main.js.
    if (this.badge?.visible) list.push(this.badge);
    return list;
  }

  updatePointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  pick(event) {
    this.updatePointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.targets, true);
    if (!hits.length) return null;

    // Walk up until we find the tagged pivot.
    let node = hits[0].object;
    while (node && !node.userData.objectId) node = node.parent;
    return node?.userData.objectId ?? null;
  }

  onPointerMove(event) {
    if (!this.enabled) return;
    this.setHover(this.pick(event));
  }

  onPointerDown(event) {
    this.downAt = { x: event.clientX, y: event.clientY };
  }

  onPointerUp(event) {
    if (!this.enabled || !this.downAt) return;
    const dx = event.clientX - this.downAt.x;
    const dy = event.clientY - this.downAt.y;
    this.downAt = null;
    // Treat anything over 6px as an orbit drag, not a click.
    if (Math.hypot(dx, dy) > 6) return;

    const id = this.pick(event);
    if (!id) return;

    if (id === 'contactLinkedin') {
      window.open(PROFILE.linkedin, '_blank', 'noopener');
      return;
    }

    const project = PROJECT_BY_OBJECT.get(id);
    if (project) this.onSelect(project);
  }

  setHover(id) {
    if (this.hovered === id) return;
    if (this.hovered) this.restore(this.hovered);
    this.hovered = id;
    if (id) this.apply(id);
    this.renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
  }

  objectById(id) {
    if (id === 'contactLinkedin') return this.badge;
    return this.entities.get(id)?.mesh ?? null;
  }

  apply(id) {
    const object = this.objectById(id);
    if (!object) return;
    const saved = [];
    object.traverse((child) => {
      if (!child.isMesh || !child.material?.emissive) return;
      saved.push({
        material: child.material,
        emissive: child.material.emissive.clone(),
        intensity: child.material.emissiveIntensity,
      });
      child.material.emissive.copy(HIGHLIGHT);
      child.material.emissiveIntensity = 0.65;
    });
    this.saved.set(id, saved);
  }

  restore(id) {
    const saved = this.saved.get(id);
    if (!saved) return;
    // Restores every mesh that was touched, not just the one hit.
    for (const entry of saved) {
      entry.material.emissive.copy(entry.emissive);
      entry.material.emissiveIntensity = entry.intensity;
    }
    this.saved.delete(id);
  }
}
