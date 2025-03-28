import * as THREE from 'three'; // Imports the library that we will be using which is the Three.js
import { OBB } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { myFunction } from './Start/introduction';
import { addData, checkDocumentExists, getBestLapTimes } from './JSHelperFiles/firebase';
import { updateleaderboard } from './JSHelperFiles/startpage';
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

// Rotation Matirx around X-axis
function rotationMatrixX(theta) {
    return new THREE.Matrix4().set(
        1, 0, 0, 0,
        0, Math.cos(theta), -Math.sin(theta), 0,
        0, Math.sin(theta), Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

// Rotation Matrix  around Y axis
function rotationMatrixY(theta) {
    return new THREE.Matrix4().set(
        Math.cos(theta), 0, Math.sin(theta), 0,
        0, 1, 0, 0,
        -Math.sin(theta), 0, Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

// Rotation Matrix around Z axis
function rotationMatrixZ(theta) {
	return new THREE.Matrix4().set(
		Math.cos(theta), -Math.sin(theta), 0, 0,
		Math.sin(theta),  Math.cos(theta), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	);
}

//CONSTANTS:

// List of the Game States
let gameState = ["Start", "Level Select", "Map1", "Map2", "Map 3", "Reset", "Testing"]
let currentState = "Start";

// The current map being used in the code
let currentMap = null;

// The clock from THREE.js that helps us keep track of time.
let clock = new THREE.Clock();

// Sets the name for the character that we send to backend
let name = ""

// The starting x and z values for the code
let startX = 0;
let startZ = 0;

// Important for keeping track of laps
let lapCount = 0;
let lapTimes = []

// Elapsed Time and keeps track of the amount of time elapsed in game
let elapsedTime = 0;
let prevTime = 0;
let offset = 0; // for powerup

// For best times from Firebase
let update = true;
let bestTimes = []

// Pausing:
let pause = false;

// Camera Shift
let cameraShift = true;

// Checks if any powerup has been activated
let powerupActivate = false;
let timePowerupDuration = 0;

// interactive items (power-ups and obstacles):
let item;
const items = [];

// init shield powerup
let shieldActivate = false;
let timeShieldDuration = 0;

// init wall powerup
let wallActivate = false;
let timeWallDuration = 0;

// Properties of the car
let speed = 0;
let acceleration = 0.005; // 5 m/s^2
let deacceleration = 0.01;
let maxSpeed = 0.75; // 7.5 m/s
let powerUpSpeed = 1.2;
let dirRotation = -3*Math.PI/2; // Start turn angle
let collide = false;
let speedY = 0;
let raceOver = false;
let rSpeed = 0;
let run = false; // Controls the run time
let brake = false;
let touchGround = true;
let waitTime = 0;

// Asteroid Speeds
let astFast = 0;
let astSlow = 0;

// init death counters
let deaths = 0;
let currentDeaths = 0;

//Scene Code
const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load('/Images/39608.jpg');
// https://wallpaperaccess.com/universe-landscape (where we found the background)

// Sets the background
scene.background = bgTexture;
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.frustumCulled = true // Does not render things not shown by the camera

// Sound Effects
const audListener = new THREE.AudioListener();
camera.add(audListener);
const engineSound = new THREE.Audio(audListener);
const powerUpSound = new THREE.Audio(audListener);
const music = new THREE.Audio(audListener);
const finishSound = new THREE.Audio(audListener);
const audLoader = new THREE.AudioLoader();
// Load sounds
audLoader.load('/Sounds/carStart.mp3', function (buffer) {
    engineSound.setBuffer(buffer);
    engineSound.setLoop(false);
    engineSound.setVolume(0.5);
});
audLoader.load('/Sounds/powerUp.mp3', function (buffer) {
    powerUpSound.setBuffer(buffer);
    powerUpSound.setLoop(false);
    powerUpSound.setVolume(0.5);
});
audLoader.load('/Sounds/ta-da-brass-band-soundroll-1-00-04.mp3', function (buffer) {
    finishSound.setBuffer(buffer);
    finishSound.setLoop(false);
    finishSound.setVolume(0.5);
});
let isSoundLoaded = false;
audLoader.load('/Sounds/spaceMusic.mp3', function (buffer) {
    music.setBuffer(buffer);
    music.setLoop(true);
    music.setVolume(0.4);
	isSoundLoaded = true;
}, undefined, function (error) {
    console.error("Error loading sound file:", error);
});

// Starts background music
function playMusic() {
	if (isSoundLoaded && !music.isPlaying) {
        	music.play();
    	} else if (!isSoundLoaded) {
        	console.log("Sound file is not yet loaded.");
    	}
}


// Power-Up Textures
const speedTexture = textureLoader.load('Images/powerup/powerUp1Texture.png');
const shieldTexture = textureLoader.load('Images/powerup/powerUp2TextureGold.png');
const wallPowTexture = textureLoader.load('Images/powerup/powerUp2Texture.png');

// Power Up Materials
const speedMat = new THREE.MeshBasicMaterial({ 
	map: speedTexture,
	transparent: true,
	opacity: 0.8
});
const shieldMat = new THREE.MeshBasicMaterial({ 
	map: shieldTexture,
	transparent: true,
	opacity: 0.8
});

const wallPowMat = new THREE.MeshBasicMaterial({ 
	map: wallPowTexture,
	transparent: true,
	opacity: 0.8
});

const timeIncTexture = textureLoader.load('/Images/powerup/powerUp2Texture.png');
const timeDecTexture = textureLoader.load('/Images/powerup/powerUp2Texture.png');

// Finish Line Texture
const finishTexture = textureLoader.load('/Images/finishline.jpg');

finishTexture.wrapS = THREE.RepeatWrapping;
finishTexture.wrapT = THREE.RepeatWrapping;
finishTexture.repeat.set(1, 1);
// https://www.istockphoto.com/bot-wall?returnUrl=%2Fphotos%2Ffinish-line (Where we got finishline texture)

// Creates the car mesh
let carMesh;
let carChoice = '/Models/car.glb'
let carPlayer = ""

function loadGLTF() {
	let carLoader = new GLTFLoader();
	
	carLoader.load(carChoice, (gltf) => {
		carMesh = gltf.scene;
        carMesh.scale.set(1, 1, 1);
        scene.add(carMesh)
	});

	if (carMesh) {
		scene.remove(carMesh);
		carMesh.traverse((child) => {
			if (child.geometry) child.geometry.dispose(); // Delete old car
			if (child.material) {
				if (Array.isArray(child.material)) {
					child.material.forEach((mat) => mat.dispose());
				} else {
					child.material.dispose(); // delete material
				}
			}
		});
	}
	
}

// Orthongraphic Camera for minimap camera
const minimapCamera = new THREE.OrthographicCamera(
	-50, 50, 50, -50, 1, 1000 // Adjust these values based on your track size
);

// Sets the camera position above the texture
minimapCamera.position.set(0, 800, 0); // Position above the track

//Creates the plane for the track for the minimap
const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x404040 });
const planeForTrack = new THREE.PlaneGeometry(20, 20)
const plane = new THREE.Mesh(planeForTrack, trackMaterial)

// Sets the plane position for the track
plane.position.y = 500
plane.rotateX(-Math.PI/2)

const minimapScene = new THREE.Scene();
minimapScene.add(plane.clone());

//Create marker for the car
const carMarkerGeometry = new THREE.SphereGeometry(5, 16, 16);
const carMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const carMarker = new THREE.Mesh(carMarkerGeometry, carMarkerMaterial);
minimapScene.add(carMarker);
minimapCamera.lookAt(carMarker.position);

// Create a WebGL renderer for rendering 3D scenes using WebGL.
const renderer = new THREE.WebGLRenderer({ antialias: false });

// Set the size of the rendering area to match the full width and height of the browser window.
// This determines the resolution of the rendering.
renderer.setSize(window.innerWidth, window.innerHeight);

// Set the animation loop function for the renderer.
// This function, `animate`, will be called repeatedly to update and render the scene.
renderer.setAnimationLoop(animate);

// Append the renderer's output to the document's body.
document.body.appendChild(renderer.domElement);

// Resizes window
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Adds listener to check for resize
window.addEventListener('resize', onWindowResize, true);

// Sphere Geometry
const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
sphereGeo.computeBoundingBox()

// Player Geometry (different from the mesh for the car)
const playerGeo = new THREE.BoxGeometry(1,1,1);
const playerMat = new THREE.MeshBasicMaterial();
const player = new THREE.Mesh(playerGeo, playerMat);
// player.visible = false; // Transparent player
player.position.set(1000,1000,1000)

// Creating the left headlight
const leftHeadlight = new THREE.SpotLight(0xffffff, 20, 0)

leftHeadlight.angle = Math.PI / 6; // Adjust the beam spread
leftHeadlight.penumbra = 0.5; // Soft edges
leftHeadlight.distance = 40; // Maximum distance of light
leftHeadlight.castShadow = true;
player.add(leftHeadlight)
leftHeadlight.position.set(-0.75, 0.65, -1.7);

// Create the right headlight
const rightHeadlight = new THREE.SpotLight(0xffffff, 20, 0)

rightHeadlight.angle = Math.PI / 6; // Adjust the beam spread
rightHeadlight.penumbra = 0.5; // Soft edges
rightHeadlight.distance = 40; // Maximum distance of light
rightHeadlight.castShadow = true;
player.add(rightHeadlight)
rightHeadlight.position.set(0.75, 0.65, -1.7);

// Create targets to follow the spotlights
const leftTarget = new THREE.Object3D();
const rightTarget = new THREE.Object3D();

// Add to the player
player.add(leftTarget, rightTarget);

// Set the targets in front of the car
leftTarget.position.set(-0.75, 0.75, -3); // Extend target forward
rightTarget.position.set(0.75, 0.75, -3);

// Set the left and right headlights to follow the target
leftHeadlight.target = leftTarget
rightHeadlight.target = rightTarget;

// add shield
const shield_geometry = new THREE.PlaneGeometry(4, 4);
const shield_material = new THREE.MeshBasicMaterial({ color: 0x08f7ff });
const shield = new THREE.Mesh(shield_geometry, shield_material);
player.add(shield);
shield.position.set(0.0, 2.0, -3.0);
shield.visible = false;

// create wall geometry/material
const wall_geometry = new THREE.BoxGeometry(20, 4, 0.75);
wall_geometry.computeBoundingBox();
const wall_material = new THREE.MeshBasicMaterial({ color: 0xffffff });
let walls = [];

// create wall texture
const wallTexture = new THREE.TextureLoader().load('/Images/wall.png');

wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(1, 1);

// Updated the boundary box in order to ensure that it includes the entire car
player.geometry.userData.obb = new OBB().fromBox3(
	new THREE.Box3(new THREE.Vector3(-0.75, -0.75, -1.75),new THREE.Vector3(0.75, 0.75, 1.75))
)
player.userData.obb = new OBB()

// Particle Worker
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
	color: 0xffff00, // Yellow
	size: 0.15,
	transparent: true,
	opacity: 0.75,
});

