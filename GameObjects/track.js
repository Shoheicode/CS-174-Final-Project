import * as THREE from 'three'; // Imports the library that we will be using which is the Three.js

class TrackObject{
    constructor(planeGeo, trackMat){
        this.planeGeo = planeGeo;
        this.trackMat = trackMat;
        this.plane = new THREE.Mesh(this.planeGeo, this.trackMat)
    }

    get plane(){
        return this.plane
    }

    /**
     * @param {Float32Array} x
     */
    set planeX(x){
        this.plane.position.x = x;
    }
}