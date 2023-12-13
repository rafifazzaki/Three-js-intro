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
// // INIT THREE JS
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
const body = new CANNON.Body({ mass: 20 });
body.addShape(shape);
body.position.set(0, 1, 0)
body.quaternion.setFromEuler(-Math.PI/2, 0, 0)
physicsWorld.addBody(body)

var radius = 1
const sphereBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Sphere(radius)
})
sphereBody.position.set(2, 7, 0)
physicsWorld.addBody(sphereBody)

const sphereBody2 = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Sphere(radius)
})
sphereBody.position.set(0, 7, 2)
physicsWorld.addBody(sphereBody2)

const boxBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1))
})
boxBody.position.set(1, 10, 1)
physicsWorld.addBody(boxBody)

const boxBody2 = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1))
})
boxBody.position.set(1, 10, 1)
physicsWorld.addBody(boxBody2)

var CYLINDER_HEIGHT = 5
const coneBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Cylinder(0.01, 3, CYLINDER_HEIGHT, 4, 1)
})
coneBody.position.set(0, 10, 0)
physicsWorld.addBody(coneBody)

const longBoxBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(2, 0.2, 2))
})
longBoxBody.position.set(0, 4, 0)
physicsWorld.addBody(longBoxBody)

// 
// // THREE JS GEOMETRY
// 

const sphereGeo = new THREE.SphereGeometry(radius)

const sphereMat = new THREE.MeshBasicMaterial({color:0xE58943}); //0x818589
const sphere = new THREE.Mesh(sphereGeo, sphereMat)

const sphereMat2 = new THREE.MeshBasicMaterial({color:0xE58943}); //0x818589
const sphere2 = new THREE.Mesh(sphereGeo, sphereMat2)
scene.add(sphere);
scene.add(sphere2);

const box = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial()
)
scene.add(box)

const box2 = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial()
)
scene.add(box2)

const cone = new THREE.Mesh(
  new THREE.ConeGeometry(3, 5, 4),
  new THREE.MeshBasicMaterial()
)
scene.add(cone)

const longBox = new THREE.Mesh(
  new THREE.BoxGeometry(4, 0.4, 4),
  new THREE.MeshBasicMaterial()
)
scene.add(longBox)


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
// // PAGE CONTENT
// 

var cv_page = document.getElementById('CV_click');
// var porto_page = document.getElementById('Porto_click');
var home_page = document.getElementById('Home_click');
var back_button = document.getElementById('Back_button');
cv_page.onclick = showCV;
// porto_page.onclick = showPortofolio;
home_page.onclick = clearPage;
back_button.onclick = goBackPage;

function goBackPage(){
  document.getElementById("PAGE_CV").setAttribute("style", "display: none");
  document.getElementById("PAGE_Portofolio").setAttribute("style", "display: none");
  document.getElementById("container").setAttribute("style", "position: static;");
  
  var t = new TWEEN.Tween(controls.target).to(
    {
      x: 0,
      y: 0,
      z: 0
    }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start()
    .onComplete(function(){
      controls.enableRotate = true;
    })
}
function clearPage(){
  document.getElementById("PAGE_CV").setAttribute("style", "display: none");
  document.getElementById("PAGE_Portofolio").setAttribute("style", "display: none");
  document.getElementById("container").setAttribute("style", "position: static;");
  
  var t = new TWEEN.Tween(controls.target).to(
    {
      x: 0,
      y: 0,
      z: 0
    }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start()
    .onComplete(function(){
      controls.enableRotate = true;
    })

  new TWEEN.Tween(camera.position).to(new THREE.Vector3(20, 15, 20), 1000)
  .easing(TWEEN.Easing.Cubic.Out)
  .start()
  .onStart(function(){
    controls.enableRotate = false;
  })
}
function showPortofolio () {
  document.getElementById("PAGE_CV").setAttribute("style", "display: none");
  document.getElementById("PAGE_Portofolio").setAttribute("style", "display: block");
  document.getElementById("container").setAttribute("style", "position: relative;");
}
function showCV(){
  document.getElementById("PAGE_CV").setAttribute("style", "display: block");
  document.getElementById("PAGE_Portofolio").setAttribute("style", "display: none");
  document.getElementById("container").setAttribute("style", "position: relative;");
  controls.enableRotate = false;


  new TWEEN.Tween(controls.target).to({
    x: camera.position.x - 1 * checkQuadrant(camera.position).x,
    y: camera.position.y - 5,
    z: camera.position.z - 1 * checkQuadrant(camera.position).y
  }, 1000)
  .easing(TWEEN.Easing.Cubic.Out)
  .start()

  // new TWEEN.Tween(camera.position).to({
  //   x: camera.position.x + 10 * checkQuadrant(camera.position).x,
  //   y: camera.position.y,
  //   z: camera.position.z + 10 * checkQuadrant(camera.position).y
  // }, 1000)
  // .easing(TWEEN.Easing.Cubic.Out)
  // .start()
  
}
function checkQuadrant(objectPosition){
  let number;
  if(objectPosition.x > 0 && objectPosition.z > 0){
    // kuadran 1
    number = new THREE.Vector2(1, 1);
  }else if(objectPosition.x < 0 && objectPosition.z > 0){
    // kuadran 2
    number = new THREE.Vector2(-1, 1);
  }else if(objectPosition.x < 0 && objectPosition.z < 0){
    // kuadran 3
    number = new THREE.Vector2(-1, -1);
  }else if(objectPosition.x > 0 && objectPosition.z < 0){
    // kuadran 4
    number = new THREE.Vector2(1, -1);
  }
  return number
}






// 
// SCENE INTERACTION
// 

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);




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


document.addEventListener('DOMContentLoaded', function () {
  const circles = document.querySelectorAll('.circle');

  function fillCircles() {
    circles.forEach((circle, index) => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const fillPercentage = Math.min(scrollPercentage - index * 30, 100); // Adjust the value to control the fill rate

      // circle.style.backgroundColor = `hsl(200, 100%, ${fillPercentage}%)`;
      circle.style.backgroundColor = `rgba(255, 255, 255, ${fillPercentage / 20})`;
    });
  }

  // Update circles on scroll
  window.addEventListener('scroll', fillCircles);

  // Initial fill on page load
  fillCircles();
});