import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({
canvas: document.querySelector('#bg')
});
// camera.position.setZ(30);


renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera);

const geometry = new THREE.TorusGeometry(10, 3, 16, 120)
const material = new THREE.MeshStandardMaterial({color:0xE58943});
const torus = new THREE.Mesh(geometry, material)
scene.add(torus);

const pointLight = new THREE.PointLight(0xffffff, 1500)
const ambientLight = new THREE.AmbientLight(0xffffff)
pointLight.position.set(20, 20, 20)


scene.add(pointLight, ambientLight)

const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50)
scene.add(lightHelper, gridHelper)


function addStars(){
    const starGeometry = new THREE.SphereGeometry(0.25, 20, 20);
    const starMaterial = new THREE.MeshStandardMaterial(0xffffff)
    const star = new THREE.Mesh(starGeometry, starMaterial);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

    
    star.position.set(x, y, z);
    scene.add(star);
}

const z = Array(100).fill().forEach(() => {addStars()});


// const controls = new OrbitControls( camera, renderer.domElement );


const spaceTexture = new THREE.TextureLoader().load('nebula.png');
scene.background = spaceTexture;

const rafifTexture = new THREE.TextureLoader().load('foto.png');
// rafifTexture.color(0xffffff)
const rafif = new THREE.Mesh(
    new THREE.BoxGeometry(5 ,5 ,5),
    new THREE.MeshBasicMaterial( { map: rafifTexture, transparent: true, opacity:1 } )
)
// scene.add(rafif)

const moonTexture = new THREE.TextureLoader().load('moon.jpg');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');

const moon = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshStandardMaterial({
        map: moonTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(0.4, 0.4)
    })
);
scene.add(moon)


const groupToRotateAround = new THREE.Group();
groupToRotateAround.add(moon)

scene.add(groupToRotateAround);
moon.position.set(-20, 0, -20) //same as .x = 20 and .z = 20 or .setX(20)


function moveCamera(){
    const t = document.body.getBoundingClientRect().top

    torus.rotation.x = t * 0.001;
    torus.rotation.y = t * 0.0005;
    torus.rotation.z = t * 0.001


    moon.rotation.y = t * 0.005
    groupToRotateAround.rotation.y = t * 0.001

    camera.position.z = t * -0.01;
    camera.position.x = t * -0.0002;
    camera.rotation.y = t * -0.0002;

}

document.body.onscroll = moveCamera //attach function when onScroll


// cool stuff, no ambient light, point light 5, 5, 5 and wireframe. torusgeo(10, 3, 16, 120), PointLight(0xffffff, 1.5), and positoin 5, 5, 5
function animate(){ //Update function 
    requestAnimationFrame(animate);

    // torus.rotation.x += 0.01;
    // torus.rotation.y += 0.005;
    // torus.rotation.z += 0.01


    // moon.rotation.y += 0.005
    // groupToRotateAround.rotation.y += 0.01
    
    // controls.update(); //orbit control

    renderer.render(scene, camera);
}

animate();

