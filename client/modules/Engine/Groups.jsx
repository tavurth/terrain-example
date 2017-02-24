"use strict";

import Engine from './'
import Utils from '../Utils'

let currentGroup = false;

export const get = () => {
    return currentGroup;
};

export const set = (newGroup) => {
    currentGroup = newGroup;
    setup(newGroup);
};

let setup = (group) => {
    group.renderCallbacks = {};

    // group.stats = new Stats();
    // group.canvas.appendChild(group.stats.dom);
    group.status = 'RUNNING';
    group.uid = Utils.generate_name('Group');

    window.scene = group.scene;
    window.gl = group.engine.context;

    // Render and perform post render functionality
    group.render = function(name) {
        // group.stats.update();

        // Call all registered render functions
        Engine.callbacks('render').call();

        group.engine.render(group.scene, group.camera);
    };

    group.dispose = function() {
        group.status = 'STOPPED';
        group.engine.dispose();

        for (let key in group.renderCallbacks) {
            group.unregister(key);
        }

        if (group.uid == currentGroup.uid) {
            currentGroup = false;
        }
    }

    group.player    = false;
    group.setPlayer = (playerModel) => {
        group.player = {
            ...playerModel,
            velocity: new THREE.Vector3(),
            rVelocity: new THREE.Vector3(),
        };

        if (! group.hasOwnProperty('position')) {
            group.position = new THREE.Vector3();
        }
    };
};

let create = (canvasId, createCamera = true) => {
    let { canvas, engine, scene, camera } = false;

    if (canvas = document.getElementById(canvasId)) {

        // Was the engine successfully initialised
        if (engine = Engine.create.engine(canvas)) {
            scene = Engine.create.scene();

            // Should we create the camera? Has the scene been initialised?
            if (scene && createCamera) {
                camera = Engine.create.camera(scene);
            }
        }
    }

    let group = {
        scene,
        canvas,
        engine,
        camera
    };

    // TODO: Add the ability to disable this code through kwargs
    // Set the group in the group-server (so that other areas of code can call B.group.get)
    set(group);

    return group;
};



export default {
    get,
    set,
    create
};
