"use strict";

import Input from './input'
import Render from './render'
import Engine from 'modules/Engine'
import Planet from 'containers/Planet'

export async function start(canvasId) {

    let group = Engine.create.basic(canvasId);

    let planet = await Planet.load({
        textures: {
            stone01: '/assets/textures/stone01.png',
            grass01: '/assets/textures/grass01.png',
            heightmap: '/assets/textures/heightmap.png',
        },
        terrain: {
            nLevels: 3,
            defines: {
                TESSELATION: 32,
                ELEVATION: 3800,
                WORLD_SIZE_X: 4096 * 16,
                WORLD_SIZE_Y: 4096 * 16,
            }
        }
    });

    group.scene.add(planet);

    Input.init(planet);
    Render.init();
};

export default {
    start
};