const numParticles = 50;
const position = new Float32Array(numParticles * 3); // x = i, y = i + 1, z = i + 2
const particleSpeed = [];

for (let i = 0; i < numParticles; i++) { // add random positions to each particle
	position[i * 3] = (Math.random() * 2) - 1; // Random position adjustment [-1, 1]
	position[i * 3 + 1] = (Math.random());
	position[i * 3 + 2] = (-Math.random());

	let speed = {
		x: (Math.random() - 0.5) * 0.01,
		y: (Math.random() - 0.5) * 0.01,
		z: (Math.random() - 0.5) * 0.01,
	}
	
	particleSpeed.push(speed);
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3));

function animateParticles() {
	const positions = particlesGeometry.attributes.position.array;
  
	for (let i = 0; i < numParticles; i++) {
		position[i * 3] += particleSpeed[i].x;
		position[i * 3 + 1] += particleSpeed[i].y;
		position[i * 3 + 2] += particleSpeed[i].z;

	  	// Restricts the range of the particles (changes the shape)
	  	if (Math.abs(positions[i * 3]) > 0.5) position[i * 3] = 0.1;
	  	if (positions[i * 3 + 1] > 1) position[i * 3 + 1] = 0.1;
	  	if (Math.abs(positions[i * 3 + 2]) > 1) positions[i * 3 + 2] = 0.1;
	}
  
	particlesGeometry.attributes.position.needsUpdate = true;
  }

// Create the floor geo
const floorGeo = new THREE.BoxGeometry(20, 20, 5);
floorGeo.computeBoundingBox();
floorGeo.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(floorGeo.attributes.uv.array, 2)
);

// -> -x 
// z+
// ^
// |

