import * as THREE from 'three'; // Imports the library that we will be using which is the Three.js

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

camera.position.z = 5;
camera.position.y = 5;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event){
	var keyCode= event.keyCode;
	switch(keyCode){
		case 87:
			console.log("HIHI")
			redCube.position.z -=1;
			break;
		case 83: 
			redCube.position.z +=1;
			break;
		case 65:
			console.log("HIHI")
			redCube.position.x -=1;
			break;
		case 68: 
			redCube.position.x +=1;
			break;
	}
}

function animate() {

	// Update camera to follow the block
	camera.position.x = redCube.position.x + 2; // Offset the camera slightly behind the block
	camera.position.y = redCube.position.y + 2; // Offset the camera slightly above the block

	camera.lookAt(redCube)

	renderer.render( scene, camera );

}