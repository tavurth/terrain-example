"use strict";

import Terrain from './Terrain'
import PlanetLoader from './PlanetLoader'

class Planet extends THREE.Object3D {
    constructor(terrain) {

        // Initialise the Object3D
        super();

        this.terrain = (! terrain instanceof Terrain) ? terrain : new Terrain(terrain);
        this.add(this.terrain);
    }

    dispose(ofTextures = true) {
        this.terrain.dispose();
    }

    animate(camera) {
        this.terrain.animate(camera);
    }

    static async load(planetData) {
        return await PlanetLoader.load(planetData);
    }
}

export default Planet;
