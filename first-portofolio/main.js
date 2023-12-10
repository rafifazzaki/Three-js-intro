import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { degToRad } from 'three/src/math/MathUtils';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import TWEEN, { Tween } from '@tweenjs/tween.js'


// 
// // init
// 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(20, 15, 20);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera);



// 
// // geometry
// 
const geometry = new THREE.TorusGeometry(10, 3, 16, 120)
const material = new THREE.MeshBasicMaterial({color:0xE58943, wireframe:true}); //0x818589
const torus = new THREE.Mesh(geometry, material)
// torus.rotateY(degToRad(45))
// scene.add(torus);

const gridHelper = new THREE.GridHelper(200, 50)
const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
// controls.enableZoom = false;
controls.enableDamping = true
controls.minPolarAngle = Math.PI/8; // radians
controls.maxPolarAngle = Math.PI/2; 
// scene.add(gridHelper)
scene.add(controls)

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
scene.add(plane)

plane.rotateX(degToRad(-90))

const loader = new GLTFLoader();

loader.load(
  'base.glb',
  function(gltf){
    const base = gltf.scene
    // var newMaterial = new THREE.MeshBasicMaterial({color: 0xE58943, wireframe: false})
    // base.traverse((o) => {
    //   if(o.isMesh) o.material = newMaterial;
    // })
    base.scale.set(7, 7, 7);
    base.position.setY(-1.5)
    // scene.add(base);
  }
)




var cv_page = document.getElementById('CV_click');
// var porto_page = document.getElementById('Porto_click');
var home_page = document.getElementById('Home_click');
var back_button = document.getElementById('Back_button');
cv_page.onclick = showCV;
// porto_page.onclick = showPortofolio;
home_page.onclick = clearPage;
back_button.onclick = goBack;


function goBack(){
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


function animate(){
  requestAnimationFrame(animate)

  controls.update();

  TWEEN.update()

  renderer.render(scene, camera);
}

animate();




let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let INTERSECTED;
renderer.domElement.addEventListener('mousemove', onPointerMove, false) //pointermove
window.addEventListener('resize', onWindowResize);
renderer.domElement.addEventListener('click', onPointerClick, false)
// renderer.domElement.addEventListener('',)


function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event){
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(scene, true);

  if ( intersects.length > 0 ) {

    if ( INTERSECTED != intersects[ 0 ].object ) {

      if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
      switch(INTERSECTED.name) {
        case "button1":
          GLOW();
          break;
        case "button2":
          GLOW();
          break;
        case "button3":
          GLOW();
          break;
        case "button4":
          GLOW();
          break;
        case "button5":
          GLOW();
          break;
        case "button6":
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

function onPointerClick( event ) {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(scene, true);

  if(intersects.length > 0){
    
    switch(intersects[ 0 ].object.name) {
      case "button1":
        CONTENT_button1();
        break;
      case "button2":
        CONTENT_button1();
        break;
      case "button3":
        CONTENT_button1();
        break;
      case "button4":
        CONTENT_button1();
        break;
      case "button5":
        CONTENT_button1();
        break;
      case "button6":
        CONTENT_button1();
        break;
      
      default:
        // code block
    }
  }

  function CONTENT_button1(){
    console.log("asdasd");
  }

}

