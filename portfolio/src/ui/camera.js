import { Tween, Easing, Group } from '@tweenjs/tween.js';
import { resolveView } from '../config.js';

/**
 * Moves the camera between named views.
 *
 * The old code tweened `camera.position` while OrbitControls kept calling
 * `controls.update()` every frame against an unchanged target, so the two
 * fought each other mid-flight and the camera arrived pointing somewhere
 * slightly wrong. Here the orbit target is tweened alongside the position
 * and user input is suspended for the duration of the flight.
 */
export class CameraDirector {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.tweens = new Group();
    this.current = 'home';
  }

  flyTo(view, duration = 1100) {
    const target = resolveView(view);
    this.current = view;

    this.tweens.removeAll();
    this.controls.enabled = false;

    const from = {
      px: this.camera.position.x,
      py: this.camera.position.y,
      pz: this.camera.position.z,
      tx: this.controls.target.x,
      ty: this.controls.target.y,
      tz: this.controls.target.z,
    };

    const to = {
      px: target.position.x,
      py: target.position.y,
      pz: target.position.z,
      tx: target.target.x,
      ty: target.target.y,
      tz: target.target.z,
    };

    new Tween(from, this.tweens)
      .to(to, duration)
      .easing(Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.position.set(from.px, from.py, from.pz);
        this.controls.target.set(from.tx, from.ty, from.tz);
        this.controls.update();
      })
      .onComplete(() => {
        this.controls.enabled = true;
      })
      .start();
  }

  update(time) {
    this.tweens.update(time);
  }
}
