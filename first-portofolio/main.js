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


// #region INIT THREE JS & WINDOWS SETTING

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

  CheckWindowsSize()
  
}
window.addEventListener('resize', onWindowResize);

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

var isMobile = false

// async function loadModel(){
//   await modelLinedUp()
// }

function CheckWindowsSize(){
  console.log('in check window size');
  // console.log(window.innerWidth);
  if(window.innerWidth < 682){
    console.log(window.innerWidth);
    document.getElementById("Home_click").innerHTML = "M Rafif Azzaki";
    document.getElementById("project-desc").setAttribute("style", "font-size: 1rem;");0
    isMobile = true
    hideMainScroll()
    // loadModel()
    
    
    
    // document.getElementsByClassName("cv_content").setAttribute("style", "font-size: 0.5rem;");
  } else{
    document.getElementById("Home_click").innerHTML = "Muhammad Rafif Azzaki";
    document.getElementById("project-desc").setAttribute("style", "font-size: 1.5rem;");
    showMainScroll()
    
  }

  if(window.innerWidth < 480){
    
    console.log(window.innerWidth);
    document.getElementById("Home_click").innerHTML = "Rafif Azzaki";
  }

  if(window.innerWidth < 430){
    // 320 from https://stackoverflow.com/questions/27971231/guidelines-for-resizing-and-adjusting-for-mobile-devices-using-javascript
    console.log(window.innerWidth);
    document.getElementById("Home_click").innerHTML = "MRA";
  }

  if(window.innerHeight < 650){
    isMobile = true
  }

}

CheckWindowsSize()
// #endregion

// #region INIT CANNON JS

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

// #endregion

// #region CANNON JS BODY
const shape = CANNON.Trimesh.createTorus(50, 3, 4, 8);
// const shape = new CANNON.Cylinder(10, 10, 10, 10)
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

// #endregion

// #region THREE JS GEOMETRY

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


var manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

    console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};

manager.onLoad = function ( ) {

  console.log( 'Loading complete!');
  
  if(window.innerWidth < 682){
    modelLinedUp()
  }

  

};


manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

  console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};

manager.onError = function ( url ) {

  console.log( 'There was an error loading ' + url );

};


// const lightAmbient = new THREE.AmbientLight(0xffffff, 10)
// scene.add(lightAmbient)
const light = new THREE.PointLight(0xffffff, 100) //10
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


const loader = new GLTFLoader( manager );
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

    // marble1Group.visible = false;
  }
)

var contactLinkedin, contactLinkedinGroup
loader.load(
  './obj/contact-linkedin.glb',
  function(gltf){
    contactLinkedin = gltf.scene
    contactLinkedin.scale.set(0.15, 0.15, 0.15);
    contactLinkedin.rotateX(degToRad(90))
    contactLinkedin.position.set(0, 40, 5)

    scene.add(contactLinkedin);
    contactLinkedin.traverse((child) => {
      if (child.isMesh) child.name = 'contactLinkedin'; // a material i created in the code earlier
    });
    contactLinkedin.name = 'contactLinkedin'

  }
)

function contactLightConf(){
  const light1 = new THREE.PointLight(0xffffff, 100)
  const lightHelper1 = new THREE.PointLightHelper(light1)
  const light2 = new THREE.PointLight(0xffffff, 100)
  const lightHelper2 = new THREE.PointLightHelper(light2)
  const light3 = new THREE.PointLight(0xffffff, 100) 
  const lightHelper3 = new THREE.PointLightHelper(light3)
  light1.position.set(-15, 26, 15)
  light2.position.set(10, 29, 12)
  light3.position.set(0, 27, 0)
  
  contactLinkedinGroup = new THREE.Group();
  contactLinkedinGroup.add(contactLinkedin)
  contactLinkedinGroup.add(light1, light2, light3)
  contactLinkedinGroup.add(lightHelper1, lightHelper2, lightHelper3)
  scene.add(contactLinkedinGroup);
  
  contactLinkedinGroup.position.setY(6)
}
contactLightConf()


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

// #endregion

// #region SCROLL LISTENER