// Create our 3 maps
let map = [
	["FCLU","FR","FR","DR","FR","FR","FR","FR","IR","C1R","FR","FR","PR","FR","DR","FR","FR","FR","FCUR","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","IF","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES"],
	["DF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FCLU","DR","PR","C2R","FR","FCRD","ES"],
	["IF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["SP","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","C3F","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","IF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["PF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FCLU","DR","FR","FCRD","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FCLU","FR","FR","FCUR","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","DF","ES","ES","FF","ES","ES","PF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["IF","ES","ES","ES","FF","ES","ES","FF","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FCDL","FR","FR","FR","FCRD","ES","ES","FCDL","IR","C4R","FCRD","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
]

let map2 = [
	["FCLU","FR","IR","FR","FCUR","ES","FCLU","FR","C1R","FR","FCUR","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FF","ES","IF","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FF","ES","FF","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FF","ES","FF","ES","ES","ES","DF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FCDL","DR","FCRD","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","C2F","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["DF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["SP","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","IF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["PF","ES","ES","ES","ES","ES","ES","ES","ES","ES","C3F","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","FR","FR","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["IF","ES","ES","ES","ES","ES","ES","ES","ES","ES","PF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FCDL","FR","C4R","FR","FR","FR","FR","DR","FR","FR","FCRD","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
]

let map3 = [
	["FCLU","FR","FR","IR","FCUR","ES","FCLU","FR","C1R","DR","FCUR","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FF","ES","FF","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FF","ES","FF","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","PF","ES","FF","ES","ES","ES","C2F","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["DF","ES","ES","ES","FCDL","FR","FCRD","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FCDL","PR","IR","FR","FR","FR","FR","FCUR","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES"],
	["SP","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","DF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","PF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FCLU","FR","DR","FR","FR","FCUR","ES","FF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","C3F","ES","ES","ES","ES","FF","ES","FF","ES","ES"],
	["IF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","FF","ES","FF","ES","ES"],
	["PF","ES","ES","ES","FCLU","FR","FR","FCUR","ES","ES","PF","ES","ES","ES","ES","FF","ES","IF","ES","ES"],
	["FF","ES","ES","ES","FF","ES","ES","FF","ES","ES","FF","ES","ES","ES","ES","FCDL","FR","FCRD","ES","ES"],
	["FF","ES","ES","ES","FF","ES","ES","FF","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FCDL","FR","C4R","DR","FCRD","ES","ES","FCDL","IR","FR","FCRD","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
]

// Sets the current tile for our game to keep track when player falls off
let currentTile = null;

// Helps keep track of all the floors when checking collisions on each floor
let floors = []
// Helps keep track of all powerup floors
let powerUpsFloors = []

// Holds/keeps tracks of the completed checkpoint
let completedCheckPoints = []
let allCheckPoints = []

// Sets the xVal and zVal that will help set up our code later on
let xVal = 0;
let zVal = 0;

// create the first floor that will be used for everything
let floorCopy = new THREE.Mesh(
	floorGeo,
	new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true })
)

// Import the floor texture from the map
const floorTexture = new THREE.TextureLoader().load('/Images/road/road.png');

// Import the rock texture from the assets
const rockTexture = new THREE.TextureLoader().load('/Images/road/rockmap.png')

floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(1, 1);

rockTexture.wrapS = THREE.RepeatWrapping;
rockTexture.wrapT = THREE.RepeatWrapping;
rockTexture.repeat.set(1, 1);

const mat = new THREE.MeshPhongMaterial();
mat.castShadow = false;
mat.receiveShadow = false;

let matSphere = new THREE.MeshPhongMaterial();
let createMapB = false;

function createMap(mapGiven){
	player.rotation.y = Math.PI/2;
	scene.add(player)
	loadGLTF();
	const light = new THREE.PointLight(0xffffff, 2, 0, 0.0001)
	light.name = "light";
	light.position.set(0, 10000000, 0)
	scene.add(light);
	for (var i = -10; i < 10; i++){
		for(var j = -10; j < 10; j++){
			if(mapGiven[i+10][j+10] != "ES" && mapGiven[i+10][j+10] != "LL"){
				xVal = 20 * i
				zVal = 20 * j

				// Create the floor mesh
				let floorCopy = new THREE.Mesh(
					floorGeo,
					mat
				)
				
				// Update the track mat copy
				let trackMatCopy = trackMaterial.clone()

				let trackCopy = new THREE.Mesh(planeForTrack, trackMatCopy)

				trackCopy.name = "track"

				// Doing the matrix multiplication for the track for the minimap
				let M = new THREE.Matrix4();
				M = rotationMatrixX(-Math.PI/2).multiply(M);
				M = translationMatrix(xVal, 500, zVal).multiply(M);
				trackCopy.matrix.copy(M)
				trackCopy.matrixAutoUpdate = false;

				// Create the OBB for the geometry
				floorCopy.geometry.userData.obb = new OBB().fromBox3(
					floorCopy.geometry.boundingBox
				)
				floorCopy.userData.obb = new OBB();

				// sets the position to the floor
				floorCopy.position.y = -5
				floorCopy.position.x = xVal
				floorCopy.position.z = zVal
				floorCopy.rotateX(-Math.PI / 2)

				// create the variables to store the materials and the powerup/asteroids
				let mat2;
				let cube1;

				//SO THAT THE MATERIALS DO NOT ALL LOOK THE SAME
				// DO NOT SPAWN block at starting point
				if(mapGiven[i+10][j+10] != "SP"){
					mat2 = matSphere.clone()

					cube1 = new THREE.Mesh( sphereGeo, mat2 );
					item = cube1.clone()

					item.geometry.userData.obb = new OBB().fromBox3(
						cube1.geometry.boundingBox
					)

					item.userData.obb = new OBB()
					item.position.z = floorCopy.position.y+6+2.5
					item.position.y = ((Math.random()-0.5)*2)*5
					item.position.x = ((Math.random()-0.5)*2)*5
				}

				if(mapGiven[i+10][j+10] =="C1R" || mapGiven[i+10][j+10] =="C1F" || mapGiven[i+10][j+10] =="C2R" || 
					mapGiven[i+10][j+10] == "C2F" || mapGiven[i+10][j+10] =="C3R" || mapGiven[i+10][j+10] =="C3F" || 
					mapGiven[i+10][j+10] == "C4R" || mapGiven[i+10][j+10] =="C4F"){

					trackCopy.material.color.setRGB(1,0.5,1);
					floorCopy.name = mapGiven[i+10][j+10];
					completedCheckPoints.push(floorCopy.name)
					allCheckPoints.push(floorCopy.name)
					floorCopy.material.normalMap = floorTexture;
					floorCopy.material.color.setRGB(64/255, 64/255, 64/255);
					
					if(mapGiven[i+10][j+10].at(2) == "R"){
						//Rotates the floor
						floorCopy.rotateZ(-Math.PI / 2)
						// create walls
						let wall = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall);
						// set left wall
						wall.rotation.y = Math.PI/2;
						wall.position.set(xVal-10.0,-0.5,zVal);
						let wall2 = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall2);
						// set right wall
						wall2.rotation.y = Math.PI/2;
						wall2.position.set(xVal+10.0,-0.5,zVal);
						// add walls to walls array
						walls.push(wall);
						walls.push(wall2);
						// change name
						wall.name = "U";
						wall2.name = "D";
						// set to invisible
						wall.visible = false;
						wall2.visible = false;
						// set wall texture
						wall.material.map = wallTexture;
						wall2.material.map = wallTexture;
						// set up OBB
						wall.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall.userData.obb = new OBB();
						wall2.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall2.userData.obb = new OBB();
					}
					else {
						// create walls
						let wall = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall);
						// set left wall
						wall.position.set(xVal,-0.5,zVal-10.0);
						let wall2 = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall2);
						// set right wall
						wall2.position.set(xVal,-0.5,zVal+10.0);
						// add walls to walls array
						walls.push(wall);
						walls.push(wall2);
						// change name
						wall.name = "L";
						wall2.name = "R";
						// set to invisible
						wall.visible = false;
						wall2.visible = false;
						// set wall texture
						wall.material.map = wallTexture;
						wall2.material.map = wallTexture;
						// set up OBB	
						wall.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall.userData.obb = new OBB();
						wall2.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall2.userData.obb = new OBB();
					}
					
					item.material.normalMap = rockTexture;
					item.material.color.setRGB(1, 1, 0.5)
				
					floorCopy.add(item)

				}else if(mapGiven[i+10][j+10] == "SP"){
					trackCopy.material.color.setRGB(1,0.5,0.5);
					floorCopy.material = new THREE.MeshPhongMaterial();
					floorCopy.castShadow = false;
					floorCopy.receiveShadow = false;
					floorCopy.material.map = finishTexture;
					currentTile = floorCopy;
					floorCopy.name = "ENDING"
					startX = xVal;
					startZ = zVal;

					
					// create walls
					let wall = new THREE.Mesh(wall_geometry, wall_material);
					scene.add(wall);
					// set left wall
					wall.position.set(xVal,-0.5,zVal-10.0);
					let wall2 = new THREE.Mesh(wall_geometry, wall_material);
					scene.add(wall2);
					// set right wall
					wall2.position.set(xVal,-0.5,zVal+10.0);
					// add walls to walls array
					walls.push(wall);
					walls.push(wall2);
					// change name
					wall.name = "L";
					wall2.name = "R";
					// set to invisible
					wall.visible = false;
					wall2.visible = false;
					// set wall texture
					wall.material.map = wallTexture;
					wall2.material.map = wallTexture;
					// set up OBB
					wall.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
					wall.userData.obb = new OBB();
					wall2.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
					wall2.userData.obb = new OBB();
					
					// player.matrixAutoUpdate = false;
				}
				else if(mapGiven[i+10][j+10] == "PF" || mapGiven[i+10][j+10] == "PR"){
					floorCopy.material.normalMap = floorTexture;
					floorCopy.material.color.setRGB(64/255, 64/255, 64/255);
					floorCopy.name = "powerupFloor";
					if(mapGiven[i+10][j+10] == "PR"){
						floorCopy.rotateZ(-Math.PI / 2)
						
						// create walls
						let wall = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall);
						// set left wall
						wall.rotation.y = Math.PI/2;
						wall.position.set(xVal-10.0,-0.5,zVal);
						let wall2 = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall2);
						// set right wall
						wall2.rotation.y = Math.PI/2;
						wall2.position.set(xVal+10.0,-0.5,zVal);
						// add walls to walls array
						walls.push(wall);
						walls.push(wall2);
						// change name
						wall.name = "U";
						wall2.name = "D";
						// set to invisible
						wall.visible = false;
						wall2.visible = false;
						// set wall texture
						wall.material.map = wallTexture;
						wall2.material.map = wallTexture;
						// set up OBB
						wall.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall.userData.obb = new OBB();
						wall2.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall2.userData.obb = new OBB();
						
					}
					else {
						
						// create walls
						let wall = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall);
						// set left wall
						wall.position.set(xVal,-0.5,zVal-10.0);
						let wall2 = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall2);
						// set right wall
						wall2.position.set(xVal,-0.5,zVal+10.0);
						// add walls to walls array
						walls.push(wall);
						walls.push(wall2);
						// change name
						wall.name = "L";
						wall2.name = "R";
						// set to invisible
						wall.visible = false;
						wall2.visible = false;
						// set wall texture
						wall.material.map = wallTexture;
						wall2.material.map = wallTexture;
						// set up OBB	
						wall.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall.userData.obb = new OBB();
						wall2.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall2.userData.obb = new OBB();	
						
					}

					if(carPlayer == "nova"){
						item.material = speedMat.clone();
						item.name = "POWERUPSPEED";
					}
					else if(carPlayer == "zenith"){
						item.material = shieldMat.clone();
						item.name = "POWERUPSHIELD";
					}
					else if(carPlayer == "flux"){
						item.material = wallPowMat;
						item.name = "POWERUPWALL";
					}
					floorCopy.add(item)
					items.push(item);
					powerUpsFloors.push(floorCopy);
				}
				else if(mapGiven[i+10][j+10][0] == 'D' || mapGiven[i+10][j+10][0] == 'I'){ 
					floorCopy.material.normalMap = floorTexture;
					floorCopy.material.color.setRGB(64/255, 64/255, 64/255);
					if(mapGiven[i+10][j+10][1] == 'R'){
						floorCopy.rotateZ(-Math.PI / 2)
						// create walls
						
						let wall = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall);
						// set left wall
						wall.rotation.y = Math.PI/2;
						wall.position.set(xVal-10.0,-0.5,zVal);
						let wall2 = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall2);
						// set right wall
						wall2.rotation.y = Math.PI/2;
						wall2.position.set(xVal+10.0,-0.5,zVal);
						// add walls to walls array
						walls.push(wall);
						walls.push(wall2);
						// change name
						wall.name = "U";
						wall2.name = "D";
						// set to invisible
						wall.visible = false;
						wall2.visible = false;
						// set wall texture
						wall.material.map = wallTexture;
						wall2.material.map = wallTexture;
						// set up OBB
						wall.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall.userData.obb = new OBB();
						wall2.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall2.userData.obb = new OBB();
						
					}
					else {
						
						// create walls
						let wall = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall);
						// set left wall
						wall.position.set(xVal,-0.5,zVal-10.0);
						let wall2 = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall2);
						// set right wall
						wall2.position.set(xVal,-0.5,zVal+10.0);
						// add walls to walls array
						walls.push(wall);
						walls.push(wall2);
						// change name
						wall.name = "L";
						wall2.name = "R";
						// set to invisible
						wall.visible = false;
						wall2.visible = false;
						// set wall texture
						wall.material.map = wallTexture;
						wall2.material.map = wallTexture;
						// set up OBB	
						wall.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall.userData.obb = new OBB();
						wall2.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall2.userData.obb = new OBB();	
						
					}
					if (mapGiven[i+10][j+10][0] == 'D') {
						item.material = new THREE.MeshBasicMaterial();
						item.material.map = timeDecTexture;
						item.name = "POWERUPDECREASE";
						item.material.color.setRGB(0.0, 0.0, 1.0);
						floorCopy.name = "timeDecFloor";
					}
					else if (mapGiven[i+10][j+10][0] == 'I') {
						item.material = new THREE.MeshBasicMaterial();
						item.name = "POWERUPINCREASE";
						item.material.color.setRGB(1.0, 0.0, 0.0);
						item.material.map = timeIncTexture;
						floorCopy.name = "timeIncFloor";
					}
					floorCopy.add(item)
					powerUpsFloors.push(floorCopy);
				}
				else{
					floorCopy.material.normalMap = floorTexture;
					// floorCopy.material.normalScale = 0.1
					floorCopy.material.color.setRGB(64/255, 64/255, 64/255);
					floorCopy.name = "floor" + (i+10) + "," + (j+10);
					if(mapGiven[i+10][j+10] == "FR"){
						floorCopy.rotateZ(-Math.PI / 2)
						
						// create walls
						let wall = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall);
						// set left wall
						wall.rotation.y = Math.PI/2;
						wall.position.set(xVal-10.0,-0.5,zVal);
						let wall2 = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall2);
						// set right wall
						wall2.rotation.y = Math.PI/2;
						wall2.position.set(xVal+10.0,-0.5,zVal);
						// add walls to walls array
						walls.push(wall);
						walls.push(wall2);
						// change name
						wall.name = "U";
						wall2.name = "D";
						// set to invisible
						wall.visible = false;
						wall2.visible = false;
						// set wall texture
						wall.material.map = wallTexture;
						wall2.material.map = wallTexture;
						// set up OBB
						wall.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall.userData.obb = new OBB();
						wall2.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall2.userData.obb = new OBB();
						
					}
					else if (mapGiven[i+10][j+10] == "FF") {
						
						// create walls
						let wall = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall);
						// set left wall
						wall.position.set(xVal,-0.5,zVal-10.0);
						let wall2 = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall2);
						// set right wall
						wall2.position.set(xVal,-0.5,zVal+10.0);
						// add walls to walls array
						walls.push(wall);
						walls.push(wall2);
						// change name
						wall.name = "L";
						wall2.name = "R";
						// set to invisible
						wall.visible = false;
						wall2.visible = false;
						// set wall texture
						wall.material.map = wallTexture;
						wall2.material.map = wallTexture;
						// set up OBB	
						wall.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall.userData.obb = new OBB();
						wall2.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall2.userData.obb = new OBB();	
						
					}
					else if (mapGiven[i+10][j+10].startsWith("FC")) {
						
						// create walls
						let wall = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall);
						let wall2 = new THREE.Mesh(wall_geometry, wall_material);
						scene.add(wall2);
						// set first wall
						switch(mapGiven[i+10][j+10][2]) {
							case 'L':
								wall.position.set(xVal,-0.5,zVal-10.0);
								wall.name = "L";
								break;
							case 'R':
								wall.position.set(xVal,-0.5,zVal+10.0);
								wall.name = "R";
								break;
							case 'U':
								wall.rotation.y = Math.PI/2;
								wall.position.set(xVal-10.0,-0.5,zVal);
								wall.name = "U";
								break;
							case 'D':
								wall.rotation.y = Math.PI/2;
								wall.position.set(xVal+10.0,-0.5,zVal);
								wall.name = "D";
								break;
						}
						// set second wall
						switch(mapGiven[i+10][j+10][3]) {
							case 'L':
								wall2.position.set(xVal,-0.5,zVal-10.0);
								wall2.name = "L";
								break;
							case 'R':
								wall2.position.set(xVal,-0.5,zVal+10.0);
								wall2.name = "R";
								break;
							case 'U':
								wall2.rotation.y = Math.PI/2;
								wall2.position.set(xVal-10.0,-0.5,zVal);
								wall2.name = "U";
								break;
							case 'D':
								wall2.rotation.y = Math.PI/2;
								wall2.position.set(xVal+10.0,-0.5,zVal);
								wall2.name = "D";
								break;
						}
						// add walls to walls array
						walls.push(wall);
						walls.push(wall2);
						// set invisible
						wall.visible = false;
						wall2.visible = false;
						// set wall texture
						wall.material.map = wallTexture;
						wall2.material.map = wallTexture;
						// set up OBB
						wall.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall.userData.obb = new OBB();
						wall2.geometry.userData.obb = new OBB().fromBox3(wall.geometry.boundingBox);
						wall2.userData.obb = new OBB();
						
					}
						// set the cube position 
						item.position.z += 10

						// generates a random numbers
						let num = Math.random()

						// Around 50% of the time it spawns
						if(num >=0.50){
							// Creates the fast asteroid
							item.name = "fast";

							// Creates the particles
							let particles = new THREE.Points(particlesGeometry, particlesMaterial);
							item.add(particles);
							particles.position.z +=2;
							particles.rotation.x = -Math.PI/2;

							// add the cube to the floor
							floorCopy.add(item);
							item.material.normalMap = rockTexture;
							item.material.color.setRGB(1, 1, 0.5);
						}else if (num >=0.20){ // Around 30% of the time is spawns
							// Creates the slow asteroid
							item.name = "slow";

							// Creates the particles
							let particles = new THREE.Points(particlesGeometry, particlesMaterial);
							item.add(particles);
							particles.position.z +=2;
							particles.rotation.x = -Math.PI/2;

							// add the cube to the floor
							floorCopy.add(item);
							item.material.normalMap = rockTexture;
							item.material.color.setRGB(1, 1, 0.5);
						}else{ // Around of 20% of the time nothing happens
							if (item.geometry) {
								item.geometry.dispose();
							}
							
						}
				}

				minimapScene.add(trackCopy);
				floors.push(floorCopy)
				scene.add(floorCopy)
				// floorCopy.needsUpdate = false
			}
		}
	}

	// Reverse the order for the map (sort the map to keep track of the things)
	completedCheckPoints.sort().reverse()
	allCheckPoints.sort().reverse()
	// Create the map
	createMapB = true;
	// set the player's position
	player.position.set(startX,-1.5,startZ);
}

