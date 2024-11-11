import * as THREE from 'three'; // Imports the library that we will be using which is the Three.js
import { OBB } from 'three/examples/jsm/Addons.js';
import { directionToColor } from 'three/webgpu';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

//CONSTANTS:
let zOffset = 5;
let yOffset = 5;

let speed = 0;
let acceleration = 0.01; // 10 m/s^2
let maxSpeed = 0.7; // 7 m/s
let dirRotation = -Math.PI/2; // Start turn angle
let goBackwards = false;
let collide = false;
let speedY = 0;

let rSpeed = 0;
let run = false;

let touchGround = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Orthongraphic Camera
const minimapCamera = new THREE.OrthographicCamera(
	-50, 50, 50, -50, 1, 1000 // Adjust these values based on your track size
);

minimapCamera.position.set(0, 800, 0); // Position above the track
// minimapCamera.lookAt(0,0,0)
 // Look at the center of the track
// const trackGeometry = new THREE.CircleGeometry(100, 32);
const trackMaterial = new THREE.MeshBasicMaterial({ acolor: 0x404040 });
const planeForTrack = new THREE.PlaneGeometry(20, 20)
const plane = new THREE.Mesh(planeForTrack, trackMaterial)

// const track = new THREE.Mesh(trackGeometry, trackMaterial);

plane.position.y = 500
// plane.position.y = 
plane.rotateX(-Math.PI/2)
scene.add(plane);

const minimapScene = new THREE.Scene();
minimapScene.add(plane.clone());

const carMarkerGeometry = new THREE.SphereGeometry(5, 16, 16);
const carMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const carMarker = new THREE.Mesh(carMarkerGeometry, carMarkerMaterial);
minimapScene.add(carMarker);
minimapCamera.lookAt(carMarker.position);
// minimapCamera.rotation.set(0,-Math.PI/2,Math.PI)

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
geometry.computeBoundingBox()
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

const redCubeGeo = new THREE.BoxGeometry(1,1,1);
const redCubeMat = new THREE.MeshBasicMaterial({color: "red"});
const redCube = new THREE.Mesh(redCubeGeo, redCubeMat);

//WHEELS THE BLUE
let wheels = [];

const wheel = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
const blue = new THREE.MeshBasicMaterial({color: "blue"});
// const green = new THREE.MeshBasicMaterial({color: "green"});
const blueWheel = new THREE.Mesh(wheel, blue);
redCube.add(blueWheel);
blueWheel.position.set(-0.5,-0.5,0.5)
blueWheel.rotateZ(-Math.PI/2)
// wheel.computeBoundingBox()

const blueWheel2 = new THREE.Mesh(wheel, blue);
redCube.add(blueWheel2);
blueWheel2.position.set(-0.5,-0.5,-0.5)
blueWheel2.rotateZ(-Math.PI/2)

const blueWheel3 = new THREE.Mesh(wheel, blue);
redCube.add(blueWheel3);
blueWheel3.position.set(0.5,-0.5,0.5)
blueWheel3.rotateZ(-Math.PI/2)

const blueWheel4 = new THREE.Mesh(wheel, blue);
redCube.add(blueWheel4);
blueWheel4.position.set(0.5,-0.5,-0.5)
blueWheel4.rotateZ(-Math.PI/2)

// redCube.rotateY(-Math.PI/4)

redCubeGeo.computeBoundingBox()


//Updated the boundary box in order to ensure that it includes the wheels
redCube.geometry.userData.obb = new OBB().fromBox3(
    // redCube.geometry.boundingBox
	new THREE.Box3(new THREE.Vector3(-0.75, -0.75, -0.75),new THREE.Vector3(0.75, 0.75, 0.75))
)
redCube.userData.obb = new OBB()

scene.add(redCube)

const floorGeo = new THREE.PlaneGeometry(20, 20, 10, 10);
floorGeo.computeBoundingBox();

// const floor = new THREE.Mesh(
//     floorGeo,
//     new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true })
// )
// floor.geometry.userData.obb = new OBB().fromBox3(
//     floor.geometry.boundingBox
// )
// floor.userData.obb = new OBB();
// floor.position.y = 1
// floor.rotateX(-Math.PI / 2)
// scene.add(floor)

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
// scene.add(floor2)

// -> -x 
// z+
// ^
// |
let map = [
	[2,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,2],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[2,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,2],
]

let currentTile = null;

console.log(map.length)

let floors = []

// floors.push(floor);

