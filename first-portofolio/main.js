import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { degToRad } from 'three/src/math/MathUtils';

import TWEEN, { Tween } from '@tweenjs/tween.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(20, 15, 20);


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera);



const geometry = new THREE.TorusGeometry(10, 3, 16, 120)
const material = new THREE.MeshBasicMaterial({color:0xE58943, wireframe:true});
const torus = new THREE.Mesh(geometry, material)
// torus.rotateY(degToRad(45))
scene.add(torus);

const gridHelper = new THREE.GridHelper(200, 50)
const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.enableZoom = false;
controls.enableDamping = true
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




var cv_page = document.getElementById('CV_click');
var porto_page = document.getElementById('Porto_click');
var home_click = document.getElementById('Home_click');
cv_page.onclick = showCV;
porto_page.onclick = showPortofolio;
home_click.onclick = clearPage

function clearPage(){
  document.getElementById("PAGE_CV").setAttribute("style", "display: none");
  document.getElementById("PAGE_Portofolio").setAttribute("style", "display: none");
  
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
}

function showCV(){
  document.getElementById("PAGE_CV").setAttribute("style", "display: block");
  document.getElementById("PAGE_Portofolio").setAttribute("style", "display: none");
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





