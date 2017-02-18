"use strict"

import Utils from '../Utils'

let CallbackRegistryType = function() {
    this.items = [];

    this.call = (...args) => {
        this.items.map(item => item.callback(...args));
    };

    this.add = (item) => {
        this.items.push(item);
    };

    this.rem = (name) => {
        this.items = this.items.filter(item => item.name != name);
    };
};

let callbackRegistry = {
};

// Register a new render callback which should be called each frame
let register = function(callback, type = 'render') {
    type = type.toUpperCase();

    switch (type) {

        case 'RENDER':
            // Called every render
            break;

        case 'HOT-RELOAD':

            // Called when the developer hot-reloads the page
            // See webpack https://github.com/webpack/docs/wiki/hot-module-replacement
            if (module.hot) {
                module.hot.addStatusHandler(callback);
            }
            break;

        default:

            // We're not going to add this callback to the registry
            return false;
    }

    let name = Utils.generate_name(`Engine_${type}_Callback`);
    // Make sure we've got an registry of this type
    if (! callbackRegistry[type])
        callbackRegistry[type] = new CallbackRegistryType();

    // Add to the registry
    callbackRegistry[type].add({ name, callback });

    return name;
};

// Unregister a render callback
let unregister = function(name, type = 'render') {
    type = type.toUpperCase();

    switch (type) {
        case 'render':
            if (callbackRegistry[type].hasOwnProperty(name))
                break;

        default:
            return;
    }

    delete callbackRegistry[type].rem(name);
};

let defaultCallback = new CallbackRegistryType();
let callbacks = function(type) {
    type = type.toUpperCase();
    return (callbackRegistry[type] ? callbackRegistry[type] : defaultCallback);
};

export default {
    register,
    unregister,
    callbacks
};
