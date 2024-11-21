import * as THREE from 'three'; // Imports the library that we will be using which is the Three.js
import { OBB } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { myFunction } from './Start/introduction';
import { addData, checkDocumentExists, getBestLapTimes } from './firebase';
import { updateleaderboard } from './startpage';
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
let currentState = "Start";

let clock = new THREE.Clock();

let name = ""

let zOffset = 5;
let yOffset = 5;

let startX = 0;
let startZ = 0;

let lapCount = 0;
let lapTimes = []
let elapsedTime = 0;
let prevTime = 0;
let offset = 0; // for powerup

let update = true;

let powerupActivate = false;
let timePowerupDuration = 0;

let speed = 0;
let acceleration = 0.005; // 5 m/s^2
let maxSpeed = 0.7; // 7 m/s
let dirRotation = -Math.PI/2; // Start turn angle
let goBackwards = false;
let collide = false;
let speedY = 0;
let raceOver = false;

// init death counters
let deaths = 0;
let currentDeaths = 0;

let rSpeed = 0;
let run = false;

let touchGround = true;

//Scene Code
const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load('Assets/Images/39608.jpg');
// https://wallpaperaccess.com/universe-landscape

scene.background = bgTexture;
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.frustumCulled = true

// Power-Up Texture
const powerupTexture = textureLoader.load('Assets/Images/powerUp1Texture.png');

// Finish Line Texture
const finishTexture = textureLoader.load('Assets/Images/finishline.jpg');
// https://www.istockphoto.com/bot-wall?returnUrl=%2Fphotos%2Ffinish-line

let carMesh;
function loadGLTF() {
    let carLoader = new GLTFLoader();

    carLoader.load('Assets/Models/car.glb', (gltf) => {
        carMesh = gltf.scene;
        carMesh.scale.set(1, 1, 1);
        // carMesh.rotateZ(3.14);
        scene.add(carMesh)
    },
	undefined, // Optional onProgress callback
	(error) => {
		console.error('An error occurred:', error);
	}
	);

	console.log("HIHI")
}

// Call in create map
loadGLTF();

let bestTimes = []
getBestLapTimes().then((value) =>{
	// console.log("HEYO")
	// console.log(value)
	bestTimes = value;
	// console.log(bestTimes)
})

// console.log(bestTimes)

// Orthongraphic Camera
const minimapCamera = new THREE.OrthographicCamera(
	-50, 50, 50, -50, 1, 1000 // Adjust these values based on your track size
);

minimapCamera.position.set(0, 800, 0); // Position above the track
const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x404040 });
const planeForTrack = new THREE.PlaneGeometry(20, 20)
const plane = new THREE.Mesh(planeForTrack, trackMaterial)

// const track = new THREE.Mesh(trackGeometry, trackMaterial);

plane.position.y = 500
plane.rotateX(-Math.PI/2)

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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, true);

const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
sphereGeo.computeBoundingBox()

const playerGeo = new THREE.BoxGeometry(1,1,1);
const playerMat = new THREE.MeshPhongMaterial({color: "red"});
const player = new THREE.Mesh(playerGeo, playerMat);

//WHEELS THE BLUE
let wheels = [];

const wheel = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
const blue = new THREE.MeshPhongMaterial();
blue.map = textureLoader.load('Assets/Images/RainbowWheelTexture.jpg')
// const green = new THREE.MeshBasicMaterial({color: "green"});
const blueWheel = new THREE.Mesh(wheel, blue);
player.add(blueWheel);
blueWheel.position.set(-0.5,-0.5,0.5)
blueWheel.rotateZ(-Math.PI/2)
// wheel.computeBoundingBox()

const blueWheel2 = new THREE.Mesh(wheel, blue);
player.add(blueWheel2);
blueWheel2.position.set(-0.5,-0.5,-0.5)
blueWheel2.rotateZ(-Math.PI/2)

