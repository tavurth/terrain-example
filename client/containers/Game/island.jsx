"use strict";

import Clouds from './clouds'
import Engine from 'modules/Engine'
import Planet from 'containers/Planet'
import Mountains from 'containers/Planet/Environments/Mountains'

let input = () => {

};

export async function load(textures) {

    // Setup the Sun
    let sun = new THREE.AmbientLight(0x232331);

    // Setup the light
    let rotation = 0;
    let light = new THREE.PointLight(0x8899AA, 2, 8000000);
    light.position.fromArray([ 0, 0, 380000]);

    let elevation = '2800.';

    // Setup the terrain shader
    let terrainShader = Mountains({
        // wireframe: true,
        defines: {
            ELEVATION: elevation,
        },
        uniforms: {
            light: light,
        },
    });

    // Load the planet and setup the terrain
    let planet = await Planet.load({
        models: {
            plane: '/assets/models/glider/Glider.obj'
        },
        textures: {
            terrain: {
                grass01: '/assets/textures/grass01.png',
                stone01: '/assets/textures/stone01.png',
                heightmap: '/assets/textures/heightmap4.png',
            },
            cloud: {
                cloud01: '/assets/textures/cloud01.png',
                cloud02: '/assets/textures/cloud02.png',
                cloud03: '/assets/textures/cloud03.png',
            }
        },

        // Terrain specific options
        terrain: {
            // Add the mountain shader
            ...terrainShader,

            nLevels: 2,
            defines: {
                TESSELATION: '64.',
                ELEVATION: elevation,
                WORLD_SIZE_X: (4096 * 16) + '.',
                WORLD_SIZE_Y: (4096 * 16) + '.',
            }
        },
    });
    planet.add(light);
    planet.add(sun);

    let y = 0;
    for (let x = 0; x < planet.terrain.worldSize; x += planet.terrain.worldSize / 100) {
        let geo = new THREE.SphereGeometry(32, 8, 8);
        let mat = new THREE.MeshPhongMaterial({
            emissive: 0xffffff
        });

        let mesh = new THREE.Mesh(geo, mat);
        mesh.position.x = x;
        // mesh.position.z = planet.terrain.getElevation(x, y);

        y+=planet.terrain.worldSize / 100;
    }

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

    let clouds = Clouds.create({
        width: planet.terrain.worldSize * 1 ,
        height: planet.terrain.worldSize * 1,
        pos: [
            planet.terrain.worldSize / 2,
            planet.terrain.worldSize / 2,
            planet.terrain.elevation
        ],
        depth: planet.terrain.elevation * 4,
        textures: planet.textures.cloud,
        blocks: 50,
        maxChunks: 300,
        minChunks: 10,
        chunkSize: 40,
        blockSize: planet.terrain.worldSize / 30,
    });
    planet.terrain.add(clouds);

    let group = Engine.group.get();
    let plane = planet.models['plane'];
    planet.plane = plane;

    group.camera.add(plane);
    plane.position.x = 0;
    plane.position.z = -200;
    plane.position.y = -50;
    plane.rotation.x = Math.PI / 3.5;

    plane.scale.set(0.1,0.1,0.1);
    plane.material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        depthTest: false,
    });

    group.camera.rotation.x = Math.PI / 4.5;

    return planet;
};

export default {
    load
};