import './style.css'
import './scroll.css'
import './mouse-icon.css'

// import './page.js'
import './content.js'

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { DragControls } from 'three/addons/controls/DragControls.js';

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
sphereBody2.position.set(0, 7, 2)
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
boxBody2.position.set(1, 10, 1)
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

const sphereGeo = new THREE.SphereGeometry(radius)

const sphereMat = new THREE.MeshBasicMaterial({color:0xE58943}); //0x818589
const sphere = new THREE.Mesh(sphereGeo, sphereMat)

const sphereMat2 = new THREE.MeshBasicMaterial({color:0xE58943}); //0x818589
const sphere2 = new THREE.Mesh(sphereGeo, sphereMat2)
sphere.name = 'sphere';
sphere2.name = 'sphere2';

const box = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial()
)
box.name = 'box'

const box2 = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial()
)
box2.name = 'box2'

const cone = new THREE.Mesh(
  new THREE.ConeGeometry(3, 5, 4),
  new THREE.MeshBasicMaterial()
)
cone.name = 'cone';

const longBox = new THREE.Mesh(
  new THREE.BoxGeometry(4, 0.4, 4),
  new THREE.MeshBasicMaterial()
)
longBox.name = 'longBox';


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



let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let INTERSECTED;
renderer.domElement.addEventListener('mousemove', onPointerMove, false) //pointermove

renderer.domElement.addEventListener('click', onPointerClick, false)

function onPointerClick( event ) {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(scene, true);
  if(intersects.length > 0){
    console.log(intersects[ 0 ].object); //
    switch(intersects[ 0 ].object.name) {
      case "box":
        CONTENT_button1("box");
        break;
      case "box2":
        CONTENT_button1("box2");
        break;
      case "sphere":
        CONTENT_button1("sphere");
        break;
      case "sphere2":
        CONTENT_button1("sphere2");
        break;
      case "cone":
        CONTENT_button1("cone");
        break;
      case "longbox":
        CONTENT_button1("longbox");
        break;
      
      default:
        // code block
    }
  }

  function CONTENT_button1(string){
    console.log(string);
    
  }
}

function onPointerMove(event){
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(scene, true);
  if ( intersects.length > 0 ) {
    
    if ( INTERSECTED != intersects[ 0 ].object ) {
      // console.log(INTERSECTED);
      if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
      switch(INTERSECTED.name) {
        case "box":
          GLOW();
          break;
        case "box2":
          GLOW();
          break;
        case "sphere":
          GLOW();
          break;
        case "sphere2":
          GLOW();
          break;
        case "cone":
          GLOW();
          break;
        case "longBox":
          GLOW();
          break;
        
        default:
          // code block
      }
      
      // INTERSECTED.material.color.setHex( 0xff0000 );

    }

  } else {

    if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

    INTERSECTED = null;

  }
  function GLOW(){
    // INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
    
    INTERSECTED.material.color.setHex( 0xff0000 );
  }
}


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

function instantiateObject(){
  physicsWorld.addBody(sphereBody)
  scene.add(sphere);
  sphere.visible = false;
  
  physicsWorld.addBody(sphereBody2)
  scene.add(sphere2);
  sphere2.visible = false;
  
  physicsWorld.addBody(boxBody)
  scene.add(box)
  box.visible = false;
  
  physicsWorld.addBody(boxBody2)
  scene.add(box2)
  box2.visible = false;
  
  physicsWorld.addBody(coneBody)
  scene.add(cone)
  cone.visible = false;
  
  physicsWorld.addBody(longBoxBody)
  scene.add(longBox)
  }
  
instantiateObject()

document.addEventListener('DOMContentLoaded', function () {
  const circles = document.querySelectorAll('.circle');

  function fillCircles() {
    circles.forEach((circle, index) => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const fillPercentage = Math.min(scrollPercentage - index * 30, 100); // Adjust the value to control the fill rate

      // circle.style.backgroundColor = `hsl(200, 100%, ${fillPercentage}%)`;
      circle.style.backgroundColor = `rgba(255, 255, 255, ${fillPercentage / 20})`;

      if (scrollPercentage >= 15) {
        sphere.visible = true;
        
      }else{
        sphereBody.position.set(2, 7, 0)
        sphere.visible = false;
      }

      if(scrollPercentage >= 30){
        sphere2.visible = true;
        
      } else {
        sphereBody2.position.set(0, 7, 2)
        sphere2.visible = false;
      }

      if(scrollPercentage >= 45){
        box.visible = true;
      } 
      else{
        boxBody.position.set(1, 10, 1)
        box.visible = false;
      }

      if(scrollPercentage >= 60){
        box2.visible = true;
      } 
      else{
        boxBody2.position.set(1, 10, 1)
        box2.visible = false;
      }

      if(scrollPercentage >= 75){
        cone.visible = true;
      }else{
        coneBody.position.set(0, 13, 0)
        cone.visible = false;
      }

      if(scrollPercentage >= 90){
        longBox.visible = true;
      }else{
        longBoxBody.position.set(0, 15, 0)
        longBox.visible = false;
      }



      // CheckAllObjectOnScene();
      function CheckAllObjectOnScene(){
      console.clear();
      scene.traverse( function( object ) {
        
        if(object instanceof THREE.Mesh){
          console.log(object)
      }});
      }

    });
  }

  // Update circles on scroll
  window.addEventListener('scroll', fillCircles);

  // Initial fill on page load
  fillCircles();
});
