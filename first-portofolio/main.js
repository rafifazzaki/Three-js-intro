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
sphereBody.position.set(2, 2, 0) //y=7

const sphereBody2 = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Sphere(radius)
})
sphereBody2.position.set(0, 7, 2)

const boxBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(3.7, .5, 1.5))
})
boxBody.position.set(1, 10, 1)

const boxBody2 = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(4.9, .5, 2))
})
boxBody2.position.set(1, 10, 1)

var CYLINDER_HEIGHT = 10
const coneBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Cylinder(0.01, 6, CYLINDER_HEIGHT, 4, 1) // new CANNON.Cylinder(0.01, 3, CYLINDER_HEIGHT, 4, 1)
})
coneBody.position.set(0, 13, 0)



// coneBody.scale.x = 0.005

const longBoxBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(2, 0.2, 2))
})
longBoxBody.position.set(0, 13, 0)

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


// const lightAmbient = new THREE.AmbientLight(0xffffff, 10)
// scene.add(lightAmbient)
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

const loader = new GLTFLoader();
let keypad
loader.load(
  './obj/keypad.glb',
  function(gltf){
    keypad = gltf.scene
    // var newMaterial = new THREE.MeshBasicMaterial({color: 0xE58943, wireframe: false})
    // model.traverse((o) => {
    //   if(o.isMesh) o.material = newMaterial;
    // })
    keypad.scale.set(.03, .03, .03);
    keypad.position.setY(-1.5)


    keypad.name = 'keypad'
    scene.add(keypad);

    keypad.traverse((child) => {
      if (child.isMesh) child.name = 'keypad'; // a material i created in the code earlier
    });
    keypad.name = 'keypad'
    keypad.name = 'keypad'

    keypad.visible = false
  }
)
var omni, omniGroup
loader.load(
  './obj/omnidirectional.glb',
  function(gltf){
    omni = gltf.scene
    // var newMaterial = new THREE.MeshBasicMaterial({color: 0xE58943, wireframe: false})
    // model.traverse((o) => {
    //   if(o.isMesh) o.material = newMaterial;
    // })
    omni.scale.set(.1, .1, .1);
    omni.position.set(-.5, -2.7, .5)
    omni.rotation.set(0, 0, 0)

    
    // scene.add(omni);

    omniGroup = new THREE.Group();
    omniGroup.add(omni)
    scene.add(omniGroup);
    omni.traverse((child) => {
      if (child.isMesh) child.name = 'omni'; // a material i created in the code earlier
    });
    omni.name = 'omni'
    omniGroup.name = 'omni'
    omniGroup.visible = false

  }
)
var controller, controllerGroup
loader.load(
  './obj/game_controller2.glb',
  function(gltf){
    controller = gltf.scene
    // var newMaterial = new THREE.MeshBasicMaterial({color: 0xE58943, wireframe: false})
    // model.traverse((o) => {
    //   if(o.isMesh) o.material = newMaterial;
    // })
    controller.scale.set(1, 1, 1);
    controller.position.set(-2.5, -1.5, 1.5)
    controller.name = 'controller'
    // scene.add(controller);

    controllerGroup = new THREE.Group();
    controllerGroup.add(controller)
    scene.add(controllerGroup);

    controller.traverse((child) => {
      if (child.isMesh) child.name = 'controller'; // a material i created in the code earlier
    });
    controller.name = 'controller'
    controllerGroup.name = 'controller'

    controllerGroup.visible = false
  }
)
var keyboardGroup, keyboard
loader.load(
  './obj/mech_keyboard.glb',
  function(gltf){
    keyboard = gltf.scene
    // var newMaterial = new THREE.MeshBasicMaterial({color: 0xE58943, wireframe: false})
    // model.traverse((o) => {
    //   if(o.isMesh) o.material = newMaterial;
    // })
    keyboard.scale.set(.01, .01, .01);
    // keyboard.position.setY(-2)
    keyboard.position.set(-3.2, -1.5, 0)
    keyboard.name = 'keyboard'

    keyboardGroup = new THREE.Group();
    keyboardGroup.add(keyboard)
    scene.add(keyboardGroup);

    keyboard.traverse((child) => {
      if (child.isMesh) child.name = 'keyboard'; // a material i created in the code earlier
    });
    keyboard.name = 'keyboard'
    keyboardGroup.name = 'keyboard'

    keyboardGroup.visible = false
  }
)
var marble1, marble1Group
loader.load(
  './obj/marble_test.glb',
  function(gltf){
    marble1 = gltf.scene
    // var newMaterial = new THREE.MeshBasicMaterial({color: 0xE58943, wireframe: false})
    // model.traverse((o) => {
    //   if(o.isMesh) o.material = newMaterial;
    // })
    marble1.scale.set(1, 1, 1);
    marble1.position.set(-3.7, -1, 0)
    marble1.name = 'marble1'
    // scene.add(marble1);

    marble1Group = new THREE.Group();
    marble1Group.add(marble1)
    scene.add(marble1Group);

    marble1.traverse((child) => {
      if (child.isMesh) child.name = 'marble1'; // a material i created in the code earlier
    });
    marble1.name = 'marble1'
    marble1Group.name = 'marble1'

    marble1Group.visible = false;
  }
)



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
      case "sphere2": //box
        var title = 'Zettacamp’s Assignment API'
        var text  = 'Making REST APIs using Express.js and MongoDB and. and testing using Cypress, and Postman. In addition, learn other materials such as training logic and GIT. Learning starts from basic HTML, CSS, and javascript'
        var github = 'https://www.google.com/'
        var external = 'https://www.google.com/'

        changeContent(title, text, github, external)

        break;
      case "marble1": //box2

        var title = 'Dicoding’s API & EC2 Deploy Assignments'
        var text  = 'Build a fully working API with Node.js and HAPI.js. and deploying note-taking app’s backend to the Amazon EC2 Instance'
        var github = 'https://www.google.com/'
        var external = 'https://www.google.com/'

        changeContent(title, text, github, external)
        break;
      case "keyboard": //sphere

        var title = 'Prototype \"Finitra\" (Capslock team)'
        var text  = 'Prototype game \"Finitra\" is a game that was proposed at Game Development Competition Find IT 2018 organized by KMTETI Universitas Gadjah Mada.'
        var github = 'https://www.google.com/'
        var external = 'https://www.google.com/'

        changeContent(title, text, github, external)
        break;
      case "controller": //sphere2

        var title = 'COMPFEST 12 2020 - Postman (Large Iced Tea)'
        var text  = 'Compfest 12 Indie Game Ignite which was organized by Mahasiswa Fakultas Ilmu Komputer Universitas Indonesia. with Large Iced Tea team, we produce a game \"Postman\"'
        var github = 'https://www.google.com/'
        var external = 'https://www.google.com/'
        changeContent(title, text, github, external)
        break;
      case "omni": //cone
        var title = 'Robot Soccer Prototype'
        var text  = 'Member of a team to build Robot Soccer Prototype made according to KRSBI 2018'
        var github = 'https://www.google.com/'
        var external = 'https://www.google.com/'
        changeContent(title, text, github, external)
        break;
      case "keypad": //longbox
        var title = 'Personal project: keypad 4v4'
        var text  = 'aking a keypad 4x4 with encoder, personal project'
        var github = 'https://www.google.com/'
        var external = 'https://www.google.com/'
        changeContent(title, text, github, external)
        break;
      
      default:
        // code block
    }
  }

  function changeContent(title, text, github, external) {

        var id = "project-title"
        var place = document.getElementById(`${id}`);
        place.innerText = `${title}`;


        id = "project-desc"
        place = document.getElementById(`${id}`);
        place.textContent = `${text}`;

        id = "link-github"
        place = document.getElementById(`${id}`);
        place.href = `${github}`;

        id = "link-external"
        place = document.getElementById(`${id}`);
        place.href = `${external}`;
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
        case "sphere2":
          GLOW();
          break;
        case "marble1":
          GLOW();
          break;
        case "keyboard":
          GLOW();
          break;
        case "controller":
          GLOW();
          break;
        case "omni":
          GLOW();
          break;
        case "keypad":
          GLOW();
          break;
        
        default:
          // code block
      }
      
      // INTERSECTED.material.color.setHex( 0xff0000 );
      

    }

  } else {

    // if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

    if ( INTERSECTED ){
      INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
    } 

    INTERSECTED = null;

  }
  function GLOW(){
    // INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
    
    // INTERSECTED.material.color.setHex( 0xff0000 );
    INTERSECTED.traverse((o) => {
      if(o.isMesh) o.material.color.setHex( 0xff0000 )
    })
  }
}



