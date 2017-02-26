"use strict";

import Terrain from './Terrain'
import PlanetLoader from './PlanetLoader'

class Planet extends THREE.Object3D {
    constructor(terrain, models, textures) {

        // Initialise the Object3D
        super();

        this.models = models;
        this.textures = textures;
        this.terrain = terrain;

        if (! terrain instanceof Terrain)
            this.terrain = new Terrain(terrain);

        this.add(this.terrain);
    }

    dispose(ofTextures = true) {
        this.terrain.dispose(false);

        // Loop through the uniforms and check for textures to dispose of
        Object.keys(this.textures).map(tex => {
            uniform = this.textures[tex];

            // Check only for texture types
            if (uniform instanceof THREE.Texture)
                uniform.dispose();
        })
    }

    animate(offset) {
        this.terrain.animate(offset);
    }

    static async load(planetData) {
        return await PlanetLoader.load(planetData);
    }
}

export default Planet;
