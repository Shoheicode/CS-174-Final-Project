import * as THREE from 'three'; // Imports the library that we will be using which is the Three.js

//CONSTANTS:
let zOffset = 5;
let yOffset = 5;


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
cube.position.set(0,0,0);
scene.add( cube );

const redCubeGeo = new THREE.BoxGeometry(1,1,1);
const redCubeMat = new THREE.MeshBasicMaterial({color: "red"});
const redCube = new THREE.Mesh(redCubeGeo, redCubeMat);
redCube.position.set(2,0,0)
scene.add(redCube)

// camera.position.z = 5;
// camera.position.y = 5;
let speed = 5;
let rSpeed = 0

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event){
	var keyCode= event.keyCode;
	console.log(keyCode)
	switch(keyCode){
		// case 87:
		// 	console.log("HIHI")
		// 	redCube.position.z -=1;
		// 	break;
		case 16: //Acceleration (Shift Key)
			
			break;
		case 65: //LEFT (A key)
			redCube.rotateY(0.1)
			console.log(redCube)
			break;
		case 68: //RIGHT (D KEY)
			redCube.rotateY(-0.1)
			break;
	}
}

document.body.addEventListener('keyup', onKeyUp, false);
function onKeyUp(e) {
	switch(e.keyCode) {
	  case 87: // w
		car.run = false;
		break;
	  case 65: // a
		car.rSpeed = 0;
		break;
	  case 68: // d
		car.rSpeed = 0;
		break;
	  case 32: // space
		car.cancelBrake();
		break;
	}
}

function animate() {

	// redCube.position.z-=0.01

	// Update camera to follow the block
	camera.position.x = redCube.position.x
	camera.position.z = redCube.position.z + zOffset; // Offset the camera slightly behind the block
	camera.position.y = redCube.position.y + yOffset; // Offset the camera slightly above the block

	camera.lookAt(redCube.position)

	renderer.render( scene, camera );

}