import * as THREE from 'three'; // Imports the library that we will be using which is the Three.js
import { OBB } from 'three/examples/jsm/Addons.js';
import { directionToColor } from 'three/webgpu';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mx_bilerp_0 } from 'three/src/nodes/materialx/lib/mx_noise.js';
// import { GUI } from 'dat.gui'

// Translation Matrices
function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}

function rotationMatrixX(theta) {
    return new THREE.Matrix4().set(
        1, 0, 0, 0,
        0, Math.cos(theta), -Math.sin(theta), 0,
        0, Math.sin(theta), Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

function rotationMatrixY(theta) {
    return new THREE.Matrix4().set(
        Math.cos(theta), 0, Math.sin(theta), 0,
        0, 1, 0, 0,
        -Math.sin(theta), 0, Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

function rotationMatrixZ(theta) {
	return new THREE.Matrix4().set(
		Math.cos(theta), -Math.sin(theta), 0, 0,
		Math.sin(theta),  Math.cos(theta), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	);
}

//CONSTANTS:

let gameState = ["Start", "Map1", "Map2", "Map 3", "Reset"]

let clock = new THREE.Clock();

let zOffset = 5;
let yOffset = 5;

let startX = 0;
let startZ = 0;

let lapCount = 0;
let lapTimes = []
let elapsedTime = 0;
let prevTime = 0;

let powerupActivate = false;
let timePowerupDuration = 0;

let speed = 0;
let acceleration = 0.01; // 10 m/s^2
let maxSpeed = 0.7; // 7 m/s
let dirRotation = -Math.PI/2; // Start turn angle
let goBackwards = false;
let collide = false;
let speedY = 0;
let raceOver = false;

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
const trackMaterial = new THREE.MeshBasicMaterial({ acolor: 0x404040 });
const planeForTrack = new THREE.PlaneGeometry(20, 20)
const plane = new THREE.Mesh(planeForTrack, trackMaterial)

// const track = new THREE.Mesh(trackGeometry, trackMaterial);

plane.position.y = 500
// plane.position.y = 
plane.rotateX(-Math.PI/2)
// scene.add(plane);

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

// scene.add(redCube)

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

// const floor2 = new THREE.Mesh(
//     floorGeo,
//     new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true })
// )
// floor2.geometry.userData.obb = new OBB().fromBox3(
//     floor2.geometry.boundingBox
// )
// floor2.userData.obb = new OBB();
// floor2.position.y = -4.99
// floor2.position.x += 10
// floor2.rotateX(-Math.PI / 2)
// scene.add(floor2)

// -> -x 
// z+
// ^
// |

//17 + 20 + 17 + 20 = 
let map = [
	[1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,1,1,1,1,0,0,1,1,8,1,1,1,1,1,1,1,0,0,0],
]

let currentTile = null;

// console.log(map.length)

let floors = []
let floors2 = []

// floors.push(floor);

let completedCheckPoints = []
let allCheckPoints = []

let checkpointNum = 0;

let xVal = 0;
let zVal = 0;

let floorCopy = new THREE.Mesh(
	floorGeo,
	new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true })
)

let trackMatCopy1 = trackMaterial.clone()

let trackCopy1 = new THREE.Mesh(planeForTrack, trackMatCopy1)

const texture = new THREE.TextureLoader().load('road-texture-4k-02.jpg')

// trackCopy.position.y = 500;
// trackCopy.position.x = xVal
// trackCopy.position.z = zVal
// trackCopy.rotateX(-Math.PI/2)

function createMap(){
	scene.add(redCube)
	console.log("LENGTH AFTER" +  scene.children.length)
for (var i = -10; i < 10; i++){
	for(var j = -10; j < 10; j++){
		if(map[i+10][j+10] != 0){
			xVal = 20 * i
			zVal = 20 * j

			const mat = new THREE.MeshPhongMaterial();
			// const bumpTexture = new THREE.TextureLoader().load('road-texture-4k-02.jpg')
			// mat.bumpMap = bumpTexture
			// mat.bumpScale = 0.015

			let floorCopy = new THREE.Mesh(
				floorGeo,
				mat
			)
			// let floorCopy = new THREE.Mesh(
			// 	floorGeo,
			// 	new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true })
			// )

			let trackMatCopy = trackMaterial.clone()

			let trackCopy = new THREE.Mesh(planeForTrack, trackMatCopy)

			trackCopy.name = "track"

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

			const light = new THREE.PointLight(0xffffff, 1000)
			light.name = "light";
			light.position.set(xVal, 100, zVal)
			scene.add(light)

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
			if(map[i+10][j+10] <10 && map[i+10][j+10] > 4){
				floorCopy.material.color.setRGB(1,0.5,1);
				// const bumpTexture = new THREE.TextureLoader().load('img/earth_bumpmap.jpg')

				trackCopy.material.color.setRGB(1,0.5,1);
				floorCopy.material.wireframe = true
				floorCopy.name = "CHECKPOINT" + map[i+10][j+10];
				console.log(map[i+10][j+10])
				completedCheckPoints.push(floorCopy.name)
				allCheckPoints.push(floorCopy.name)
				checkpointNum++;
				// cube2.material.color.setRGB(1, 0.5, 0.5)
			}else if(map[i+10][j+10] == 3){
				floorCopy.material.color.setRGB(1,0.5,0.5);
				trackCopy.material.color.setRGB(1,0.5,0.5);
				floorCopy.material.wireframe = true
				currentTile = floorCopy;
				floorCopy.name = "ENDING"
				redCube.position.set(xVal,5,zVal);
				// redCube.matrix.set(xVal, 5, zVal);
				startX = xVal;
				startZ = zVal
				// redCube.matrixAutoUpdate = false;
			}
			else{
				floorCopy.material.color.setRGB(0.5,0.5,0.5);
				floorCopy.material.map = texture
				floorCopy.name = "floor";
				if(Math.random() <= 0.2){
					cube2.material.color.setRGB(0.5, 0.5, 0.5)
					cube2.name = "POWERUP"
					// console.log("HIHIHI")
				}
				else{
					cube2.material.color.setRGB(1, 1, 0.5)
				}
			}
			
			// cube1 = cube1.clone()
			if(floorCopy.name != "ENDING"){
				floorCopy.add(cube2)
			}

			scene.add(trackCopy)
			minimapScene.add(trackCopy.clone());
			// console.log(floorCopy)
			floors.push(floorCopy)
			scene.add(floorCopy)

			// scene.add(floorCopy2)
		}
	}
}
console.log("LENGTH AFTER PT 2:" +  scene.children.length)
}
createMap()

completedCheckPoints.reverse()

function deleteMap(){
	let deleteObj = []
	let i = 0;
	console.log("scene.children after: ");
	console.log(scene.children);
	console.log("Length BEOFRE" + scene.children.length)
	scene.children.forEach((obj)=>{
		deleteObj.push(obj)
	})

	deleteObj.forEach((obj)=>{
		scene.remove(obj)
	})

	minimapScene.children.forEach((obj)=>{
		// console.log(obj.name)
		if(obj.name == "track"){
			console.log(obj.name)
			scene.remove(obj)
		}
	})
	
	// console.log(floors)
	floors = []
}


function createMap2(){
	for (var i = -10; i < 10; i++){
		for(var j = -10; j < 10; j++){
			if(map[i+10][j+10] != 0){
				xVal = 20 * i
				zVal = 20 * j
	
				let floorCopy2 = new THREE.Mesh(
					floorGeo,
					new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true })
				)
	
				floorCopy2.geometry.userData.obb = new OBB().fromBox3(
					floorCopy2.geometry.boundingBox
				);
				floorCopy2.userData.obb = new OBB();
				let M = new THREE.Matrix4();
				M = rotationMatrixX(-Math.PI/2).multiply(M);
				M = translationMatrix(xVal, -5, zVal).multiply(M);
				floorCopy2.matrix.copy(M)
				floorCopy2.matrixAutoUpdate = false;

				if(map[i+10][j+10] == 3){
					// floorCopy.material.color.setRGB(1,0.5,0.5);
					// trackCopy.material.color.setRGB(1,0.5,0.5);
					// currentTile = floorCopy;
					// floorCopy.name = "ENDING"
					redCube.position.set(xVal,5,zVal);
					// let MPLAYER = new THREE.Matrix4()
					// MPLAYER = translationMatrix(xVal, 5, zVal).multiply(MPLAYER);
					// redCube.matrix.copy(MPLAYER)
					// // MCAM = translationMatrix(redCube.position.x + Math.sin(rotation) * 10, 0, redCube.position.y + 10 , redCube.position.z + Math.cos(rotation) * 10)
					// camera.matrix.copy(MPLAYER)
					// camera.matrixAutoUpdate = false;
					// x = xVal;
					// z = zVal
					// redCube.matrixAutoUpdate = false;
				}
	
				scene.add(floorCopy2)
				floors2.push(floorCopy2)
			}
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
		const indexToRemove = completedCheckPoints.indexOf(obj2.name);
		if (indexToRemove == 0) {
			console.log("hi ho")
			completedCheckPoints.splice(indexToRemove, 1);
		}

		if(obj2.name == "ENDING" && completedCheckPoints.length == 0){
			document.getElementById("lapTimes").innerHTML = ""
			completedCheckPoints = [... allCheckPoints]
			lapTimes.push(elapsedTime-prevTime);
			prevTime = elapsedTime
			console.log("LAP COMPLETE")
			lapCount++;
			lapTimes.forEach(function(time, index){
				// console.log(index)
				document.getElementById("lapTimes").innerText += `Lap ${index+1}` + `: ${formatTime(time)}s` + '\n'
			})
		}
        // obj2.material.color.set(0x6F7567)
		touchGround = true;
		return true;
    } else {
        // obj2.material.color.set(0x00ff00)
		return false;
    }
 }

function reset(){
	// console.log("RUNNINg")
	speed = 0;
	redCube.position.set(startX, 5, startZ);
	dirRotation = -Math.PI/2;
	clock.elapsedTime = 0;
	completedCheckPoints = [... allCheckPoints]
	lapTimes = [];
	lapCount = 0;
	prevTime = 0;
	document.getElementById("lapTimes").innerText=""
	deleteMap()
	createMap()

}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event){
	var keyCode= event.keyCode;
	// console.log(keyCode)
	switch(keyCode){
		case 16: //Acceleration (Shift Key)
			run = true;
			break;
		case 32: // Space bar
			run = false;
			// scene.children = []
			break;
		case 65: //LEFT (A key)
			rSpeed = 0.03;
			// console.log(redCube)
			break;
		case 68: //RIGHT (D KEY)
			rSpeed = -0.03;
			break;
		case 83:
			goBackwards = true;
			break;
		case 82:
			console.log("RESET")
			reset();
			break;
	}
}