// Helps remove unecessary meshes to allow prevent data
function disposeMesh(mesh) {
    if (mesh.geometry) {
        mesh.geometry.dispose();
    }

    if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => {
            if (material.map) material.map.dispose();
            if (material.normalMap) material.normalMap.dispose();
            material.dispose();
        });
    } else if (mesh.material) {
        if (mesh.material.map) mesh.material.map.dispose();
        if (mesh.material.normalMap) mesh.material.normalMap.dispose();
        mesh.material.dispose();
    }

	// Removes children from their parents/aka actually deletes unecessary assets/meshs
	mesh.traverse((child) => {
        if (child.isMesh) {
            // Dispose of geometry
            if (child.geometry) {
                child.geometry.dispose();
            }

            // Dispose of material(s)
            if (Array.isArray(child.material)) {
                child.material.forEach((material) => {
                    if (material.map) material.map.dispose();
                    if (material.normalMap) material.normalMap.dispose();
                    // Dispose of other maps if needed
                    material.dispose();
                });
            } else if (child.material) {
                if (child.material.map) child.material.map.dispose();
                if (child.material.normalMap) child.material.normalMap.dispose();
                // Dispose of other maps if needed
                child.material.dispose();
            }
        }
	})

    mesh.parent?.remove(mesh);
    mesh = null; 
}

