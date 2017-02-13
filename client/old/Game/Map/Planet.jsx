"use strict";

class Planet extends THREE.Object3D {
    constructor(terrain) {

        // Initialise the Object3D
        super();

        this.add(terrain);
        this.terrain = terrain;
    }

    dispose(ofTextures = true) {
        this.terrain.dispose();
    }
}

export default Planet;