const blueWheel3 = new THREE.Mesh(wheel, blue);
player.add(blueWheel3);
blueWheel3.position.set(0.5,-0.5,0.5)
blueWheel3.rotateZ(-Math.PI/2)

const blueWheel4 = new THREE.Mesh(wheel, blue);
player.add(blueWheel4);
blueWheel4.position.set(0.5,-0.5,-0.5)
blueWheel4.rotateZ(-Math.PI/2)

wheels = [blueWheel,blueWheel2,blueWheel3,blueWheel4]

// player.rotateY(-Math.PI/4)

playerGeo.computeBoundingBox()


//Updated the boundary box in order to ensure that it includes the wheels
player.geometry.userData.obb = new OBB().fromBox3(
    // player.geometry.boundingBox
	new THREE.Box3(new THREE.Vector3(-0.75, -0.75, -1.55),new THREE.Vector3(0.75, 0.75, 1.55))
)
player.userData.obb = new OBB()

// scene.add(player)

const floorGeo = new THREE.PlaneGeometry(20, 20, 10, 10);
floorGeo.computeBoundingBox();

// -> -x 
// z+
// ^
// |

//17 + 20 + 17 + 20 = 
let map = [
	[1,2,2,2,2,2,2,2,2,5,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[3,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,1,2,2,1,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,2,2,2,1,0,0,1,2,8,1,0,0,0,0,0,0,0,0,0],
]

let currentTile = null;

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

const texture = new THREE.TextureLoader().load('Assets/Images/road-texture-4k-02.jpg')

// trackCopy.position.y = 500;
// trackCopy.position.x = xVal
// trackCopy.position.z = zVal
// trackCopy.rotateX(-Math.PI/2)

let matSphere = new THREE.MeshPhongMaterial();

function createMap(){
	scene.add(player)
	const light = new THREE.PointLight(0xffffff, 2, 0, 0.0001)
	light.name = "light";
	light.position.set(0, 10000000, 0)
	// light.rotation.z = -Math.PI;
	scene.add(light);
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

				// trackCopy.position.y = 500;
				// trackCopy.position.x = xVal
				// trackCopy.position.z = zVal
				// trackCopy.rotateX(-Math.PI/2)

				let M = new THREE.Matrix4();
				M = rotationMatrixX(-Math.PI/2).multiply(M);
				M = translationMatrix(xVal, 500, zVal).multiply(M);
				trackCopy.matrix.copy(M)
				trackCopy.matrixAutoUpdate = false;

				floorCopy.geometry.userData.obb = new OBB().fromBox3(
					floorCopy.geometry.boundingBox
				)
				floorCopy.userData.obb = new OBB();
				floorCopy.position.y = -5
				floorCopy.position.x = xVal
				floorCopy.position.z = zVal
				floorCopy.rotateX(-Math.PI / 2)

				// if(j % 3 == 0){
				// 	const light = new THREE.PointLight(0xffffff, 1000)
				// 	light.name = "light";
				// 	light.position.set(xVal, 100, zVal)
				// 	scene.add(light)
				// }

				//SO THAT THE MATERIALS DO NOT ALL LOOK THE SAME
				let mat2 = matSphere.clone()

				let cube1 = new THREE.Mesh( sphereGeo, mat2 );
				let cube2 = cube1.clone()

				cube2.geometry.userData.obb = new OBB().fromBox3(
					cube1.geometry.boundingBox
				)

				cube2.userData.obb = new OBB()
				cube2.position.z = floorCopy.position.y+6
				cube2.position.y = ((Math.random()-0.5)*2)*5
				cube2.position.x = ((Math.random()-0.5)*2)*5

				// cube1.rotateZ(10)
				if(map[i+10][j+10] <10 && map[i+10][j+10] > 4){
					// floorCopy.material.color.setRGB(1,0.5,1);
					// const bumpTexture = new THREE.TextureLoader().load('img/earth_bumpmap.jpg')
					floorCopy.material.color.setRGB(0.5,0.5,0.5);
					trackCopy.material.color.setRGB(1,0.5,1);
					// floorCopy.material.wireframe = true
					floorCopy.name = "CHECKPOINT" + map[i+10][j+10];
					// console.log(map[i+10][j+10])
					completedCheckPoints.push(floorCopy.name)
					allCheckPoints.push(floorCopy.name)
					checkpointNum++;
					floorCopy.material.map = texture

					if(map[i+10][j+10] == 5 || map[i+10][j+10] == 8){
						// console.log("ROTATE Z S")
						floorCopy.rotateZ(-Math.PI / 2)
					}

					if(Math.random() <= 0.2){
						let num = Math.random();
						if (num <= 0.3) {
							// cube2.material.colorftm.setRGB(1.0, 0.0, 0.0);
							cube2.material = new THREE.MeshPhongMaterial()
							cube2.material.map = powerupTexture
							cube2.material.bumpMap = powerupTexture
							// cube2.material.bumpScale = 0.1
							cube2.rotation.x = Math.PI/4
							// cube2.rotateX(Math.PI/4)
							cube2.name = "POWERUPINCREASE";
						}
						else if (num <= 0.7) {
							cube2.material.color.setRGB(0.5, 0.5, 0.5);
							cube2.name = "POWERUPSPEED";
						}
						else {
							// const rock = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
							cube2.material.color.setRGB(0.0, 1.0, 0.0);
							cube2.name = "POWERUPDECREASE";
						}
						// console.log("HIHIHI")
					}
					else{
						cube2.material.color.setRGB(1, 1, 0.5)
					}
					floorCopy.add(cube2)
					// cube2.material.color.setRGB(1, 0.5, 0.5)
				}else if(map[i+10][j+10] == 3){
					// floorCopy.material.color.setRGB(1,0.5,0.5);
					trackCopy.material.color.setRGB(1,0.5,0.5);
					// floorCopy.material.wireframe = true
					floorCopy.material.map = finishTexture;
					currentTile = floorCopy;
					floorCopy.name = "ENDING"
					player.position.set(xVal,5,zVal);
					// player.matrix.set(xVal, 5, zVal);
					startX = xVal;
					startZ = zVal;

					// player.matrixAutoUpdate = false;
				}
				else{
					floorCopy.material.color.setRGB(0.5,0.5,0.5);
					floorCopy.material.map = texture
					floorCopy.name = "floor";
					if(map[i+10][j+10] == 2){
						floorCopy.rotateZ(-Math.PI / 2)
					}
					if(Math.random() <= 0.2){
						let num = Math.random();
						if (num <= 0.3) {
							// cube2.material.colorftm.setRGB(1.0, 0.0, 0.0);
							cube2.material = new THREE.MeshPhongMaterial()
							cube2.material.map = powerupTexture
							cube2.material.bumpMap = powerupTexture
							// cube2.material.bumpScale = 0.1
							cube2.rotation.x = Math.PI/4
							// cube2.rotateX(Math.PI/4)
							cube2.name = "POWERUPINCREASE";
						}
						else if (num <= 0.7) {
							cube2.material.color.setRGB(0.5, 0.5, 0.5);
							cube2.name = "POWERUPSPEED";
						}
						else {
							// const rock = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
							cube2.material.color.setRGB(0.0, 1.0, 0.0);
							cube2.name = "POWERUPDECREASE";
						}
						// console.log("HIHIHI")
					}
					else{
						cube2.material.color.setRGB(1, 1, 0.5)
					}
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
	// console.log("LENGTH AFTER PT 2:" +  scene.children.length)
	completedCheckPoints.reverse()
}
createMap()

console.log(allCheckPoints)

// completedCheckPoints.reverse()

function deleteMap(){
	let deleteObj = []
	let i = 0;
	// console.log("scene.children after: ");
	// console.log(scene.children);
	// console.log("Length BEOFRE" + scene.children.length)
	scene.children.forEach((obj)=>{
		deleteObj.push(obj)
	})

	deleteObj.forEach((obj)=>{
		scene.remove(obj)
	})

	minimapScene.children.forEach((obj)=>{
		// console.log(obj.name)
		if(obj.name == "track"){
			// console.log(obj.name)
			scene.remove(obj)
		}
	})
	
	// console.log(floors)
	floors = []
}


function createMap2(){
	scene.add(player)
	for (var i = -10; i < 10; i++){
		for(var j = -10; j < 10; j++){
			if(map[i+10][j+10] != 0){
				xVal = 20 * i
				zVal = 20 * j

				const mat = new THREE.MeshPhongMaterial();
	
				let floorCopy2 = new THREE.Mesh(
					floorGeo,
					mat
				)

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

				let trackMatCopy = trackMaterial.clone()

				let trackCopy = new THREE.Mesh(planeForTrack, trackMatCopy)

				trackCopy.name = "track"

				trackCopy.position.y = 500;
				trackCopy.position.x = xVal
				trackCopy.position.z = zVal
				trackCopy.rotateX(-Math.PI/2)
	
				floorCopy2.geometry.userData.obb = new OBB().fromBox3(
					floorCopy2.geometry.boundingBox
				);
				floorCopy2.userData.obb = new OBB();
				let M = new THREE.Matrix4();
				M = rotationMatrixX(-Math.PI/2).multiply(M);
				M = translationMatrix(xVal, -5, zVal).multiply(M);
				floorCopy2.matrix.copy(M)
				floorCopy2.matrixAutoUpdate = false;

				if(j % 5 == 0){
					const light = new THREE.PointLight(0xffffff, 1000)
					light.name = "light";
					light.position.set(xVal, 100, zVal)
					scene.add(light)
				}

				if(map[i+10][j+10] <10 && map[i+10][j+10] > 4){
					floorCopy2.material.color.setRGB(1,0.5,1);
					// const bumpTexture = new THREE.TextureLoader().load('img/earth_bumpmap.jpg')

					trackCopy.material.color.setRGB(1,0.5,1);
					floorCopy2.material.wireframe = true
					floorCopy2.name = "CHECKPOINT" + map[i+10][j+10];
					// console.log(map[i+10][j+10])
					completedCheckPoints.push(floorCopy2.name)
					allCheckPoints.push(floorCopy2.name)
					checkpointNum++;
					// cube2.material.color.setRGB(1, 0.5, 0.5)
				}else if(map[i+10][j+10] == 3){
					player.position.set(xVal,5,zVal);
					floorCopy2.material.color.setRGB(1,0.5,0.5);
					trackCopy.material.color.setRGB(1,0.5,0.5);
					floorCopy2.material.wireframe = true
					currentTile = floorCopy;
					floorCopy2.name = "ENDING"
					player.position.set(xVal,5,zVal);
					// player.matrix.set(xVal, 5, zVal);
					startX = xVal;
					startZ = zVal;
				}else{
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
					floorCopy.add(cube2)
				}

				// if(floorCopy.name != "ENDING"){
				// 	floorCopy.add(cube2)
				// }
				
				scene.add(trackCopy)
				minimapScene.add(trackCopy.clone());
				scene.add(floorCopy2)
				floors.push(floorCopy2)
			}
		}
	}
}

// console.log(floors[5].children[0].material.color.setRGB(1, 0.5, 0.5))

// Adding bounding box to our black box
// const blackCubeBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
// blackCubeBB.setFromObject(cube);

// Adding bounding box to our red box
const playerBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
playerBB.setFromObject(player);

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
			// console.log("hi ho")
			completedCheckPoints.splice(indexToRemove, 1);
		}

		if(obj2.name == "ENDING" && completedCheckPoints.length == 0){
			document.getElementById("lapTimes").innerHTML = ""
			completedCheckPoints = [... allCheckPoints]
			if(prevTime < 0){
				lapTimes.push(elapsedTime+prevTime);
			}else{
				lapTimes.push(elapsedTime-prevTime);
			}
			prevTime = elapsedTime
			// console.log("LAP COMPLETE")
			lapCount++;
			lapTimes.forEach(function(time, index){
				// console.log(index)
				document.getElementById("lapTimes").innerText += `Lap ${index+1}` + `: ${formatTime(time)}s` + '\n'
			})

			completedCheckPoints.reverse()

			// reset currentDeaths
			currentDeaths = 0;
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
	loadGLTF();
	speed = 0;
	speedY = 0;
	player.position.set(startX, 5, startZ);
	dirRotation = -Math.PI/2;
	clock.elapsedTime = 0;
	completedCheckPoints = []
	allCheckPoints = []
	lapTimes = [];
	lapCount = 0;
	prevTime = 0;
	document.getElementById("lapTimes").innerText=""
	deleteMap()
	createMap()
	raceOver = false;
	document.getElementById("Finished").innerHTML = ""
	deaths = 0;
	currentDeaths = 0;
	offset = 0
	console.log(completedCheckPoints)
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event){
	var keyCode= event.keyCode;
	// console.log(keyCode)
	if(currentState != "Start"){
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
				// console.log(player)
				break;
			case 68: //RIGHT (D KEY)
				rSpeed = -0.03;
				break;
			case 83:
				goBackwards = true;
				break;
			case 82:
				// console.log("RESET")
				reset();
				break;
		}
	}
}

