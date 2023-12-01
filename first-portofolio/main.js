import './style.css'

import * as THREE from 'three';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})


renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera);

function animate(){
  requestAnimationFrame(animate)

  renderer.render(scene, camera);
}

animate();


const plane = new THREE.PlaneGeometry(5, 5);
const planeMat = new THREE.MeshStandardMaterial();
const ground = new THREE.Mesh(plane, planeMat)
scene.add(ground)