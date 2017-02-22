"use strict";

import Input from './input'
import Render from './render'
import Engine from 'modules/Engine'
import Planet from 'containers/Planet'

import Island from './island'

let group, planet;
export async function run(canvasId) {

    group = Engine.group.create(canvasId);

    let planet = await Island.load();

    let plane = planet.plane;

    group.camera.position.x = planet.terrain.worldSize;
    group.camera.position.y = planet.terrain.worldSize * 0.5;
    group.camera.position.z = planet.terrain.elevation * 2;
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