document.getElementById('text').addEventListener('input', function() {
	// console.log('Input value changed to:', this.value);
	name = this.value;
	// console.log(name)
});

document.getElementById("SUBMIT").onclick = function() {{
	if(name == ""){

	}else{
		checkDocumentExists(name).then((value) =>{
			if(value){
				console.log("RUNNING")
				const errorMessage = document.getElementById('errorMessage');
        		const container = document.querySelector('.check-in-container');

				errorMessage.classList.add('show');
                // Add shake animation
                container.classList.add('error-shake');
                // Change input border color
                // input.style.borderColor = '#ff4444';
                
                // Remove shake animation after it completes
                setTimeout(() => {
                    container.classList.remove('error-shake');
                }, 500);

			}else{
				console.log("FALSE")
				// addData(name, "");
				document.getElementById("checkin").style.display = "none";
				currentState = "Map1"
			}
		})
	}
	
}
};

document.body.addEventListener('keyup', onKeyUp, false);
function onKeyUp(e) {
	switch(e.keyCode) {
		case 16: // shift
			// console.log("KEY UP")
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
	if(player.position.y < -50){
		return true;
	}
	return false;
}

function updateMinimap() {
	// Update carMarker position based on player's car position
	carMarker.position.x = player.position.x;
	carMarker.position.z = player.position.z;
  
	// Optionally, rotate the marker to match the player’s orientation
	carMarker.rotation.y = player.rotation.y;
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
    let hoursStr = hours.toString().padStart(2, '0');
    let minutesStr = minutes.toString().padStart(2, '0');
    let secondsStr = secs.toString().padStart(2, '0');

	if(hours > 99){
		return '99:99:99';
	}
	if(hours < 0){
		hoursStr = "00"
	}
	if (minutes < 0){
		minutesStr="00"
	}

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

function animate() {
	// Put in animate()

	// requestAnimationFrame(animate);

	if(currentState == "Start"){
		if(bestTimes.length > 0 && update){
			console.log(bestTimes)
			updateleaderboard(bestTimes)

			// document.getElementById("leaderboard").innerHTML += "<div class='leaderboard-title'>Leaderboard</div> " +s + "</div>"
			update = false;
		}
	}
	else{
		// requestAnimationFrame(animate);

		if(raceOver){
			return;
		}

		// if (elapsedTime > delay){
		elapsedTime = Math.floor(clock.getElapsedTime()) + offset;
		document.getElementById("time").innerText = `Time: ${formatTime(elapsedTime)}s`
		
		// track # of deaths
		document.getElementById("deaths").innerText = `Deaths: ${currentDeaths} (Total: ${deaths})`;

		floors.forEach(function (obj, index) {
			if(!touchGround){
				if(touchingGround(player, obj)){
					player.position.y = obj.position.y + 0.74;
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
		// 		if(touchingGround(player, obj)){
		// 			console.log("TOUCHING")
		// 			let M = new THREE.Matrix4();
		// 			M = translationMatrix(0, 0, 0).multiply(M);
		// 			player.matrix.multiply(M);
		// 			player.matrixAutoUpdate = false;
		// 			// player.position.y = obj.position.y + 0.75;
		// 			// fallen = false;
		// 			currentTile = obj;
		// 			// console.log("TOUCHING GROUND")
		// 			// touchingGround = true;
		// 			speedY = 0;
		// 		}
		// 	}
		// })

		if(!touchGround){
			console.log("FALLING")
			speedY -= 0.0098 // 9.8 m/s
			player.position.y += speedY
		}

		if(touchGround){
			if(run){
				wheels.forEach((obj)=>{
					obj.rotateY(-Math.PI/4)
				})
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
				obj2.rotateZ(Math.PI/124)
				if(!collide){
					if(checkCollision(player, obj2) && (obj2.name == "POWERUPDECREASE" || obj2.name == "POWERUPSPEED" || obj2.name == "POWERUPINCREASE")){
						if (obj2.name == "POWERUPSPEED") {
							powerupActivate = true
							timePowerupDuration = elapsedTime + 3;
						}
						else if (obj2.name == "POWERUPDECREASE") {
							offset -= 10;
						}
						else if (obj2.name == "POWERUPINCREASE") {
							offset += 10;
						}
						obj.remove(obj2)
					}
					else if(checkCollision(player, obj2)){
						let speedX2 = Math.sin(rotation) * (speed-0.3);
						let speedZ2 = Math.cos(rotation) * (speed-0.3);
						if(speedX2 < 0){
							player.position.x -= (speedX2);
						}
						else if (speedX2 > 0) {
							player.position.x -= (speedX2);
						}
						if(speedZ2 < 0){
							player.position.z -= (speedZ2);
						}else if (speedZ2 > 0) {
							player.position.z -= (speedZ2);
						}
						speed = 0

					}
				}
			})
		})

		if(!collide){
			player.rotation.y = rotation;
			player.position.z += speedZ;
			player.position.x += speedX;
		}

		if(carMesh){
			carMesh.position.x = player.position.x;
			carMesh.position.y = player.position.y;
			carMesh.position.z = player.position.z;
			carMesh.rotation.y = rotation + Math.PI
			// console.log(carMesh)
			// carMesh.rotaateY(rotation)
		}

		if(outOfBounds()){
			// console.log(currentTile)
			player.position.x = currentTile.position.x;
			player.position.z = currentTile.position.z;
			player.position.y = 15;
			speed = 0;
			powerupActivate = false;
			
			// increment death counters
			deaths++;
			currentDeaths++;
		}

		speed = -speed;

		// Update camera to follow the block
		let MCAM = new THREE.Matrix4()
		// MCAM = rotationMatrixY(rotation)
		// MCAM = translationMatrix(player.position.x + Math.sin(rotation) * 10, 0, player.position.y + 10 , player.position.z + Math.cos(rotation) * 10)
		camera.rotation.y = -rotation;
		camera.position.x = player.position.x + Math.sin(rotation) * 10;
		camera.position.z = player.position.z + Math.cos(rotation) * 10;
		camera.position.y = player.position.y + 10
		camera.lookAt(player.position)
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
			// console.log("FINISH RACE")
			raceOver = true;
			document.getElementById("Finished").innerHTML = "FINISHED" + " <br> " + name + ": " + formatTime(elapsedTime);
			addData(name, elapsedTime);
		}

		if(powerupActivate && timePowerupDuration <= elapsedTime){
			powerupActivate = false;
		}

		touchGround = false;
		collide = false;
	}
}