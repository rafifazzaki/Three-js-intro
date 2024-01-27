var cv_page = document.getElementById('CV_click');
var home_page = document.getElementById('Home_click');
cv_page.onclick = showCV;
home_page.onclick = clearPage;

// var porto_page = document.getElementById('Porto_click');
// porto_page.onclick = showPortofolio;


const PAGE_CV = document.getElementById("PAGE_CV")
const PAGE_Portofolio = document.getElementById("PAGE_Portofolio")
const footer = document.getElementById("footer")
const footerDesc = document.getElementById("footer-desc")
var Toggle_CV = true


function clearPage(){
  hideElement(PAGE_CV)
  hideElement(PAGE_Portofolio)
  showElement(footer)
}
function showCV(){
  
  if(Toggle_CV === true){
    Toggle_CV = false
    showElement(PAGE_CV)
    hideElement(PAGE_Portofolio)
    hideElement(footer)
  }else{
    Toggle_CV = true
    hideElement(PAGE_CV)
    hideElement(PAGE_Portofolio)
    showElement(footer)
  }
}

// fadeIn
function showElement(element){
  document.getElementById("container").setAttribute("style", "position: block;");
  element.setAttribute("style", "display: block");
  element.classList.remove("fadeOut");
  element.classList.add("fadeIn");
}
// fadeOut
function hideElement(element){
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