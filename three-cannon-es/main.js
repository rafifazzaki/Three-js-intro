import './style.css'
import * as THREE from 'three';

import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

// 
// // init: three js
// 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera);




// 
// // init: cannon js
// 

const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
})

const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane() //infinite plane
})
groundBody.quaternion.setFromEuler(-Math.PI/2, 0, 0);
physicsWorld.addBody(groundBody);

// debugger
const cannonDebugger = new CannonDebugger(scene, physicsWorld,{})

// 
// // Body: cannon js
// 
const radius = 1;
const sphereBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Sphere(radius)
});
sphereBody.position.set(0, 7, 0);
physicsWorld.addBody(sphereBody);

const boxBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1))
})
boxBody.position.set(1, 10, 0);
physicsWorld.addBody(boxBody);

const shape = CANNON.Trimesh.createTorus(50, 3, 4, 8);
const body = new CANNON.Body({ mass: 20 });
body.addShape(shape);
body.position.set(0, 1, 0)
body.quaternion.setFromEuler(-Math.PI/2, 0, 0)
physicsWorld.addBody(body)

// 
// // Geometry: three js
// 

const sphereGeo = new THREE.SphereGeometry(radius)
const sphereMat = new THREE.MeshBasicMaterial({color:0xE58943}); //0x818589
const sphere = new THREE.Mesh(sphereGeo, sphereMat)
// torus.rotateY(degToRad(45))
scene.add(sphere);

const boxGeo = new THREE.BoxGeometry(2, 2, 2) //double from cannon
const boxMat = new THREE.MeshBasicMaterial()
const box = new THREE.Mesh(boxGeo, boxMat)
scene.add(box)



function animate(){
  physicsWorld.fixedStep();
  cannonDebugger.update()
  requestAnimationFrame(animate)
  // update three js from cannon
  sphere.position.copy(sphereBody.position);
  sphere.quaternion.copy(sphereBody.quaternion)
  box.position.copy(boxBody.position);
  box.quaternion.copy(boxBody.quaternion);

  renderer.render(scene, camera);
}

animate()