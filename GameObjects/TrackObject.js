class TrackObject {
    constructor() {
        this.trackMaterial = new THREE.MeshBasicMaterial({ color: 0x404040 });
        this.planeForTrack = new THREE.PlaneGeometry(20, 20)
        this.plane = new THREE.Mesh(planeForTrack, trackMaterial)
    }
}