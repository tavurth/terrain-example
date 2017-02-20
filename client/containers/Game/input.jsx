"use strict"

import Hammer from 'hammerjs'
import Engine from 'modules/Engine'

let group;
let planet;

let windowHalfX, windowHalfY;
let registeredEventHandlers = [];

let global = () => {
    window.addEventListener('resize', onResize);
}

let onResize = () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    group.camera.aspect = window.innerWidth / window.innerHeight;
    group.camera.updateProjectionMatrix();
    group.engine.setSize(window.innerWidth, window.innerHeight);
};

let onPan = event => {
    group.camera.velocity.x -= event.deltaX / 8.;
    group.camera.velocity.y += event.deltaY / 8.;
};

let onPinch = event => {
    group.camera.position.z = Math.max(Math.min(group.camera.position.z + event.deltaY * 20, planet.terrain.elevation * 4), 1200);
};

let onScroll = event => {
    group.camera.position.z = Math.max(Math.min(group.camera.position.z + event.deltaY * 40, planet.terrain.elevation * 4), 1200);
};

let onKeyDown = event => {
    switch (event.code) {
        case 'ArrowUp':    group.camera.velocity.y += 200; break;
        case 'ArrowDown':  group.camera.velocity.y -= 200; break;
        case 'ArrowLeft':  group.camera.velocity.x -= 200; break;
        case 'ArrowRight': group.camera.velocity.x += 200; break;
    }
};

let mouse = () => {
    var hammertime = new Hammer(document.body);
    hammertime.get('pinch').set({ enable: true });

    hammertime.on('pan', onPan);
    hammertime.on('pinch', onPinch);
    window.addEventListener('mousewheel', onScroll);
}

let keyboard = () => {
    window.addEventListener('keydown', onKeyDown);
}

let init = currentPlanet => {

    group  = Engine.group.get();
    planet = currentPlanet;

    Engine.register(() => {
        planet.animate(group.camera);
    }, 'render');

    global();
    mouse();
    keyboard();
};

export default {
    init
};
