import './style.css'
import './scroll.css'
import './mouse-icon.css'


import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { degToRad } from 'three/src/math/MathUtils';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import TWEEN, { Tween } from '@tweenjs/tween.js'


// 
// // INIT THREE JS & SETTING
// 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(20, 15, 20);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera);

const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.enableZoom = false;
controls.enableDamping = true
controls.minPolarAngle = Math.PI/8; // radians
controls.maxPolarAngle = Math.PI/2; 
scene.add(controls)


function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// 
// // INIT CANNON JS
// 

const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
})

const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane()
})

groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
groundBody.position.set(0, -1.5, 0)
physicsWorld.addBody(groundBody)

const cannonDebugger = new CannonDebugger(scene, physicsWorld)

// 
// // CANNON JS BODY
// 
const shape = CANNON.Trimesh.createTorus(50, 3, 4, 8);
const body = new CANNON.Body({ mass: 1000 });
body.addShape(shape);
body.position.set(0, 1.5, 0)
body.quaternion.setFromEuler(-Math.PI/2, 0, 0)
physicsWorld.addBody(body)

var radius = 1
const sphereBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Sphere(radius)
})
sphereBody.position.set(2, 7, 0)
// physicsWorld.addBody(sphereBody)

const sphereBody2 = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Sphere(radius)
})
sphereBody.position.set(0, 7, 2)
// physicsWorld.addBody(sphereBody2)

const boxBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1))
})
boxBody.position.set(1, 10, 1)
// physicsWorld.addBody(boxBody)

const boxBody2 = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1))
})
boxBody.position.set(1, 10, 1)
// physicsWorld.addBody(boxBody2)

var CYLINDER_HEIGHT = 5
const coneBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Cylinder(0.01, 3, CYLINDER_HEIGHT, 4, 1)
})
coneBody.position.set(0, 13, 0)
// physicsWorld.addBody(coneBody)

const longBoxBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(2, 0.2, 2))
})
longBoxBody.position.set(0, 13, 0)
// physicsWorld.addBody(longBoxBody)

// 
// // THREE JS GEOMETRY
// 

// FLAG_three object
const sphereGeo = new THREE.SphereGeometry(radius)

const sphereMat = new THREE.MeshBasicMaterial({color:0xE58943}); //0x818589
const sphere = new THREE.Mesh(sphereGeo, sphereMat)

const sphereMat2 = new THREE.MeshBasicMaterial({color:0xE58943}); //0x818589
const sphere2 = new THREE.Mesh(sphereGeo, sphereMat2)
// scene.add(sphere);
// scene.add(sphere2);

const box = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial()
)
// scene.add(box)

const box2 = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial()
)
// scene.add(box2)

const cone = new THREE.Mesh(
  new THREE.ConeGeometry(3, 5, 4),
  new THREE.MeshBasicMaterial()
)
// scene.add(cone)

const longBox = new THREE.Mesh(
  new THREE.BoxGeometry(4, 0.4, 4),
  new THREE.MeshBasicMaterial()
)
// scene.add(longBox)


// const light = new THREE.AmbientLight(0xffffff, 10)
const light = new THREE.PointLight(0xffffff, 20)
const lightHelper = new THREE.PointLightHelper(light)
light.position.setY(5)
scene.add(light, lightHelper)


const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial()
)
plane.position.setY(-1.5)
plane.rotateX(degToRad(-90))
scene.add(plane)

// const loader = new GLTFLoader();

// loader.load(
//   'base.glb',
//   function(gltf){
//     const base = gltf.scene
//     // var newMaterial = new THREE.MeshBasicMaterial({color: 0xE58943, wireframe: false})
//     // base.traverse((o) => {
//     //   if(o.isMesh) o.material = newMaterial;
//     // })
//     base.scale.set(7, 7, 7);
//     base.position.setY(-1.5)
//     scene.add(base);
//   }
// )



// 
// SCENE INTERACTION
// 






function animate(){
  physicsWorld.fixedStep()
  cannonDebugger.update()
  requestAnimationFrame(animate)


  sphere.position.copy(sphereBody.position)
  sphere.quaternion.copy(sphereBody.quaternion)

  sphere2.position.copy(sphereBody2.position)
  sphere2.quaternion.copy(sphereBody2.quaternion)


  box.position.copy(boxBody.position)
  box.quaternion.copy(boxBody.quaternion)

  box2.position.copy(boxBody2.position)
  box2.quaternion.copy(boxBody2.quaternion)


  cone.position.copy(coneBody.position)
  cone.quaternion.copy(coneBody.quaternion)

  longBox.position.copy(longBoxBody.position)
  longBox.quaternion.copy(longBoxBody.quaternion)



// three
  controls.update();
  TWEEN.update()
  renderer.render(scene, camera);
}

animate();


// 
// scroll listener
// 

document.addEventListener('DOMContentLoaded', function () {
  const circles = document.querySelectorAll('.circle');

  function fillCircles() {
    circles.forEach((circle, index) => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const fillPercentage = Math.min(scrollPercentage - index * 30, 100); // Adjust the value to control the fill rate

      // circle.style.backgroundColor = `hsl(200, 100%, ${fillPercentage}%)`;
      circle.style.backgroundColor = `rgba(255, 255, 255, ${fillPercentage / 20})`;

      let switcher1, switcher2, switcher3, switcher4, switcher5, switcher6
      switcher1 = switcher2 = switcher3 = switcher4 = switcher5 = switcher6 = false;

      switcher1 = true;
      if (scrollPercentage >= 15 && scrollPercentage < 30) {
        physicsWorld.addBody(sphereBody)
        scene.add(sphere);
        // console.log("1");
        // stopper1 = true
        // switcher1 = true;
      }else{
        physicsWorld.removeBody(sphereBody)
        scene.remove(sphere)
      }
       if(scrollPercentage >= 30){
        physicsWorld.addBody(sphereBody2)
        scene.add(sphere2);
      } else {
        physicsWorld.removeBody(sphereBody2)
        scene.remove(sphere2)
      }

      if(scrollPercentage >= 45){
        physicsWorld.addBody(boxBody)
        scene.add(box)
      } 
      else{
        physicsWorld.removeBody(boxBody)
        scene.remove(box)
      }
      if(scrollPercentage >= 60){
        physicsWorld.addBody(boxBody2)
        scene.add(box2)
      } 
      else if(switcher1 = true){
        physicsWorld.removeBody(boxBody2)
        scene.remove(box2)
      }
      if(scrollPercentage >= 75){
        physicsWorld.addBody(coneBody)
        scene.add(cone)
      }else{
        physicsWorld.removeBody(coneBody)
        scene.remove(cone)
      }

      if(scrollPercentage >= 90){
        physicsWorld.addBody(longBoxBody)
        scene.add(longBox)
      }else{
        physicsWorld.removeBody(longBoxBody)
        scene.remove(longBox)
        // switcher1 = false
      }

      console.clear();
      scene.traverse( function( object ) {
        
        if(object instanceof THREE.Mesh){
          console.log(object)
      }
      
      } );

    });
  }

  // Update circles on scroll
  window.addEventListener('scroll', fillCircles);

  // Initial fill on page load
  fillCircles();
});
