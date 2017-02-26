"use strict";

import './FlyControls'
import Clouds from './clouds'
import Engine from 'modules/Engine'
import Planet from 'containers/Planet'
import Mountains from 'containers/Planet/Environments/Mountains'

const ULO = 0;
const LOW = 1;
const MED = 2;
const HIG = 4;

export async function load(textures) {

    let DETAIL = MED;

    let group = Engine.group.get();

    // Setup the Sun
    let sun = new THREE.AmbientLight(0x232331);

    // Setup the light
    let rotation = 0;
    let light = new THREE.PointLight(0x8899AA, 2, 8000000);

    let elevation = '8600.';
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
            tree: '/assets/models/tree/Tree.obj',
            plane: '/assets/models/glider/Glider.obj',
        },
        textures: {
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

            nLevels: 4,
            defines: {
                ELEVATION: elevation,
                WORLD_SIZE_X: worldSize,
                WORLD_SIZE_Y: worldSize,
                VIEWPORT_SIZE: worldSize / 2,
                TESSELATION: terrainTesselate + '.'
            }
        },
    });
    planet.add(light);
    planet.add(sun);

    let waterGeo = new THREE.PlaneGeometry(planet.terrain.worldSize * 32, planet.terrain.worldSize * 32, 1, 1);
    let waterMat = new THREE.MeshPhongMaterial({
        color: 0x112255,
        emissive: 0x112255,
        fog: true,
    });
    let waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.frustumCulled = false;
    planet.add(waterMesh);

    let stopped = false;
    let updateLight = () => {

        if (stopped)
            return;
        rotation += 0.001;

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

    let cloudNum, cloudThick;
    switch (DETAIL) {
        case HIG:
            cloudNum = 80;
            cloudThick = 600;
            break;
        case MED:
            cloudNum = 40;
            cloudThick = 300;
            break;
        case LOW:
            cloudNum = 20;
            cloudThick = 150;
            break;
        default:
            cloudNum = 10;
            cloudThick = 75;
            break;
    }

    let clouds = Clouds.create({
        width: planet.terrain.worldSize,
        height: planet.terrain.worldSize,
        depth: planet.terrain.elevation * 2,
        pos: [
            planet.terrain.worldSize / 2,
            planet.terrain.worldSize / 2,
            planet.terrain.elevation / 8
        ],
        blocks: cloudNum,
        maxChunks: cloudThick,
        minChunks: cloudThick / 2,
        textures: planet.textures.cloud,
        worldSize: planet.terrain.worldSize,
        blockSize: planet.terrain.worldSize / 15,
        chunkSize: planet.terrain.worldSize / 40,
    });
    planet.terrain.add(clouds);
    clouds.renderOrder = 9999;

    // Add the plane to the scene
    let plane = planet.models['plane'];
    plane.material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        depthTest: false,
    });
    group.scene.fog = new THREE.FogExp2(0x7F99E5, 0.000009);

    // Setting up the glider
    group.scene.add(plane);
    plane.scale.set(0.1,0.1,0.1);

    // Setting up the player
    group.setPlayer(plane);

    // Important that we reset the camera's UP vector,
    // As terrain is in the X-Y space, rather than the standard X-Z space
    plane.up.set(0, 0, 1);
    plane.add(group.camera);
    group.camera.up.set(0, 0, 1);

    // Setting up the position of the camera
    plane.position.y = planet.terrain.worldSize;
    plane.position.x = planet.terrain.worldSize / 8;
    plane.position.z = planet.terrain.elevation / 4;
    plane.rotation.x = Math.PI / 2;
    plane.rotation.y = - Math.PI / 2;

    // Move the plane in front of the camera
    group.camera.position.z += 2000;
    group.camera.position.y += 2000;
    group.camera.rotation.x = -Math.PI / 6;

    // Setup controls for the player
    let controls = new THREE.FlyControls(group.player, window.body);
    controls.rollSpeed = 0.004;
    controls.movementSpeed = .1;
    controls.autoForward = true;

    // Move the water with the player
    let lastTime = performance.now();
    Engine.register(() => {
        if (! group.player)
            return;

        let nowTime = performance.now();
        controls.update(nowTime - lastTime);
        lastTime = nowTime;

        waterMesh.position.copy(group.player.position);
        waterMesh.position.z = 130;

        // Animate the movement of terrain
        planet.animate(group.player.position);
    });

    // Trees mesh instancing setup
    let geo = planet.models['tree'].children[0].geometry;
    let treeGeo = new THREE.InstancedBufferGeometry();
    treeGeo.addAttribute('position', geo.attributes.position);
    treeGeo.addAttribute('normal', geo.attributes.normal);

    // Forsest instancing setup
    let nTrees = 20000;
    let treesMaxZ = 1200;
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
    let scales = new THREE.InstancedBufferAttribute(new Float32Array(nTrees), 1, 1);
    let offsets = new THREE.InstancedBufferAttribute(new Float32Array(nTrees * 3), 3, 1);

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
    precision highp float;

    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform vec3 light;

    void main() {

        if (gl_FragCoord.z > .99)
            discard;

        vec3 diffuse = vec3(0., 0.3, 0.1);

        // Add distance fog
        float depth = gl_FragCoord.z / gl_FragCoord.w;
        float fogAmount = smoothstep(WORLD_SIZE / 8., WORLD_SIZE * 3., depth);
        diffuse = mix(diffuse, vec3(0.5, 0.6, 0.95), fogAmount);

        // Add the point light
        vec3 vLightOffset = vPosition - light;
        float incidence = dot(vNormal, -normalize(vLightOffset));
        incidence = clamp(incidence, 0., 1.);
        diffuse = mix(mix(vec3(0.1), diffuse, 0.3), diffuse * 1.8, incidence);

        // Fade out trees at the edge of the far-clip
        gl_FragColor = vec4(diffuse, 1. - smoothstep(0.985, 0.99, gl_FragCoord.z));
    }
    `;

    let trees = new THREE.Mesh(treeGeo, new THREE.RawShaderMaterial({
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
    planet.terrain.add(trees);

    return planet;
};

export default {
    load
};