let xVal = 0;
let zVal = 0;
for (var i = -10; i < 10; i++){
	for(var j = -10; j < 10; j++){
		if(map[i+10][j+10] != 0){
			xVal = 20 * i
			zVal = 20 * j
			let floorCopy = new THREE.Mesh(
				floorGeo,
				new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true })
			)

			let trackMatCopy = trackMaterial.clone()

			let trackCopy = new THREE.Mesh(planeForTrack, trackMatCopy)

			trackCopy.position.y = 500;
			trackCopy.position.x = xVal
			trackCopy.position.z = zVal
			trackCopy.rotateX(-Math.PI/2)

			floorCopy.geometry.userData.obb = new OBB().fromBox3(
				floorCopy.geometry.boundingBox
			)
			floorCopy.userData.obb = new OBB();
			floorCopy.position.y = -5
			floorCopy.position.x = xVal
			floorCopy.position.z = zVal
			floorCopy.rotateX(-Math.PI / 2)

			//SO THAT THE MATERIALS DO NOT ALL LOOK THE SAME
			let mat2 = material.clone()

			let cube1 = new THREE.Mesh( geometry, mat2 );
			let cube2 = cube1.clone()

			cube2.geometry.userData.obb = new OBB().fromBox3(
				cube1.geometry.boundingBox
			)

			cube2.userData.obb = new OBB()
			cube2.position.z = floorCopy.position.y+5.5
			cube2.position.y = ((Math.random()-0.5)*2)*5
			cube2.position.x = ((Math.random()-0.5)*2)*5

			// cube1.rotateZ(10)
			if(map[i+10][j+10] == 2){
				// console.log("CUBE MAKING DIFFERENT COLOR")
				floorCopy.material.color.setRGB(1,0.5,1);
				trackCopy.material.color.setRGB(1,0.5,1)
				// cube2.material.color.setRGB(1, 0.5, 0.5)
			}else if(map[i+10][j+10] == 3){
				floorCopy.material.color.setRGB(1,0.5,0.5);
				trackCopy.material.color.setRGB(1,0.5,0.5);
				currentTile = floorCopy;
				redCube.position.set(xVal,5,zVal);
			}
			else{
				cube2.material.color.setRGB(1, 1, 0.5)
			}
			
			// cube1 = cube1.clone()

			floorCopy.add(cube2)
			scene.add(trackCopy)
			minimapScene.add(trackCopy.clone());
			// console.log(floorCopy)
			floors.push(floorCopy)
			scene.add(floorCopy)
		}
	}
}

// console.log(floors[5].children[0].material.color.setRGB(1, 0.5, 0.5))

// Adding bounding box to our black box
// const blackCubeBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
// blackCubeBB.setFromObject(cube);

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
		collide = true;
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
	console.log(keyCode)
	switch(keyCode){
		case 16: //Acceleration (Shift Key)
			run = true;
			break;
		case 32:
			run = false;
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

function outOfBounds(){
	if(redCube.position.y < -50){
		return true;
	}
	return false;
}

function updateMinimap() {
	// Update carMarker position based on player's car position
	carMarker.position.x = redCube.position.x;
	carMarker.position.z = redCube.position.z;
  
	// Optionally, rotate the marker to match the player’s orientation
	carMarker.rotation.y = redCube.rotation.y;
	carMarker.position.y = 500
}

let clock = new THREE.Clock();
const timeScale = 0.00005;

// let clock = new THREE.Clock();
let delay = 0.00000001; // Delay in seconds
let actionPerformed = false;

// const controls = new OrbitControls(camera, renderer.domElement);
// camera.position.set(0, 5, 10); // Where the camera is.
// controls.target.set(0, 0, 0); // Where the camera is looking towards.

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Format with leading zeros if needed
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = secs.toString().padStart(2, '0');

	if(hours > 99){
		return '99:99:99';
	}

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

function animate() {
	// checkCollision()

	// redCube.position.z-=0.01
	// let elapsedTime = clock.getElapsedTime();

	// if (elapsedTime > delay){
	let elapsedTime = Math.floor(clock.getElapsedTime())
	document.getElementById("info").innerText = `Time: ${formatTime(elapsedTime)}s`

	floors.forEach(function (obj, index) {
		if(!touchGround){
			if(touchingGround(redCube, obj)){
				redCube.position.y = obj.position.y + 0.75;
				// fallen = false;
				currentTile = obj;
				// console.log("TOUCHING GROUND")
				// touchingGround = true;
				speedY = 0;
			}
		}
	})

	if(!touchGround){
		speedY -= 0.0098 // 9.8 m/s
		redCube.position.y += speedY;
		// if(touchingGround(redCube, obj)){
		// 	// console.log("REDCUBE: " + redCube.position.y)
		// 	// console.log("OBJECT " + index + " : "+ obj.position.y)
		// 	redCube.position.y = obj.position.y + 0.5;
		// 	// console.log("TOUCHING GROUND")
		// 	// touchingGround = true;
		// 	speedY = 0;
		// }
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
		dirRotation +=rSpeed;
	}
	speed = -speed; 
	var rotation = dirRotation;
	var speedX = Math.sin(rotation) * speed;
	var speedZ = Math.cos(rotation) * speed;
	// console.log("SPEED:" + speed)

	floors.forEach(function (obj, index) {
		obj["children"].forEach(function(obj2, index){
			if(!collide){
				if(checkCollision(redCube, obj2)){
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
					speed = 0
				}
			}
		})
	})

	if(!collide){
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
	if(outOfBounds()){
		console.log(currentTile)
		redCube.position.x = currentTile.position.x;
		redCube.position.z = currentTile.position.z;
		redCube.position.y = 15;
		speed = 0;
	}

	

	speed = -speed;

	// Update camera to follow the block
	camera.rotation.y = rotation;
	camera.position.x = redCube.position.x + Math.sin(rotation) * 10;
	camera.position.z = redCube.position.z + Math.cos(rotation) * 10;
	camera.position.y = redCube.position.y + 10
	camera.lookAt(redCube.position)
	// controls.update();
	// delay += elapsedTime
	// }
	renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
	renderer.setScissorTest(true);
	renderer.render( scene, camera );

	updateMinimap()

	const minimapSize = 200;
	renderer.setViewport(window.innerWidth - minimapSize - 10, 10, minimapSize, minimapSize);
	renderer.setScissor(window.innerWidth - minimapSize - 10, 10, minimapSize, minimapSize);
	renderer.setScissorTest(true);
	// minimapCamera.rotateY(-Math.PI/2)
	minimapCamera.position.set(
		carMarker.position.x,
		800,
		carMarker.position.z,
	)
	minimapCamera.lookAt(carMarker.position);
	renderer.render(minimapScene, minimapCamera);
	

	touchGround = false;
	collide = false;
}