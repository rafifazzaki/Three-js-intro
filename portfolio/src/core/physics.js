import * as CANNON from 'cannon-es';
import { PHYSICS, SCENE } from '../config.js';

/**
 * The physics world, plus the entity wrapper that keeps a three.js mesh
 * and a cannon-es body in sync.
 *
 * Three things the old implementation got wrong, all fixed here:
 *
 *  1. Every body was added to the world at load time, even for objects
 *     that were still invisible. They fell, collided and settled while
 *     off-screen, so by the time you scrolled them in they were already
 *     lying somewhere unexpected. Bodies now enter the world only when
 *     their stage spawns.
 *
 *  2. Rewinding the scroll reset `body.position` but left `velocity`,
 *     `angularVelocity` and `quaternion` untouched. An object teleported
 *     back to its spawn point kept the speed and spin it had picked up,
 *     so it rocketed down or tumbled. `reset()` clears all of it.
 *
 *  3. No contact material existed, so everything used cannon's default
 *     friction (0.3) and restitution (0.0) with no damping — objects slid
 *     forever and never came to rest. There is now an explicit material
 *     pair plus damping and sleeping.
 */
export function createPhysics() {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, PHYSICS.gravity, 0),
  });

  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;
  world.solver.iterations = 12;

  const groundMaterial = new CANNON.Material('ground');
  const objectMaterial = new CANNON.Material('object');

  world.addContactMaterial(
    new CANNON.ContactMaterial(groundMaterial, objectMaterial, {
      friction: PHYSICS.friction,
      restitution: PHYSICS.restitution,
      contactEquationStiffness: 1e7,
      contactEquationRelaxation: 3,
    })
  );
  world.addContactMaterial(
    new CANNON.ContactMaterial(objectMaterial, objectMaterial, {
      friction: PHYSICS.friction * 0.8,
      restitution: PHYSICS.restitution,
    })
  );

  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane(),
    material: groundMaterial,
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  groundBody.position.set(0, SCENE.groundY, 0);
  world.addBody(groundBody);

  let accumulator = 0;

  /**
   * Fixed-timestep integration against the real frame delta, so the
   * simulation runs the same on a 60Hz and a 144Hz display. The old code
   * called `fixedStep()` with no delta from inside the render loop, and
   * called it before the "still loading" guard, so the world ticked for
   * the whole loading screen.
   */
  function step(delta) {
    accumulator += Math.min(delta, PHYSICS.maxDelta);
    let substeps = 0;
    while (accumulator >= PHYSICS.timeStep && substeps < PHYSICS.maxSubSteps) {
      world.step(PHYSICS.timeStep);
      accumulator -= PHYSICS.timeStep;
      substeps += 1;
    }
    // Drop any backlog we could not chew through rather than spiralling.
    if (accumulator > PHYSICS.timeStep * PHYSICS.maxSubSteps) {
      accumulator = 0;
    }
  }

  return { world, step, groundMaterial, objectMaterial };
}

/**
 * Pairs one visual object with one body and owns its lifecycle.
 */
export class PhysicsEntity {
  /**
   * @param {object}  opts
   * @param {string}  opts.id
   * @param {THREE.Object3D} opts.mesh
   * @param {CANNON.Body}    opts.body
   * @param {{x:number,y:number,z:number}} opts.spawn
   * @param {CANNON.Quaternion} [opts.spawnQuaternion]
   * @param {number} [opts.halfHeight]
   */
  constructor({ id, mesh, body, spawn, spawnQuaternion, halfHeight = 0.5 }) {
    this.id = id;
    this.mesh = mesh;
    this.body = body;
    this.spawn = spawn;
    /** Used to float a label clear of the object's top. */
    this.halfHeight = halfHeight;
    this.spawnQuaternion =
      spawnQuaternion ?? new CANNON.Quaternion(0, 0, 0, 1);
    this.active = false;

    body.linearDamping = PHYSICS.linearDamping;
    body.angularDamping = PHYSICS.angularDamping;
    body.allowSleep = true;
    body.sleepSpeedLimit = PHYSICS.sleepSpeedLimit;
    body.sleepTimeLimit = PHYSICS.sleepTimeLimit;

    this.mesh.visible = false;
    this.reset();
  }

  /** Clears *all* motion state, not just position. */
  reset() {
    const { body, spawn } = this;
    body.position.set(spawn.x, spawn.y, spawn.z);
    body.quaternion.copy(this.spawnQuaternion);
    body.previousPosition.set(spawn.x, spawn.y, spawn.z);
    body.initPosition.set(spawn.x, spawn.y, spawn.z);
    body.velocity.setZero();
    body.initVelocity.setZero();
    body.angularVelocity.setZero();
    body.initAngularVelocity.setZero();
    body.force.setZero();
    body.torque.setZero();
    body.interpolatedPosition.set(spawn.x, spawn.y, spawn.z);
    body.interpolatedQuaternion.copy(this.spawnQuaternion);
    body.wakeUp();
    this.sync();
  }

  /** Adds the body to the simulation and shows the mesh. */
  spawnInto(world) {
    if (this.active) return;
    this.reset();
    world.addBody(this.body);
    this.mesh.visible = true;
    this.active = true;
  }

  /** Removes the body from the simulation and hides the mesh. */
  despawnFrom(world) {
    if (!this.active) return;
    world.removeBody(this.body);
    this.mesh.visible = false;
    this.active = false;
    this.reset();
  }

  /** Copies body transform onto the mesh. Called before every render. */
  sync() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