document.addEventListener('DOMContentLoaded', function () {

  
  const circles = document.querySelectorAll('.circle');

  function fillCircles() {
    circles.forEach((circle, index) => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const fillPercentage = Math.min(scrollPercentage - index * 18, 100); // Adjust the value to control the fill rate, default 30 and fairly good for 6 obj is 10 

      // circle.style.backgroundColor = `hsl(200, 100%, ${fillPercentage}%)`;
      circle.style.backgroundColor = `rgba(255, 255, 255, ${fillPercentage})`; //original: `rgba(255, 255, 255, ${fillPercentage / 20})`

      // initially multiple of 15
      if (scrollPercentage >= 3) {
        marble1Group.visible = true;
        
        
      }else{
        sphereBody.position.set(2, 7, 0)
        marble1Group.visible = false;
      }

      if(scrollPercentage >= 20){
        sphere2.visible = true;
        
      } else {
        sphereBody2.position.set(0, 7, 2)
        sphere2.visible = false;
      }

      if(scrollPercentage >= 37){
        controllerGroup.visible = true
      } 
      else{
        boxBody.position.set(1, 10, 1)
        controllerGroup.visible = false
      }

      if(scrollPercentage >= 55){
        keyboardGroup.visible = true
      } 
      else{
        boxBody2.position.set(1, 10, 1)
        keyboardGroup.visible = false
      }

      if(scrollPercentage >= 73){
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

// #endregion


// #region HTML CHANGE PAGE - CAMERA

function cameraToCenter(){
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
function cameraToCVAngle(){
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
function cameraToContact(){
  controls.enableRotate = false;
  var t = new TWEEN.Tween(controls.target).to(
    {
      x: 0,
      y: 40,
      z: 0
    }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start()
    .onComplete(function(){
      controls.enableRotate = true;
    })

  // new TWEEN.Tween(camera.position).to(new THREE.Vector3(20, 15, 20), 1000)
  // .easing(TWEEN.Easing.Cubic.Out)
  // .start()
  // .onStart(function(){
  //   controls.enableRotate = false;
  // })
}

// #endregion

// #region HTML change PAGE - CONTENT

var cv_page = document.getElementById('CV_click');
var home_page = document.getElementById('Home_click');
var contact_page = document.getElementById('Contact_click');
cv_page.onclick = showCV;
home_page.onclick = clearPage;
contact_page.onclick = contactPage;

// var porto_page = document.getElementById('Porto_click');
// porto_page.onclick = showPortofolio;

const PAGE_CV = document.getElementById("PAGE_CV")
const PAGE_Portofolio = document.getElementById("PAGE_Portofolio")

const footer = document.getElementById("footer-project")
const footerDesc = document.getElementById("footer-desc")
var Toggle_CV = true
var Toggle_Contact = true
var Toggle_showfooter = false


function clearPage(){
  hideElement(PAGE_CV)
  hideElement(PAGE_Portofolio)
  if(Toggle_showfooter){
    hideElement(footer)
    Toggle_showfooter = false
  } else{
    showElement(footer)
    Toggle_showfooter = true
  }

  cameraToCenter()
}
function showCV(){
  
  if(Toggle_CV === true){
    Toggle_CV = false
    showElement(PAGE_CV)
    hideElement(PAGE_Portofolio)
    hideElement(footer)

    hideMainScroll()
    // document.getElementById('container').setAttribute("style", "display: block");
    document.getElementById('container').setAttribute("style", "display: block; overflow-y: scroll;");
    cameraToCVAngle()
  }else{
    Toggle_CV = true
    hideElement(PAGE_CV)
    hideElement(PAGE_Portofolio)
    console.log('owe');

    
    showMainScroll()
    document.getElementById('container').setAttribute("style", "display: none; overflow-y: none;");
    showElement(footer)
    cameraToCenter()
  }
}

function contactPage(){
  if(Toggle_Contact === true){
    Toggle_Contact = false
  
    hideElement(PAGE_CV)
    hideElement(PAGE_Portofolio)
    hideElement(footer)
    hideMainScroll();

    cameraToContact()
  }else {
    Toggle_Contact = true
    hideElement(PAGE_CV)
    hideElement(PAGE_Portofolio)
    showElement(footer)
    cameraToCenter()

    if(isMobile === false) showMainScroll()
  }
}

function hideMainScroll(){
  
  document.body.style.overflowY = 'hidden'
  document.getElementById("circle-container").setAttribute("style", "display: none;");
}

function showMainScroll(){
  if(isMobile){
    return
  }
  document.body.style.overflowY = 'scroll'
  // document.body.scrollTop = 15;
  document.getElementById("circle-container").setAttribute("style", "display: flex;");
}



// fadeIn
function showElement(element){
  // document.getElementById("container").setAttribute("style", "position: block;");
  
  console.log('ba');

  element.setAttribute("style", "display: block");//overflow-y: scroll;
  if(element != footer){
    
    // document.getElementById('container').setAttribute("style", "display: block");
    
    
  }
  element.classList.remove("fadeOut");
  element.classList.add("fadeIn");
}
// fadeOut
function hideElement(element){
  
  // // document.getElementById('container').setAttribute("style", "display: block");
  

  element.setAttribute("style", "display: none");//overflow-y: scroll;
  element.classList.add("fadeOut");
  
  
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
// #endregion


// #region SCENE INTERACTION CLICK & HOVER

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
        var text  = 'Making REST APIs using Express.js, MongoDB and Postman.'
        var github = 'https://github.com/zettacamp-rafif-azzaki/rafif_zettacamp_Dolphin'
        var external = null

        changeContent(title, text, github, external)

        break;
      case "marble1": //box2

        var title = 'Dicoding’s API & Amazon Deployment'
        var text  = 'Build a notes app API using HAPI.js and deploying it to the Amazon EC2 Instance and Amazon RDS'
        var github = 'https://github.com/rafifazzaki/Dicoding_Belajar-Membuat-Aplikasi-Back-End-untuk-Pemula/tree/main/notes-app-back-end'
        var external = null

        changeContent(title, text, github, external)
        break;
      case "keyboard": //sphere

        var title = 'Prototype \"Finitra\" (Capslock team)'
        var text  = 'Prototype game \"Finitra\" is a game that was proposed at Game Development Competition Find IT UGM 2018.'
        var github = null
        var external = 'https://www.youtube.com/watch?v=g1DHGZtHzd8'

        changeContent(title, text, github, external)
        break;
      case "controller": //sphere2

        var title = 'COMPFEST 12 2020 - Postman (Large Iced Tea)'
        var text  = 'Compfest 12 Indie Game Ignite which was organized by Fasilkom UI. with Large Iced Tea team, we produce a game \"Postman\"'
        var github = null
        var external = 'https://www.youtube.com/watch?v=9Vi7TXo9r3M'
        changeContent(title, text, github, external)
        break;
      case "omni": //cone
        var title = 'Robot Soccer Prototype'
        var text  = 'Member of a team to build Robot Soccer Prototype made according to KRSBI 2018'
        var github = null
        var external = 'https://drive.google.com/file/d/1lEu4V6Dt39EpsLrn5UX8eultKxCm31j3/view?usp=drive_link'
        changeContent(title, text, github, external)
        break;
      case "keypad": //longbox
        var title = 'Personal project: keypad 4v4'
        var text  = 'Making a keypad 4x4 with encoder, personal project'
        var github = null
        var external = 'https://drive.google.com/file/d/1eAUP3V0yw0hRetyCTDQBkuzKrx_q5W8F/view?usp=drive_link'
        changeContent(title, text, github, external)
        break;
      case "contactLinkedin":
        // window.location.href = "https://www.linkedin.com/in/rafifazzaki/";
        window.open('https://www.linkedin.com/in/rafifazzaki/', '_blank');
        break;
      
      default:
        // code block
    }
  }

  function changeContent(title, text, github, external) {

        // // HTML change PAGE - CONTENT // //
        showElement(footer)
        Toggle_showfooter = true
        // // // // // // // // // // // // //

        var id = "project-title"
        var place = document.getElementById(`${id}`);
        place.innerText = `${title}`;


        id = "project-desc"
        place = document.getElementById(`${id}`);
        place.textContent = `${text}`;

        document.getElementById("link-github").setAttribute("style", "display: none;");
        document.getElementById("link-external").setAttribute("style", "display: none;");


        if(github !== null){
          id = "link-github"
          place = document.getElementById(`${id}`);
          place.href = `${github}`;
          place.target="_blank"
          document.getElementById("link-github").setAttribute("style", "display: inline;");
        }

        if(external !== null){
          id = "link-external"
          place = document.getElementById(`${id}`);
          place.href = `${external}`;
          place.target="_blank"

          document.getElementById("link-external").setAttribute("style", "display: inline;");
        }

        document.getElementById("footer-desc").setAttribute("style", "display: inline;");
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
        case "contactLinkedin":
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

// #endregion


// #region THREE JS UPDATE

function animate(){
  physicsWorld.fixedStep()
  // cannonDebugger.update() //for checking rendered body
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

// #endregion

function modelLinedUp(){
  marble1Group.visible = true;
  sphere2.visible = true;
  controllerGroup.visible = true
  keyboardGroup.visible = true
  omniGroup.visible = true
  keypad.visible = true

  sphereBody.position.set(0, 0, 0) //marble1
  sphereBody2.position.set(0, 0, 5) //marble2
  boxBody.position.set(5, 0, 0) //controller
  boxBody2.position.set(0, 10, -5) //keyboard
  boxBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), degToRad(45));
  coneBody.position.set(5, 10, 5)
  longBoxBody.position.set(-5, 5, 5) //keypad
}

// window.onload = function(){
//    if(window.innerWidth < 682){
//     modelLinedUp()
    
//   } 
// };

// if(window.innerWidth < 682){
//   console.log('in');
//   modelLinedUp()
// }

