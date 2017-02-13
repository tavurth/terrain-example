"use strict";

import Planet from './Planet'
import Utils from '../../Modules/Utils'
import Terrain from './Terrain/Terrain'
import Toolbox from '../../Modules/Engine/Toolbox'
import LoadingScreen from './LoadingScreen'
import Mountains from './Environments/Mountains'

async function loadTextures(loadingScreen, planetData) {
    let textures      = {};
    let textureLoader = new THREE.TextureLoader();

    return new Promise((res, rej) => {

        loadingScreen.setup(textureLoader.manager, () => res(textures), rej);

        Object.keys(planetData.textures).map(key => {
            textures[key] = textureLoader.load(planetData.textures[key]);
        });
    });
};

async function loadTerrain(loadingScreen, planetData, textures) {

    return new Promise((res, rej) => {
        planetData.terrain.load = false; // Don't auto-load the terrain
        planetData.terrain.heightmap = textures['heightmap'];

        planetData.terrain.elevation = 4096 * 4;

        let options = {
            light: [0, 0, 2048],
            elevation: planetData.terrain.elevation
        }

        planetData.terrain.material = {
            ...Mountains(options, textures).material
        };

        // TODO: Use a single array of vertices in a buffer geometry??
        // ...planetData.terrain,
        //     // wireframe: true,
        //     nLevels: 2,
        //     tesselation: 64,

        let terrain = new Terrain({
            uniforms: {
                heightmap: textures['heightmap'],
                texture: textures['heightmap'],
            }
        });

        res(terrain);

        // loadingScreen.setup(terrain, () => res(terrain), rej);
        // terrain.load();
    });
};

async function load(planetData) {
    let loadingScreen = new LoadingScreen();

    // Load data which may take a while
    let textures = await loadTextures(loadingScreen, planetData);

    let terrain  = await loadTerrain(loadingScreen, planetData, textures);

    // Create our planet from the data
    let planet   = new Planet(terrain);

    // Cleanup the loading screen
    loadingScreen.doneLoading();

    return planet;
};

export default {
    load
};
