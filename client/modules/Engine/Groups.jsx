"use strict";

import Utils from '../Utils'

let currentGroup = false;

export const get = () => {
	return currentGroup;
};

let setup = (group) => {
    group.renderCallbacks = {};

    group.stats = new Stats();
		group.canvas.appendChild(group.stats.dom);

    window.scene = group.scene;

    // Register a new render callback which should be called each frame
    group.register = function(callback) {
        let name = Utils.generate_name('Group_Callback_Function');
        group.renderCallbacks[name] = callback;

        return name;
    };

    // Unregister a render callback
    group.unregister = function(name) {
        if (group.renderCallbacks.hasOwnProperty(name))
            delete group.renderCallbacks[name];
    };

    // Render and perform post render functionality
    group.render = function(name) {

        group.stats.update();

        // Call all registered render functions
        Object.keys(group.renderCallbacks).map(key => group.renderCallbacks[key]());

        group.engine.render(group.scene, group.camera);
    };
};

export const set = (newGroup) => {
	  currentGroup = newGroup;

    setup(newGroup);
};

export default {
	get,
	set
};
