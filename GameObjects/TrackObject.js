import * as THREE from 'three'; // Imports the library that we will be using which is the Three.js
import { OBB } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { myFunction } from './Start/introduction';
import { addData, checkDocumentExists, getBestLapTimes } from './JSHelperFiles/firebase';
import { updateleaderboard } from './JSHelperFiles/startpage';

class TrackObject {
    trackMaterial;
    planeForTrack;
    plane;
    constructor() {
        this.trackMaterial = new THREE.MeshBasicMaterial({ color: 0x404040 });
        this.planeForTrack = new THREE.PlaneGeometry(20, 20)
        this.plane = new THREE.Mesh(planeForTrack, trackMaterial)
    }

    get TrackMaterial(){
        return this.trackMaterial;
    }
}

export { TrackObject }; // Exports the class so that it can be used in other files