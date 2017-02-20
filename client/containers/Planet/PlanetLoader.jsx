"use strict";

import Planet from './'
import Terrain from './Terrain'

import Utils from 'modules/Utils'
import Engine from 'modules/Engine'

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

        let textureUniforms = {};

        // Setup each texture as a texture uniform to pass into the terrain material shader
        for (let tex in textures) {
            textureUniforms[tex] = { type: 't', value: textures[tex] };
        }
        textureUniforms['texture'] = textures['texture'];
        textureUniforms['heightmap'] = textures['heightmap'];

        // Creating our terrain
        let terrain = new Terrain({
            load: false, // We'll load using the *LoadingScreen* class at a later time
            nLevels: 2,  // How detailed the users viewport is
            uniforms: {
                ...planetData.uniforms,
                ...textureUniforms
            },
            ...planetData.terrain
        });

        loadingScreen.setup(terrain, () => res(terrain), rej);
        terrain.load();
    });
};

async function load(planetData) {
    let loadingScreen = new Engine.LoadingScreen();

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
