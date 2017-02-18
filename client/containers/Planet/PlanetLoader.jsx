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

        let geo = new THREE.SphereGeometry(1, 1, 1);
        let mat = new THREE.MeshStandardMaterial();

        let light = new THREE.Mesh(geo, mat);
        let rotation = 0;
        light.position.fromArray([ 0, 0, 4096 * 4]);

        let terrain = new Terrain({
            load: false,
            defines: {
                ELEVATION: 1024,
            },
            uniforms: {
                texture: textures['heightmap'],
                heightmap: textures['heightmap'],
            },
            ...Mountains({
                light: light,
                elevation: 1024
            }, textures),
        });
        terrain.add(light);

        let stopped = false;
        let updateLight = () => {

            if (stopped)
                return;
            rotation += 0.005;

            light.position.copy({
                x: terrain.worldSize / 2 + Math.cos(rotation) * terrain.worldSize / 2,
                y: terrain.worldSize / 2 + Math.sin(rotation) * terrain.worldSize / 2,
                z: (Math.sin(rotation) + 2.0) * terrain.elevation
            });
        };

        window.addEventListener('keydown', event => {
            if (event.code == 'Space')
                stopped = ! stopped;
        });

        Engine.register(updateLight);

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