// 
// // instantiate object
// 

function instantiateBodyObject(){
  // scene.add(sphere);
  scene.add(sphere2);
  // scene.add(box)
  // scene.add(box2)
  // scene.add(cone)
  // scene.add(longBox)
  // coneBody.scale.x = 0.005

  physicsWorld.addBody(sphereBody)
  physicsWorld.addBody(sphereBody2)
  physicsWorld.addBody(boxBody)  
  physicsWorld.addBody(boxBody2)
  physicsWorld.addBody(coneBody)
  
  physicsWorld.addBody(longBoxBody)
  
  }
instantiateBodyObject()


//
// // Scroll listener
//

document.addEventListener('DOMContentLoaded', function () {
  const circles = document.querySelectorAll('.circle');

  function fillCircles() {
    circles.forEach((circle, index) => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const fillPercentage = Math.min(scrollPercentage - index * 30, 100); // Adjust the value to control the fill rate

      // circle.style.backgroundColor = `hsl(200, 100%, ${fillPercentage}%)`;
      circle.style.backgroundColor = `rgba(255, 255, 255, ${fillPercentage / 20})`;

      if (scrollPercentage >= 15) {
        marble1Group.visible = true;
        
      }else{
        sphereBody.position.set(2, 7, 0)
        marble1Group.visible = false;
      }

      if(scrollPercentage >= 30){
        sphere2.visible = true;
        
      } else {
        sphereBody2.position.set(0, 7, 2)
        sphere2.visible = false;
      }

      if(scrollPercentage >= 45){
        controllerGroup.visible = true
      } 
      else{
        boxBody.position.set(1, 10, 1)
        controllerGroup.visible = false
      }

      if(scrollPercentage >= 60){
        keyboardGroup.visible = true
      } 
      else{
        boxBody2.position.set(1, 10, 1)
        keyboardGroup.visible = false
      }

      if(scrollPercentage >= 75){
        omniGroup.visible = true
      }else{
        coneBody.position.set(0, 13, 0)
        omniGroup.visible = false
      }

      if(scrollPercentage >= 90){
        keypad.visible = true
      }else{
        longBoxBody.position.set(0, 15, 0)
        keypad.visible = false
      }



      // CheckAllObjectOnScene();
      // function CheckAllObjectOnScene(){
      // console.clear();
      // scene.traverse( function( object ) {
        
      //   if(object instanceof THREE.Mesh){
      //     console.log(object)
      // }});
      // }

    });
  }

  // Update circles on scroll
  window.addEventListener('scroll', fillCircles);

  // Initial fill on page load
  fillCircles();
});


// 
// // Three js update
// 

function animate(){
  physicsWorld.fixedStep()
  // cannonDebugger.update()
  requestAnimationFrame(animate)


  marble1Group.position.copy(sphereBody.position)
  marble1Group.quaternion.copy(sphereBody.quaternion)

  sphere2.position.copy(sphereBody2.position)
  sphere2.quaternion.copy(sphereBody2.quaternion)


  controllerGroup.position.copy(boxBody.position)
  controllerGroup.quaternion.copy(boxBody.quaternion)

  keyboardGroup.position.copy(boxBody2.position)
  keyboardGroup.quaternion.copy(boxBody2.quaternion)


  // omni.position.copy(coneBody.position)
  omniGroup.position.set(coneBody.position.x, coneBody.position.y, coneBody.position.z) // x, y-.5, z+7
  omniGroup.quaternion.copy(coneBody.quaternion)

  keypad.position.copy(longBoxBody.position)
  keypad.quaternion.copy(longBoxBody.quaternion)



// three
  controls.update();
  TWEEN.update()
  renderer.render(scene, camera);
}
animate();
