"use strict";

import Planet from './'
import Terrain from './Terrain'

import Utils from 'modules/Utils'
import Engine from 'modules/Engine'

import OBJLoader from './OBJLoader'
import { TextureLoader } from 'three'

async function loadModelSet(models, modelLoader, loadingScreen, modelSet) {

    Object.keys(modelSet).map(key => {
        console.log('Loading model set', key);
        modelLoader.load(key, modelSet[key]);
        models.count++;
    });
}

async function loadModels(loadingScreen, planetData) {
    let modelLoader = new OBJLoader();
    let models = {count: 0};

    return new Promise((res, rej) => {

        let counted = 0;
        let onLoad = (key, model) => {

            if (key) {
                models[key] = model;

                if (++counted >= models.count) {
                    delete models.count;
                    res(models);
                }
            }
        };

        loadingScreen.setup(modelLoader.manager, onLoad, rej);
        loadModelSet(models, modelLoader, loadingScreen, planetData.models);
    });
}

async function loadTextureSet(textures, textureLoader, loadingScreen, textureSet) {
    Object.keys(textureSet).map(key => {

        // We've found a subset of textures to load
        if (typeof textureSet[key] == 'object') {
            console.log('Loading texture set', key);

            // Make sure we've made some space for the subset
            if (! textures[key]) {
                textures[key] = {};
            }

            // Load the subset recursively
            let subSet = loadTextureSet(textures[key], textureLoader, loadingScreen, textureSet[key]);

            // Skip normal processing
            return;
        }

        // Load the texture into the base level
        else if (typeof textureSet[key] == 'string') {
            textures[key] = textureLoader.load(textureSet[key]);
        }
    });
}

async function loadTextures(loadingScreen, planetData) {
    let textureLoader = new TextureLoader();
    let textures = {};

    return new Promise((res, rej) => {
        loadingScreen.setup(textureLoader.manager, () => res(textures), rej);
        loadTextureSet(textures, textureLoader, loadingScreen, planetData.textures);
    });
};

async function loadTerrain(loadingScreen, planetData, textures) {
    return new Promise((res, rej) => {

        let textureUniforms = {};

        // Setup each texture as a texture uniform to pass into the terrain material shader
        for (let tex in textures.terrain) {
            textureUniforms[tex] = { type: 't', value: textures.terrain[tex] };
        }
        textureUniforms['texture'] = textures.terrain['texture'];
        textureUniforms['heightmap'] = textures.terrain['heightmap'];

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
    let models   = await loadModels(loadingScreen, planetData);
    let textures = await loadTextures(loadingScreen, planetData);
    let terrain  = await loadTerrain(loadingScreen, planetData, textures);

    // Create our planet from the data
    let planet   = new Planet(terrain, models, textures);

    // Cleanup the loading screen
    loadingScreen.doneLoading();

    return planet;
};

export default {
    load
};
