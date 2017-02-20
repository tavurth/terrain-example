"use strict";

import Engine from 'modules/Engine'
import Planet from 'containers/Planet'
import Mountains from 'containers/Planet/Environments/Mountains'

let input = () => {

};

export async function load() {

    // Setup the light
    let rotation = 0;
    var light = new THREE.PointLight(0x8899AA, 1, 4096 * 32);
    light.position.fromArray([ 0, 0, 3800]);

    let elevation = '2800.';

    // Setup the terrain shader
    let terrainShader = Mountains({
        defines: {
            ELEVATION: elevation,
        },
        uniforms: {
            light: light,
        },
    });

    // Load the planet and setup the terrain
    let planet = await Planet.load({
        textures: {
            stone01: '/assets/textures/stone01.png',
            grass01: '/assets/textures/grass01.png',
            heightmap: '/assets/textures/heightmap4.png',
        },

        // Terrain specific options
        terrain: {
            // Add the mountain shader
            ...terrainShader,

            nLevels: 4,
            wireframe: true,
            defines: {
                TESSELATION: '64.',
                ELEVATION: elevation,
                WORLD_SIZE_X: (4096 * 16) + '.',
                WORLD_SIZE_Y: (4096 * 16) + '.',
            }
        },
    });
    planet.add(light);

    let waterGeo = new THREE.PlaneGeometry(planet.terrain.worldSize * 4, planet.terrain.worldSize * 4, 4, 4);
    let waterMat = new THREE.MeshPhongMaterial({
        color: 0x112255,
        emissive: 0x112255,
    });
    let waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.x = planet.terrain.worldSize / 2;
    waterMesh.position.y = planet.terrain.worldSize / 2;
    waterMesh.position.z = 520;
    waterMesh.frustumCulled = false;
    planet.add(waterMesh);

    let stopped = false;
    let updateLight = () => {

        if (stopped)
            return;
        rotation += 0.005;

        light.position.copy({
            x: planet.terrain.worldSize + Math.cos(rotation) * planet.terrain.worldSize / 2,
            y: planet.terrain.worldSize + Math.sin(rotation) * planet.terrain.worldSize / 2,
            z: (Math.sin(rotation) + 2.0) * planet.terrain.elevation
        });

    };

    window.addEventListener('keydown', event => {
        if (event.code == 'Space') {
            stopped = ! stopped;

            console.log(planet.terrain.children[0].material.uniforms);
        }
    });

    Engine.register(updateLight);

    return planet;
};

export default {
    load
};
