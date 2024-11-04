import * as THREE from 'three'; // Imports the library that we will be using which is the Three.js
import { OBB } from 'three/examples/jsm/Addons.js';
import { directionToColor } from 'three/webgpu';

//CONSTANTS:
let zOffset = 5;
let yOffset = 5;

let speed = 0;
let acceleration = 0.01; // 1 m/s
let maxSpeed = 0.7; // 7 m/s
let dirRotation = 0;
let goBackwards = false;
let speedY = 0;

let rSpeed = 0;
let run = false;

let touchGround = true;

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
cube.position.set(0,1.5,0);

cube.geometry.userData.obb = new OBB().fromBox3(
	cube.geometry.boundingBox
)

cube.userData.obb = new OBB()

scene.add( cube );

const redCubeGeo = new THREE.BoxGeometry(1,1,1);
redCubeGeo.computeBoundingBox()
const redCubeMat = new THREE.MeshBasicMaterial({color: "red"});
const redCube = new THREE.Mesh(redCubeGeo, redCubeMat);
redCube.position.set(2,5,0);

redCube.geometry.userData.obb = new OBB().fromBox3(
    redCube.geometry.boundingBox
)
redCube.userData.obb = new OBB()

scene.add(redCube)

const floorGeo = new THREE.PlaneGeometry(20, 20, 10, 10);
floorGeo.computeBoundingBox();

const floor = new THREE.Mesh(
    floorGeo,
    new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true })
)
floor.geometry.userData.obb = new OBB().fromBox3(
    floor.geometry.boundingBox
)
floor.userData.obb = new OBB();
floor.position.y = 1
floor.rotateX(-Math.PI / 2)
scene.add(floor)

const floor2 = new THREE.Mesh(
    floorGeo,
    new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true })
)
floor2.geometry.userData.obb = new OBB().fromBox3(
    floor2.geometry.boundingBox
)
floor2.userData.obb = new OBB();
floor2.position.y = -4.99
floor2.position.x += 10
floor2.rotateX(-Math.PI / 2)
scene.add(floor2)

let floors = []

floors.push(floor);
floors.push(floor2);

let xVal = 0;
let zVal = 0;
for (var i = -10; i < 10; i++){
	for(var j = -10; j < 10; j++){
		let floorCopy = new THREE.Mesh(
			floorGeo,
			new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true })
		)
		floorCopy.geometry.userData.obb = new OBB().fromBox3(
			floorCopy.geometry.boundingBox
		)
		floorCopy.userData.obb = new OBB();
		floorCopy.position.y = -5
		floorCopy.position.x += xVal
		floorCopy.position.z += zVal
		xVal = 10 * j
		zVal = 10 * i
		floorCopy.rotateX(-Math.PI / 2)

		let cube1 = new THREE.Mesh( geometry, material );

		cube1.geometry.userData.obb = new OBB().fromBox3(
			cube1.geometry.boundingBox
		)

		cube1.userData.obb = new OBB()
		cube1.position.z = floorCopy.position.y+5.5
		cube1.position.y = ((Math.random()-0.5)*2)*10
		cube1.position.x = ((Math.random()-0.5)*2)*10


		// cube1.rotateZ(10)

		floorCopy.add(cube1)
		scene.add(floorCopy)
		floors.push(floorCopy)
	}
}

// Adding bounding box to our black box
const blackCubeBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
blackCubeBB.setFromObject(cube);

// Adding bounding box to our red box
const redCubeBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
redCubeBB.setFromObject(redCube);

// camera.position.z = 5;
// camera.position.y = 5;

function checkCollision(obj1, obj2) {
	// console.log("RUNNINg")
	obj1.userData.obb.copy(obj1.geometry.userData.obb)
    obj2.userData.obb.copy(obj2.geometry.userData.obb)
    obj1.userData.obb.applyMatrix4(obj1.matrixWorld)
    obj2.userData.obb.applyMatrix4(obj2.matrixWorld)
    if (obj1.userData.obb.intersectsOBB(obj2.userData.obb)) {
        // obj2.material.color.set(0x6F7567)
		// touchingGround = true;
		return true;
    } else {
        // obj2.material.color.set(0x00ff00)
		return false;
    }
 }

 function touchingGround(obj1, obj2) {
	// console.log("RUNNINg")
	obj1.userData.obb.copy(obj1.geometry.userData.obb)
    obj2.userData.obb.copy(obj2.geometry.userData.obb)
    obj1.userData.obb.applyMatrix4(obj1.matrixWorld)
    obj2.userData.obb.applyMatrix4(obj2.matrixWorld)
    if (obj1.userData.obb.intersectsOBB(obj2.userData.obb)) {
        // obj2.material.color.set(0x6F7567)
		touchGround = true;
		return true;
    } else {
        // obj2.material.color.set(0x00ff00)
		return false;
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
		case 83:
			goBackwards = true;
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
		case 83:
			goBackwards = false;
		case 32: // space
			// car.cancelBrake();
			break;
	}
}

function animate() {
	// checkCollision()

	// redCube.position.z-=0.01

	floors.forEach(function (obj, index) {
		if(!touchGround){
			if(touchingGround(redCube, obj)){
				// console.log("REDCUBE: " + redCube.position.y)
				// console.log("OBJECT " + index + " : "+ obj.position.y)
				redCube.position.y = obj.position.y + 0.5;
				// console.log("TOUCHING GROUND")
				// touchingGround = true;
				speedY = 0;
			}
		}
		// else{
		// 	speedY -= 0.001
		// 	redCube.position.y += speedY;
		// }
	})

	if(!touchGround){
		speedY -= 0.0098 // 9.8 m/s
		redCube.position.y += speedY;
		// console.log(redCube.position.y)
	}

	if(touchGround){
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
	}

	speed = -speed; 
	dirRotation +=rSpeed;
	var rotation = dirRotation;
	var speedX = Math.sin(rotation) * speed;
	var speedZ = Math.cos(rotation) * speed;
	// console.log("SPEED:" + speed)

	if(checkCollision(redCube, cube)){
		// redCube.rotation.y = rotation;
		console.log("BEFORE X:" + redCube.position.x);
		console.log("Before Z: " + redCube.position.z);
		let speedX2 = Math.sin(rotation) * (speed-0.3);
		let speedZ2 = Math.cos(rotation) * (speed-0.3);
		if(speedX2 < 0){
			redCube.position.x -= (speedX2);
		}
		else if (speedX2 > 0) {
			redCube.position.x -= (speedX2);
		}
		if(speedZ2 < 0){
			redCube.position.z -= (speedZ2);
		}else if (speedZ2 > 0) {
			redCube.position.z -= (speedZ2);
		}

		console.log("after X:" + redCube.position.x);
		console.log("after Z: " + redCube.position.z);
	}else{
		redCube.rotation.y = rotation;
		redCube.position.z += speedZ;
		redCube.position.x += speedX;
	}

	// if(checkCollision(redCube, floor)){
	// 	redCube.position.y = floor.position.y + 0.5;
	// 	console.log("TOUCHING GROUND")
	// }
	// else if(checkCollision(redCube, floor2)){
	// 	redCube.position.y = floor2.position.y + 0.5;
	// 	console.log("TOUCHING GROUND 2")
		
	// }

	

	speed = -speed;

	// Update camera to follow the block
	camera.rotation.y = rotation;
	camera.position.x = redCube.position.x + Math.sin(rotation) * 10;
	camera.position.z = redCube.position.z + Math.cos(rotation) * 10;
	camera.position.y = redCube.position.y + 10
	camera.lookAt(redCube.position)

	renderer.render( scene, camera );
	touchGround = false;

}