// Delete the map
function deleteMap(){
	let deleteObjs = []

	// Adds from the scene to delete obj
	scene.children.forEach((obj)=>{
		deleteObjs.push(obj)
	})

	// for each of the delete objects 
	deleteObjs.forEach((obj)=>{
		scene.remove(obj)
		disposeMesh(obj)
	})

	// delete all the obj in mesh
	minimapScene.children.forEach((obj)=>{
		if(obj.name == "track"){
			scene.remove(obj)
			disposeMesh(obj)
		}
	})
	
	// Resets the the floors are empty
	floors = []
}

if(currentState == "Testing"){
	document.getElementById("checkin").style.display = "none";
	currentMap = map;
	reset();
}

function checkCollision(player1, obj2) {
	// Copy the geometry's OBB (Oriented Bounding Box) to the object's user data OBB.
    // This ensures the OBB data is up-to-date with the object's geometry.
	player1.userData.obb.copy(player1.geometry.userData.obb)
    obj2.userData.obb.copy(obj2.geometry.userData.obb)

	// Apply the object's transformation matrix (position, rotation, scale) to its OBB.
    // This adjusts the OBB to match the object's current position and orientation in the world.
    player1.userData.obb.applyMatrix4(player1.matrixWorld)
    obj2.userData.obb.applyMatrix4(obj2.matrixWorld)
    
	// Check if the two OBBs intersect.
	if (player1.userData.obb.intersectsOBB(obj2.userData.obb)) {
		// If a shield is not active, set a global variable `collide` to true.
        // This may be used elsewhere in the code to handle collision events.
		if (!shieldActivate) {
			collide = true;
		}
		// Return true to indicate a collision occurred.
		return true;
    } else {
		// Return false to indicate no collision occurred.
		return false;
    }
 }

 let completedLap = false;

 function playerTouchingGround(player1, obj2) {
	// Copy the geometry's OBB (Oriented Bounding Box) to the object's user data OBB.
    // This ensures the OBB data is up-to-date with the object's geometry.
	player1.userData.obb.copy(player1.geometry.userData.obb)
    obj2.userData.obb.copy(obj2.geometry.userData.obb)

	// Apply the object's transformation matrix (position, rotation, scale) to its OBB.
    // This adjusts the OBB to match the object's current position and orientation in the world.
    player1.userData.obb.applyMatrix4(player1.matrixWorld)
    obj2.userData.obb.applyMatrix4(obj2.matrixWorld)

	// Check if the two OBBs intersect.
    if (player1.userData.obb.intersectsOBB(obj2.userData.obb)) {
		// Checks if the player is touching the ground

		// Only removes if the index matches the first in the list of completed checkpoints
		const indexToRemove = completedCheckPoints.indexOf(obj2.name);
		if (indexToRemove == 0) {
			completedCheckPoints.splice(indexToRemove, 1);
		}

		// If reaches the ending and completed check points are empty
		if(obj2.name == "ENDING" && completedCheckPoints.length == 0){
			// Set the laptimes to be empty
			document.getElementById("lapTimes").innerHTML = ""

			// Resest the completed checkpoints
			completedCheckPoints = [... allCheckPoints];

			// Used to keep track of lap times and figure out the lap times between
			if(prevTime < 0){
				lapTimes.push(elapsedTime+prevTime);
			}else{
				lapTimes.push(elapsedTime-prevTime);
			}

			// set the prevTime to elapsedTime
			prevTime = elapsedTime;

			// Has the lapcount increase
			lapCount++;

			// Updates the laptime code
			lapTimes.forEach(function(time, index){
				document.getElementById("lapTimes").innerText += `Lap ${index+1}` + `: ${formatTime(time)}s` + '\n';
			})

			// Completed lap is true
			completedLap = true;

			// reset currentDeaths
			currentDeaths = 0;
		}

		// set touching ground to true and return true if player is touching ground
		touchGround = true;
		return true;
    } else {
		// return false if the player is not touching the ground
		return false;
    }
 }

 // Used to check if asteroids are touching the ground
 function touchingGround(floorT, asteroid) {
	// Copy the geometry's OBB (Oriented Bounding Box) to the object's user data OBB.
    // This ensures the OBB data is up-to-date with the object's geometry.
	floorT.userData.obb.copy(floorT.geometry.userData.obb)
    asteroid.userData.obb.copy(asteroid.geometry.userData.obb)

	// Apply the object's transformation matrix (position, rotation, scale) to its OBB.
    // This adjusts the OBB to match the object's current position and orientation in the world.
    floorT.userData.obb.applyMatrix4(floorT.matrixWorld)
    asteroid.userData.obb.applyMatrix4(asteroid.matrixWorld)

	// Check if the two OBBs intersect.
    if (floorT.userData.obb.intersectsOBB(asteroid.userData.obb)) {
		// return true if touching ground
		return true;
    } else {
		// return false if touching ground
		return false;
    }
 }

 // reset function
