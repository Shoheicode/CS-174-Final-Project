import * as THREE from 'three'; // Imports the library that we will be using which is the Three.js
import { OBB } from 'three/examples/jsm/Addons.js';
import { directionToColor } from 'three/webgpu';

//CONSTANTS:
let zOffset = 5;
let yOffset = 5;

let speed = 0;
let acceleration = 0.01;
let maxSpeed = 0.3;
let dirRotation = 0;

let rSpeed = 0;
let run = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
geometry.computeBoundingBox()
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
cube.position.set(0,0,0);

cube.geometry.userData.obb = new OBB().fromBox3(
	cube.geometry.boundingBox
)

cube.userData.obb = new OBB()

scene.add( cube );

const redCubeGeo = new THREE.BoxGeometry(1,1,1);
redCubeGeo.computeBoundingBox()
const redCubeMat = new THREE.MeshBasicMaterial({color: "red"});
const redCube = new THREE.Mesh(redCubeGeo, redCubeMat);
redCube.position.set(2,0,0);

mesh2.geometry.userData.obb = new OBB().fromBox3(
    mesh2.geometry.boundingBox
)
mesh2.userData.obb = new OBB()

scene.add(redCube)

// Adding bounding box to our black box
const blackCubeBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
blackCubeBB.setFromObject(cube);

// Adding bounding box to our red box
const redCubeBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
redCubeBB.setFromObject(redCube);

// camera.position.z = 5;
// camera.position.y = 5;

function checkCollision() {
	// console.log("RUNNINg")
	if (redCubeBB.intersectsBox(blackCubeBB)) {
		console.log("COLLIDE")
		 cube.material.transparent = true;
		 cube.material.opacity = 0.5;
		 cube.material.color = new THREE.Color(Math.random * 0xffffff);
	   } else {
		 cube.material.opacity = 1;
	   }
 }

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event){
	var keyCode= event.keyCode;
	// console.log(keyCode)
	switch(keyCode){
		case 16: //Acceleration (Shift Key)
			run = true;
			break;
		case 65: //LEFT (A key)
			rSpeed = 0.02;
			// console.log(redCube)
			break;
		case 68: //RIGHT (D KEY)
			rSpeed = -0.02;
			break;
	}
}

document.body.addEventListener('keyup', onKeyUp, false);
function onKeyUp(e) {
	switch(e.keyCode) {
	  case 16: // shift
		run = false;
		break;
	  case 65: // a
		rSpeed = 0;
		break;
	  case 68: // d
		rSpeed = 0;
		break;
	  case 32: // space
		// car.cancelBrake();
		break;
	}
}

function animate() {
	checkCollision()

	// redCube.position.z-=0.01
	if(run){
		speed += acceleration;
		if(speed > maxSpeed){
			speed = maxSpeed;
			// console.log("ACHIEVED MAX SPEED")
		}
	} else{
		// console.log("NOT RUNNING")
		speed -= acceleration;
		if(speed < 0){
			speed = 0;
		}
	}

	speed = -speed; 
	dirRotation +=rSpeed;
	var rotation = dirRotation;
	// console.log(Math.cos(rotation))
	// console.log(speed = 5)
	var speedX = Math.sin(rotation) * speed;
	var speedZ = Math.cos(rotation) * speed;
	// console.log("SPEED:" + speed)
	speed = -speed;

	const raycaster = new THREE.Raycaster();
	const direction = new THREE.Vector3(speedX, 0, speedZ); // Example direction
	raycaster.set(redCube.position, direction);

	const intersects = raycaster.intersectObject(cube);
	if (intersects.length > 0) {
		console.log('Collision detected!');
		redCube.position.x -= speedX;
		redCube.position.z -= speedZ;
	}


	redCube.rotation.y = rotation;
	redCube.position.z += speedZ;
	redCube.position.x += speedX;

	// Update camera to follow the block
	camera.rotation.y = rotation;
	camera.position.x = redCube.position.x + Math.sin(rotation) * 5;
	camera.position.z = redCube.position.z + Math.cos(rotation) * 5;
	camera.position.y = 5
	camera.lookAt(redCube.position)

	renderer.render( scene, camera );

}