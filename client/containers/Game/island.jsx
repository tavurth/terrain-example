"use strict";

import Clouds from './clouds'
import Engine from 'modules/Engine'
import Planet from 'containers/Planet'
import DragControls from './DragControls'
import Mountains from 'containers/Planet/Environments/Mountains'

import Water from './Water'

const ULO = 0;
const LOW = 1;
const MED = 2;
const HIG = 4;

import {
    Mesh,
    FogExp2,
    Vector3,
    PointLight,
    AmbientLight,
    RawShaderMaterial,
    InstancedBufferGeometry,
    InstancedBufferAttribute
} from 'three'

export async function load(textures) {

    let DETAIL = MED;

    let group = Engine.group.get();

    // Setup the Sun
    let sun = new AmbientLight(0x232331);

    // Setup the light
    let rotation = 0;
    let light = new PointLight(0x8899AA, 2, 8000000);

    let elevation = '5600.';
    let worldSize = 4096 * 16 + '.';

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

    let terrainTesselate;
    switch (DETAIL) {
        case HIG:
            terrainTesselate = 128; break;
        case MED:
            terrainTesselate = 64; break;
        case LOW:
            terrainTesselate = 32; break;
        default:
            terrainTesselate = 16; break;
    }

    // Load the planet and setup the terrain
    let planet = await Planet.load({
        models: {
            tree: '/assets/models/tree/Tree.obj'
        },
        textures: {
            watermap: '/assets/textures/watermap.png',
            terrain: {
                grass01: '/assets/textures/grass01.png',
                stone01: '/assets/textures/stone01.png',
                heightmap: '/assets/textures/heightmap5.png',
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
                ELEVATION: elevation,
                WORLD_SIZE_X: worldSize,
                WORLD_SIZE_Y: worldSize,
                VIEWPORT_SIZE: worldSize,
                TESSELATION: terrainTesselate + '.'
            }
        },
    });

    let water = new Water({
        camera: group.camera,
        terrain: planet.terrain,
        width: planet.terrain.worldSize * 32,
        height: planet.terrain.worldSize * 32,
        watermap: planet.textures['watermap'],
    });

    let stopped = false;
    let updateLight = () => {

        if (stopped)
            return;
        rotation += 0.005;

        light.position.copy({
            x: planet.terrain.worldSize + Math.cos(rotation) * planet.terrain.worldSize * 4,
            y: planet.terrain.worldSize + Math.sin(rotation) * planet.terrain.worldSize * 4,
            z: (Math.sin(rotation) + 2.0) * planet.terrain.elevation * 4
        });
    };

    window.addEventListener('keydown', event => {
        if (event.code == 'Space') {
            stopped = ! stopped;

            console.log(planet.terrain.children[0].material.uniforms);
        }
    });
    Engine.register(updateLight);

    let cloudNum, cloudThick, cloudChunks;
    switch (DETAIL) {
        case HIG:
            cloudNum = 40;
            cloudThick = 80;
            cloudChunks = 150;
            break;
        case MED:
            cloudNum = 20;
            cloudThick = 40;
            cloudChunks = 30;
            break;
        case LOW:
            cloudNum = 10;
            cloudThick = 20;
            cloudChunks = 20;
            break;
        default:
            cloudNum = 5;
            cloudThick = 10;
            cloudChunks = 10;
            break;
    }

    let clouds = Clouds.create({
        width: planet.terrain.worldSize,
        height: planet.terrain.worldSize,
        depth: planet.terrain.elevation * 2,
        pos: [
            planet.terrain.worldSize / 2,
            planet.terrain.worldSize / 2,
            planet.terrain.elevation / 2
        ],
        blocks: cloudNum,
        maxChunks: cloudChunks,
        minChunks: cloudChunks / 2,
        textures: planet.textures.cloud,
        worldSize: planet.terrain.worldSize,
        blockSize: planet.terrain.worldSize / 5,
        chunkSize: planet.terrain.worldSize / cloudThick,
    });
    planet.terrain.add(clouds);
    clouds.renderOrder = 9999;

    group.scene.fog = new FogExp2(0x7F99E5, 0.000009);
    group.camera.up.set(0, 0, 1);

    // Setting up the position of the camera
    group.camera.position.y = planet.terrain.worldSize;
    group.camera.position.x = planet.terrain.worldSize / 6;
    group.camera.position.z = planet.terrain.elevation * 2;
    group.camera.rotation.x = Math.PI / 8;

    // Setup controls for the player
    let controls = new DragControls(
        group.camera,
        document.body,
        {
            minPosition: new Vector3(-planet.terrain.worldSize * 4, -planet.terrain.worldSize * 4, planet.terrain.elevation / 4),
            maxPosition: new Vector3( planet.terrain.worldSize * 4,  planet.terrain.worldSize * 4, planet.terrain.elevation * 5),
            minVelocity: new Vector3(-10000, -10000, -10000),
            maxVelocity: new Vector3( 10000,  10000,  10000)
        }
    );

    // Move the water with the player
    let lastTime = performance.now();
    Engine.register(() => {

        let nowTime = performance.now();
        controls.update(nowTime - lastTime);
        lastTime = nowTime;

        water.position.copy(group.camera.position);
        water.position.z = 140;

        // Animate the movement of terrain
        planet.animate(group.camera.position);
    });

    // Trees mesh instancing setup
    let geo = planet.models['tree'].children[0].geometry;
    let treeGeo = new InstancedBufferGeometry();
    treeGeo.addAttribute('position', geo.attributes.position);
    treeGeo.addAttribute('normal', geo.attributes.normal);

    // Forsest instancing setup
    let nTrees = 20000;
    let treesMaxZ = 800;
    let treesMinZ = 300;

    switch (DETAIL) {
        case HIG:
            nTrees = 40000; break;
        case MED:
            nTrees = 20000; break;
        case LOW:
            nTrees = 10000; break;
        default:
            nTrees = 5000; break;
    }

    treeGeo.maxInstancedCount = nTrees;

    // Attributes used for each tree
    let scales = new InstancedBufferAttribute(new Float32Array(nTrees), 1, 1);
    let offsets = new InstancedBufferAttribute(new Float32Array(nTrees * 3), 3, 1);

    for (let x,y,z, i = 0; i < nTrees;) {

        x = Math.random() * planet.terrain.worldSize;
        y = Math.random() * planet.terrain.worldSize;
        z = planet.terrain.getElevation(x, y);

        if (z > treesMinZ && z < treesMaxZ) {
            scales.setX(i, Math.random() + 0.5);
            offsets.setXYZ(i, x, y, z);
            i++;
        }
    }
    treeGeo.addAttribute('scale', scales);
    treeGeo.addAttribute('offset', offsets);

    let vShader = `
    precision highp float;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    attribute float scale;
    attribute vec3 offset;
    attribute vec3 normal;
    attribute vec3 position;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {

        vNormal = normal;
        vPosition = offset + position * scale;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.);
    }
    `;
    let fShader = `
    precision mediump float;

    `+ Engine.noise('classic2D') + `

    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform vec3 light;

    void main() {

        vec3 diffuse;
        diffuse = mix(vec3(0, 0.05, 0.02), vec3(0., 0.3, 0.1), cnoise(vNormal.xy + vPosition.xy / 10.));

        // Add distance fog
        float depth = gl_FragCoord.z / gl_FragCoord.w;
        float fogAmount = smoothstep(WORLD_SIZE / 8., WORLD_SIZE * 3., depth);
        diffuse = mix(diffuse, vec3(0.5, 0.6, 0.95), fogAmount);

        if (depth > WORLD_SIZE / 4.) {
            gl_FragColor = vec4(diffuse, 1. - depth / (WORLD_SIZE /2.));
            return;
        }

        // Add the point light
        vec3 vLightOffset = vPosition - light;
        float incidence = dot(vNormal, -normalize(vLightOffset));
        incidence = clamp(incidence, 0., 1.);
        diffuse = mix(mix(vec3(0.1), diffuse, 0.3), diffuse * 1.8, incidence);

        // Fade out trees at the edge of the far-clip
        gl_FragColor = vec4(diffuse, 1. - fogAmount);
    }
    `;

    let trees = new Mesh(treeGeo, new RawShaderMaterial({
        transparent: true,
        vertexShader: vShader,
        fragmentShader: fShader,
        defines: {
            WORLD_SIZE: planet.terrain.worldSize + '.'
        },
        uniforms: {
            light: { type: 'v3', value: light.position }
        }
    }));
    trees.frustumCulled = false;

    planet.add(light);
    planet.add(water);
    planet.add(sun);
    planet.terrain.add(trees);

    return planet;
};

export default {
    load
};
