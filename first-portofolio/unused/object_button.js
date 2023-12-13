// 
// SCENE INTERACTION
// 


let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let INTERSECTED;
renderer.domElement.addEventListener('mousemove', onPointerMove, false) //pointermove

renderer.domElement.addEventListener('click', onPointerClick, false)
// renderer.domElement.addEventListener('',)



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