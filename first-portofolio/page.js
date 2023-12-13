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