function reset(){
	speed = 0;
	speedY = 0;
	player.position.set(1000, 1000, 1000);
	dirRotation = -Math.PI/2;
	clock.elapsedTime = 0;
	completedCheckPoints = []
	allCheckPoints = []
	lapTimes = [];
	lapCount = 0;
	prevTime = 0;
	document.getElementById("lapTimes").innerText=""
	deleteMap()
	createMapB = false;
	createMap(currentMap)
	raceOver = false;
	document.getElementById("Finished").innerHTML = ""
	deaths = 0;
	currentDeaths = 0;
	offset = 0
	powerupActivate = false;
	shieldActivate = false;
	shield.visible = false;
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event){
	var keyCode= event.keyCode;
	if(currentState == "Map1" || currentState == "Map2" || currentState == "Map3"){

		switch(keyCode){
			case 16: //Acceleration (Shift Key)
				run = true;
				brake = false;
				if(speed <= 0.1){
					engineSound.play();
				}
				break;
			case 27: // Esc key
				if(pause){
					clock.start()
					clock.elapsedTime = elapsedTime;
				}
				else{
					clock.stop();
				}
				pause = !pause;
				break;
			case 32: // Space bar
				run = false;
				brake = true;
				break;
			case 49: // One Press
				cameraShift = !cameraShift;
				break;
			case 65: //LEFT (A key)
				rSpeed = 0.03;
				break;
			case 68: //RIGHT (D KEY)
				rSpeed = -0.03;
				break
			case 82: // R button
				reset();
				break;
		}
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
		case 32: // Space bar
			brake = false;
		case 32: // space
			break;
	}
}

// Changing the text based on user input
document.getElementById('text').addEventListener('input', function() {
	name = this.value;
});

// when the submit button is clicked
document.getElementById("SUBMIT").onclick = function() {{
	// Checks if the name is empty
	if(name == ""){

	}else{ // Otherwise, checks if the name is valid
		checkDocumentExists(name).then((value) =>{
			if(value){
				const errorMessage = document.getElementById('errorMessage');
        		const container = document.querySelector('.check-in-container');

				errorMessage.classList.add('show');
                // Add shake animation
                container.classList.add('error-shake');

                setTimeout(() => {
                    container.classList.remove('error-shake');
                }, 500);

			}else{
				document.getElementById("checkin").style.display = "none";
				currentState = "Character Select";
				document.getElementById("bodyContainer2").style.display = "block";
			}
		})
	}
	
}
};

// Checks when the nova button is being pressed
document.getElementById("novaButton").onclick = function() {{
	document.getElementById("bodyContainer2").style.display = "none";
	currentState = "Level Select";
	document.getElementById("bodyContainer").style.display = "flex";
	carChoice = '/Models/car.glb';
	carPlayer = "nova"
}}

// Checks when the zenith button is clicked
document.getElementById("zenithButton").onclick = function() {{
	document.getElementById("bodyContainer2").style.display = "none";
	currentState = "Level Select";
	document.getElementById("bodyContainer").style.display = "flex";
	carChoice = '/Models/carMag.glb';
	carPlayer = "zenith"
}}

// Checks when the flux button is clicked
document.getElementById("fluxButton").onclick = function() {{
	document.getElementById("bodyContainer2").style.display = "none";
	currentState = "Level Select";
	document.getElementById("bodyContainer").style.display = "flex";
	carChoice = '/Models/carTeal.glb';
	carPlayer = "flux"
}}

// Checks when the level 1 button is clicked
document.getElementById("level1").onclick = function() {{
	// Sets up the level 
	currentState="Map1";
	currentMap = map;
	reset();
	document.getElementById("bodyContainer").style.display = "none";
	document.getElementById("leaderboard").style.display="block";

	getBestLapTimes(currentState).then((value) =>{
		bestTimes = value;
	})

	// Starts the clock and starts playing music
	clock.start()
	playMusic();

	// Changing speed based on level (slowest speed)
	astFast = -0.06
	astSlow = 0.03

}}

// Checks when the level 2 button is clicked
document.getElementById("level2").onclick = function() {{
	// Sets up the level 
	currentState="Map2";
	currentMap = map2;
	reset();
	document.getElementById("bodyContainer").style.display = "none";
	document.getElementById("leaderboard").style.display="block";

	getBestLapTimes(currentState).then((value) =>{
		bestTimes = value;
	})

	// Starts the clock and starts playing music
	clock.start()
	playMusic();
	// Changing speed based on level (medium speed)
	astFast = -0.08
	astSlow = 0.05
}}

// Checks when the level 3 button is clicked
document.getElementById("level3").onclick = function() {{
	// Sets up the level 
	currentState="Map3";
	currentMap = map3;
	reset();
	document.getElementById("bodyContainer").style.display = "none";
	document.getElementById("leaderboard").style.display="block";

	getBestLapTimes(currentState).then((value) =>{
		bestTimes = value;
	})
	
	// Starts the clock and starts playing music
	clock.start()
	playMusic();
	// Changing speed based on level (fastest speed)
	astFast = -0.1
	astSlow = 0.07
}}

// Runs when the home btn is presseds on pause screen
document.getElementById("HOMEBTN").onclick = function(){{
	// changes the current state and then activates and resets everything
	currentState = "Start";
	document.getElementById("checkin").style.display = "block";
	document.getElementById("pauseScreen").style.display = "none";
	document.getElementById("lapTimes").innerHTML = ""
	document.getElementById("deaths").innerHTML = ""
	document.getElementById("Finished").innerHTML = "";
	document.getElementById("leaderboard").style.display = "none";
	document.getElementById("time").innerText = "";
	pause = false;
	music.stop()
}}

// Runs when the level select btn is presseds on pause screen
document.getElementById("LEVELSELECT").onclick = function(){{
	// changes the current state and then activates and resets everything
	currentState = "Level Select";
	document.getElementById("bodyContainer").style.display = "flex";
	document.getElementById("pauseScreen").style.display = "none";
	document.getElementById("lapTimes").innerHTML = ""
	document.getElementById("deaths").innerHTML = ""
	document.getElementById("Finished").innerHTML = "";
	document.getElementById("leaderboard").style.display = "none";
	document.getElementById("time").innerText = "";
	pause = false;
	music.stop()
}}

