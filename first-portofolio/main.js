import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { degToRad } from 'three/src/math/MathUtils';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
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
scene.add(gridHelper)
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
scene.add(plane)

plane.rotateX(degToRad(-90))



function animate(){
  requestAnimationFrame(animate)

  controls.update();

  renderer.render(scene, camera);
}

animate();





