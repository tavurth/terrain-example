"use strict";

import Utils from '../Utils'
import Group from './Groups'

import { Scene, Vector3, WebGLRenderer, PerspectiveCamera, AmbientLight, PointLight } from 'three'
import { vector3 } from './Vectors'

let DEFAULT_TESSELATION = 8;

/**
 * Create basic BABYLON objects & tools
 */
let createBasic = {
    /**
     * Creates a new THREE.js engine and returns it
     * @param {} element which the engine should be appended to
     */
    engine: (element) => {
        let engine = new WebGLRenderer({
            canvas: element,
            antialias: false
        });
        engine.setPixelRatio(window.devicePixelRatio);
        engine.setSize(window.innerWidth, window.innerHeight);

        return engine
    },

    scene: () => {
        return new Scene();
    },

    camera: (scene, position = vector3(0, 0, 0)) => {
        let camera = new PerspectiveCamera(80, window.innerWidth / window.innerHeight, 100, 120000);

        camera.velocity  = new Vector3();
        camera.rVelocity = new Vector3();

        return camera;
    },

    light: (options = {}) => {

        Utils.options(options, {
            size: 1,
            dist: 0,
            power: 1,
            pos: [0, 0, 0],
            color: 0xffffff,
            type: 'ambient',
        });

        let light = false;
        let group = Group.get();

        switch ((options.type).toLowerCase()) {
            case 'point':
                light = new PointLight(options.color, options.power, options.distance); break;

            case 'ambient':
            default:
                light = new AmbientLight(options.color); break;
        };
        light.position.set(...options.pos);
        group.scene.add(light);

        return light;
    },
};

export default {
    ...createBasic,
}
