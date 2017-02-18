"use strict";

import Input from './input'
import Render from './render'
import Engine from 'modules/Engine'
import Planet from 'containers/Planet'

let group, planet;
export async function run(canvasId) {

    group = Engine.group.create(canvasId);

    planet = await Planet.load({
        textures: {
            stone01: '/assets/textures/stone01.png',
            grass01: '/assets/textures/grass01.png',
            heightmap: '/assets/textures/heightmap.png',
        },
        terrain: {
            nLevels: 4,
            wireframe: true,
            defines: {
                TESSELATION: 64,
                ELEVATION: 3800,
                WORLD_SIZE_X: 4096 * 16,
                WORLD_SIZE_Y: 4096 * 16,
            }
        },
    });

    group.camera.rotation.x = Math.PI / 20;
    group.camera.position.x = planet.terrain.worldSize;
    group.camera.position.y = planet.terrain.worldSize;
    group.camera.position.z = planet.terrain.elevation * 20;
    group.scene.add(planet);

    Input.init(planet);
    Render.init();
}

let savedCanvasId = false;
export function restart(type) {

    console.log(type);
    return;

    console.log('Restarting WebGL renderer...');

    if (planet) {
        planet.dispose();
        planet = null;
    }

    if (group) {
        group.dispose();
        group = null;
    }

    run(savedCanvasId);
}

export function start(canvasId) {
    if (! savedCanvasId)
        savedCanvasId = canvasId;

    Engine.register(restart, 'hot-reload');

    run(canvasId);
};

export default {
    start
};
