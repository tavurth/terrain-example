"use strict";

import Planet from './'
import Terrain from './Terrain'

import Utils from 'modules/Utils'
import Engine from 'modules/Engine'

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
        let terrain = new Terrain({
            load: false,
            defines: {
                ELEVATION: 1024,
            },
            uniforms: {
                texture: textures['heightmap'],
                heightmap: textures['heightmap'],
            },
            material: Mountains({
                light: [0, 0, 2048],
                elevation: 1024
            }, textures).material
        });

        res(terrain);

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