// Runs when the character select btn is presseds on pause screen
document.getElementById("CHARACTER").onclick = function(){{
	// changes the current state and then activates and resets everything
	currentState = "Level Select";
	document.getElementById("bodyContainer2").style.display = "block";
	document.getElementById("pauseScreen").style.display = "none";
	document.getElementById("lapTimes").innerHTML = ""
	document.getElementById("deaths").innerHTML = ""
	document.getElementById("Finished").innerHTML = "";
	document.getElementById("leaderboard").style.display = "none";
	document.getElementById("time").innerText = "";
	pause = false;
	music.stop()
}}

// Checks if the player's position is out of bounds
function outOfBounds(){
	if(player.position.y < -50){
		return true;
	}
	return false;
}

// Updates the mini map position based on the player's position
function updateMinimap() {
	// Update carMarker position based on player's car position
	carMarker.position.x = player.position.x;
	carMarker.position.z = player.position.z;
  
	// Optionally, rotate the marker to match the player’s orientation
	carMarker.rotation.y = player.rotation.y;
	carMarker.position.y = 500
}

// Code to help format the time
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

// exports to be use in update start page
export {formatTime}

// Animate function
function animate() {
	// Checks if the code is currently in any of these states and to do nothing in those cases
	if(currentState == "Start" || currentState == "Level Select" || currentState == "Character Select"){

	}
	else{
		if(pause){ // if pause, display pause screen
			document.getElementById("pauseScreen").style.display = "flex";
		}
		else{ // if not pause
			// animate the particles
			animateParticles()
			// set the display of the pause screen to none
			document.getElementById("pauseScreen").style.display = "none";

			// Update the leaderboard with the best times
			if(bestTimes.length > 0 && update){
				// update the leaderboard and only update the leaderboard once at the start of the race
				updateleaderboard(bestTimes);
				update = false;
			}

			// Get time from clock.getElapsedTime to be used later on in code and to not take into account offset
			let time = clock.getElapsedTime();
			elapsedTime = Math.floor(time) + offset;
			document.getElementById("time").innerText = `Time: ${formatTime(elapsedTime)}s`

			// Checks if we the race is over and if so, run the finish line screen
			if(raceOver){
				elapsedTime = Math.floor(time) + offset;
				if(elapsedTime > waitTime){ // waits 3 seconds before showing going back to the character select screen and reset all elements
					document.getElementById("bodyContainer").style.display = "flex";
					document.getElementById("Finished").innerHTML = "";
					document.getElementById("pauseScreen").style.display = "none";
					document.getElementById("lapTimes").innerHTML = ""
					document.getElementById("deaths").innerHTML = ""
					document.getElementById("leaderboard").style.display = "none";
					document.getElementById("time").innerText = "";
					lapCount = 0;
					currentState = "Level Select"
					raceOver = false;
					bestTimes = []
					document.getElementById("leaderboard").innerHTML = "";
					update = true
					music.stop()
				}
				return;
			}
			
			// track # of deaths
			document.getElementById("deaths").innerText = `Deaths: ${currentDeaths} (Total: ${deaths})`;

			// Go through each of the floors
			floors.forEach(function (obj, index) {
				if(!touchGround){ // If not touching the ground
					if(playerTouchingGround(player, obj)){ // check if they are touching the floors/ground
						if(player.position.y < obj.position.y + 2.5){ // if going at it from the side or below, don't allow character to go onto the platform
							collide = true;
							touchGround = false;
							speedX = 0;
							speedZ = 0;
							speed = 0;
						}
						else{ // Otherwise
							player.position.y = obj.position.y + 0.74+2.5; // puts the player up
							currentTile = obj; //set the current tile as the current obj they are on
							speedY = 0;
						}
					}
				}
			})

			// If a lap is completed, regenerates power-ups on the floors
			if(completedLap){
				// Go through each floor in the `powerUpsFloors` array
				powerUpsFloors.forEach(function (obj, index) {
					 // Check if the current floor has no child objects (aka no existing power-ups)
					if (obj["children"].length == 0){
						// Clone a base material for the new power-up sphere
						let mat2 = matSphere.clone()

						// Create a new sphere mesh for the power-up
						let cube1 = new THREE.Mesh( sphereGeo, mat2 );

						// Clone the sphere mesh to create a new instance
						let item = cube1.clone()

						// Set up Oriented Bounding Box (OBB) for collision detection
						item.geometry.userData.obb = new OBB().fromBox3(
							cube1.geometry.boundingBox
						)

						item.userData.obb = new OBB();

						// Position the power-up randomly around the floor
						item.position.z = obj.position.y+6+2.5;
						item.position.y = ((Math.random()-0.5)*2)*5;
						item.position.x = ((Math.random()-0.5)*2)*5;

						// Assign properties and material based on the name of the powerup and the character
						if(obj.name.startsWith("powerup")) {
							// Handle different player cars and assign corresponding power-up
							if(carPlayer == "nova"){
								item.material = speedMat;
								item.name = "POWERUPSPEED";
							}
							else if(carPlayer == "zenith"){
								item.material = shieldMat;
								item.name = "POWERUPSHIELD";
							}
							else if(carPlayer == "flux"){
								item.material = wallPowMat;
								item.name = "POWERUPWALL";
							}
						}
						else if (obj.name.startsWith("time")) {
							// Handle time-related power-ups based on floor name
							if (obj.name[4] == 'D') {
								item.material = new THREE.MeshBasicMaterial();
								item.material.map = timeDecTexture;
								item.name = "POWERUPDECREASE";
								item.material.color.setRGB(0.0, 0.0, 1.0);
								floorCopy.name = "timeDecFloor";
							}
							else if (obj.name[4] == 'I') {
								item.material = new THREE.MeshBasicMaterial();
								item.material.map = timeIncTexture;
								item.name = "POWERUPINCREASE";
								floorCopy.name = "timeIncFloor";
							}
						}
						// Add the newly created power-up sphere to the current floor
						obj.add(item);
					}
				})
				completedLap = false;
			}

			// if the player is not touching the ground, check if they are touching the ground. 
			if(!touchGround){
				speedY -= 0.0098 // 9.8 m/s
				player.position.y += speedY
			}

			// If touching the ground, allow the player to move and do all the things
			if(touchGround){
				// If run, move
				if(run){
					if(powerupActivate){
						speed = powerUpSpeed;
					}
					else{
						speed += acceleration;

						// have a max speed
						if(speed > maxSpeed){
							speed = maxSpeed;
						}
					}
				} else{ // if not run, do not move
					powerupActivate = false;
					
					if(brake){
						speed -= deacceleration;
					}
					speed -= acceleration;
					// Prevents speed from going into negative
					if(speed < 0){
						speed = 0;
					}
				}
				dirRotation +=rSpeed;
			}

			// update the speed for the x and z direction
			speed = -speed; 
			var rotation = dirRotation;
			var speedX = Math.sin(rotation) * speed;
			var speedZ = Math.cos(rotation) * speed;

			// Go through each of the floor and update all the elements within the floor like asteroids and powerups
			floors.forEach(function (obj, index) {
				// Loop through each floor object and the objects on the floor
				obj["children"].forEach(function(obj2, index){
					 // If the object is not a POWERUP and is not touching the ground
					if(!obj2.name.startsWith("POWERUP") && !touchingGround(obj2, obj)){
						if(obj2.name =="fast"){
							obj2.position.z -= astFast // Move fast objects faster
						}else{
							obj2.position.z -= astSlow // Move slow objects slower
						}
					}
					// If the object is not a POWERUP and is touching the ground
					else if(!obj2.name.startsWith("POWERUP") && touchingGround(obj2, obj)){
						 // Adjust position for "fast" and "slow" objects
						if(obj2.name =="fast" || obj2.name == "slow"){
							obj2.position.z += 10 // Push objects upwards (or reset position)
						}
					}

					// If they had not collided with something, check if they collided so that it does stack
					if(!collide){
						// Check if the player collides with a POWERUP object
						if(checkCollision(player, obj2) && (obj2.name.startsWith("POWERUP"))) {
							if (obj2.name == "POWERUPSPEED") {
								powerupActivate = true; // Activate speed powerup
                    			timePowerupDuration = elapsedTime + 5; // Set duration
							}
							else if (obj2.name == "POWERUPDECREASE") {
								offset -= 10; // Decrease offset
							}
							else if (obj2.name == "POWERUPINCREASE") {
								offset += 10; // Increase offset
							}
							else if (obj2.name == "POWERUPSHIELD") {
								// activate shield
								shieldActivate = true;
								shield.visible = true; // Make shield visible
								timeShieldDuration = elapsedTime + 5; // Set shield duration
							}
							else if (obj2.name == "POWERUPWALL") {
								wallActivate = true; // Activate wall powerup
								// Make walls visible and set their duration
								for (let i = 0; i < walls.length; i++) {
									walls[i].visible = true;
									timeWallDuration = elapsedTime + 10;
								}
							}

							// Remove the POWERUP object and play sound
							obj.remove(obj2)
							powerUpSound.play();
						}
						// If the player collides with a non-POWERUP object
						else if(checkCollision(player, obj2) && createMapB){
							// If the shield is not active
							if (!shieldActivate) {
								if(obj2.name =="fast" || obj2.name =="slow"){
									// Reset player's position and deactivate powerups conditions
									player.position.x = currentTile.position.x;
									player.position.z = currentTile.position.z;
									player.position.y = -1.5;
									speed = 0;
									// deactivate powerups
									powerupActivate = false;
									shieldActivate = false;
									shield.visible = false;

									obj2.position.z += 10; // reset the object position
								} else{
									// Handle collisions with other objects
									let speedX2 = Math.sin(rotation) * (speed-0.3);
									let speedZ2 = Math.cos(rotation) * (speed-0.3);
									if(speedX2 < 0){
										player.position.x -= (speedX2); // Adjust player's X position
									}
									else if (speedX2 > 0) {
										player.position.x -= (speedX2); // Adjust player's X position
									}
									if(speedZ2 < 0){
										player.position.z -= (speedZ2); // Adjust player's X position
									}else if (speedZ2 > 0) {
										player.position.z -= (speedZ2); // Adjust player's X position
									}
									speed = 0; // Stop player movement
								}
							}
						}
					}
				})
			})

			// Check if they collide and if not update the position with speed
			if(!collide){
				player.rotation.y = rotation;
				player.position.z += speedZ;
				player.position.x += speedX;
			}

			// Check is the car mesh exists and if so, update the position
			if(carMesh){
				carMesh.position.x = player.position.x;
				carMesh.position.y = player.position.y-0.25;
				carMesh.position.z = player.position.z;
				carMesh.rotation.y = rotation + Math.PI
			}

			// Check if the wall activate and if so, update player position if colliding with wall
			if (wallActivate) {
				for (let i = 0; i < walls.length; i++) {
					if (checkCollision(player, walls[i])) { // Changes the directions based on which wall they collide with
						let speedX2 = Math.sin(rotation) * (speed-0.5);
						let speedZ2 = Math.cos(rotation) * (speed-0.5);
						if ((walls[i].name == "U" && player.position.x - speedX2 > walls[i].position.x) || (walls[i].name == "D" && player.position.x - speedX2 < walls[i].position.x)) {
							player.position.x -= (speedX2);
							player.position.z -= (speedZ2);
						}
						else if (walls[i].name == "U" || walls[i].name == "D") {
							player.position.x += (speedX2);
							player.position.z -= (speedZ2);
						}
						if ((walls[i].name == "L" && player.position.z - speedZ2 > walls[i].position.z) || (walls[i].name == "R" && player.position.z - speedZ2 < walls[i].position.z)) {
							player.position.x -= (speedX2);
							player.position.z -= (speedZ2);
						}
						else if (walls[i].name == "L" || walls[i].name == "R") {
							player.position.x -= (speedX2);
							player.position.z += (speedZ2);
						}
						speed = 0;
					}
				}
			}

			// Make each of the powerups float up and down
			items.forEach((item) => {
        		if (item && (item.name == "POWERUPSPEED" || item.name == "POWERUPSHIELD" || item.name == "POWERUPWALL")) {
            			item.position.z = Math.sin(time * (2 * Math.PI * 1.0 / 2.0)) * 0.5 + 4.5; // Power-ups float up and down
        		}
    		});

			// If goes out of bounds
			if(outOfBounds()){
				player.position.x = currentTile.position.x;
				player.position.z = currentTile.position.z;
				player.position.y = -1.5;
				speed = 0;
				// deactivate powerups
				powerupActivate = false;
				shieldActivate = false;
				shield.visible = false;
				
				// increment death counters
				deaths++;
				currentDeaths++;
				offset+=5
			}

			// update the spped
			speed = -speed;

			// Update the camera shift and allow for the shift to happen if button 1 is pressed
			if(cameraShift){
				camera.rotation.y = -rotation;
				camera.position.x = player.position.x + Math.sin(rotation) * 10;
				camera.position.z = player.position.z + Math.cos(rotation) * 10;
				camera.position.y = player.position.y + 10
				camera.lookAt(player.position)
			} else{
				camera.rotation.y = -rotation;
				camera.position.x = player.position.x;
				camera.position.z = player.position.z;
				camera.position.y = player.position.y+3;
				let lookPos = new THREE.Vector3(Math.sin(rotation) * -4, 0, Math.cos(rotation) * -4); // creates the new position to look at
				let copyPos = player.position.clone(); 
				let newPos = lookPos.add(copyPos); // look at that position ahead

				camera.lookAt(newPos)
			}

			// update the renderer
			renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
			renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
			renderer.setScissorTest(true);
			renderer.render( scene, camera );

			updateMinimap()

			// adding the mini map in the corner
			const minimapSize = 200;
			renderer.setViewport(window.innerWidth - minimapSize - 10, 10, minimapSize, minimapSize);
			renderer.setScissor(window.innerWidth - minimapSize - 10, 10, minimapSize, minimapSize);
			renderer.setScissorTest(true);

			// sets the minimap camera position
			minimapCamera.position.set(
				carMarker.position.x,
				800,
				carMarker.position.z,
			)

			// have the minimap camera to look at the car marker position
			minimapCamera.lookAt(carMarker.position);

			// add the mini map scene and camera to the render
			renderer.render(minimapScene, minimapCamera);

			//Checks if the player completed all the laps
			if(lapCount == 3){
				raceOver = true;
				waitTime = elapsedTime+3;
				
				document.getElementById("Finished").innerHTML = "FINISHED" + " <br> " + name + ": " + formatTime(elapsedTime);
				addData(name, currentState, elapsedTime);
				finishSound.play()
			}

			// Check powerup activate and if the time powerup duration is less than the elapsed time and deactivate if it does
			if(powerupActivate && timePowerupDuration <= elapsedTime){
				powerupActivate = false;
			}

			// turn off shield if time reached
			if(shieldActivate && timeShieldDuration <= elapsedTime){
				shieldActivate = false;
				shield.visible = false;
			}

			// turn off walls if time reached
			if(wallActivate && timeWallDuration <= elapsedTime){
				wallActivate = false;
				for (let i = 0; i < walls.length; i++) {
					walls[i].visible = false;
				}
			}

			touchGround = false; // set touchGround to false
			collide = false; // set collide to false
			renderer.info.autoReset = true; // Automatically handle out-of-view rendering

		}
	}
}