document.body.addEventListener('keyup', onKeyUp, false);
function onKeyUp(e) {
	switch(e.keyCode) {
		case 16: // shift
			console.log("KEY UP")
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
	// createMap()

	// trackCopy1.matrix.copy(translationMatrix(x, -5, z))
	// trackCopy1.matrixAutoUpdate = false

	if(raceOver){
		return;
	}

	let M = new THREE.Matrix4();
	// M = translationMatrix(0, speedY, 0);

	// console.log(completedCheckPoints.length)
	// if(checkpointNum.length == 6){
	// 	console.log("HI")
	// }

	// console.log(currentTile.name)
	// checkCollision()

	// redCube.position.z-=0.01
	// let elapsedTime = clock.getElapsedTime();

	// if (elapsedTime > delay){
	elapsedTime = Math.floor(clock.getElapsedTime())
	document.getElementById("time").innerText = `Time: ${formatTime(elapsedTime)}s`

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

	// floors2.forEach(function (obj, index) {
	// 	if(!touchGround){
	// 		if(touchingGround(redCube, obj)){
	// 			console.log("TOUCHING")
	// 			let M = new THREE.Matrix4();
	// 			M = translationMatrix(0, 0, 0).multiply(M);
	// 			redCube.matrix.multiply(M);
	// 			redCube.matrixAutoUpdate = false;
	// 			// redCube.position.y = obj.position.y + 0.75;
	// 			// fallen = false;
	// 			currentTile = obj;
	// 			// console.log("TOUCHING GROUND")
	// 			// touchingGround = true;
	// 			speedY = 0;
	// 		}
	// 	}
	// })

	if(!touchGround){
		// console.log("FALLING")
		speedY -= 0.0098 // 9.8 m/s
		// let M = new THREE.Matrix4();
		// M = translationMatrix(0, speedY, 0);
		// redCube.matrix.multiply(M);
		// redCube.matrixAutoUpdate = false;
		redCube.position.y += speedY
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

			if(powerupActivate){
				speed = 1;
			}
				else{
				speed += acceleration;
				if(speed > maxSpeed){
					speed = maxSpeed;
					// console.log("ACHIEVED MAX SPEED")
				}
			}
		} else{
			powerupActivate = false;
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
				if(checkCollision(redCube, obj2) && obj2.name == "POWERUP"){
					obj.remove(obj2)
					powerupActivate = true
					timePowerupDuration = elapsedTime + 3;
				}
				else if(checkCollision(redCube, obj2)){
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
		// console.log("HIHIH")
		// let M = new THREE.Matrix4();
		// let prev = redCube.matrix.clone();
		// M = redCube.matrix;
		// // M = prev.clone().invert()
		// M = rotationMatrixY(rotation).multiply(M)
		// // M = prev.multiply(M);
		// M = translationMatrix(0.1, 0, 0.1).multiply(M);
		// M = prev.multiply(M)
		// redCube.matrix.copy(M)//multiply(M);
		// redCube.matrixAutoUpdate = false;
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
		powerupActivate = false;
	}

	speed = -speed;

	// Update camera to follow the block
	let MCAM = new THREE.Matrix4()
	// MCAM = rotationMatrixY(rotation)
	// MCAM = translationMatrix(redCube.position.x + Math.sin(rotation) * 10, 0, redCube.position.y + 10 , redCube.position.z + Math.cos(rotation) * 10)
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

	if(lapCount == 3){
		console.log("FINISH RACE")
		raceOver = true;
	}

	if(powerupActivate && timePowerupDuration <= elapsedTime){
		powerupActivate = false;
	}

	touchGround = false;
	collide = false;
}