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
    if (! group.player)
        return;

    group.camera.velocity.x -= event.deltaX / 8.;
    group.camera.velocity.y += event.deltaY / 8.;
};

let onPinch = event => {
    if (! group.player)
        return;

    group.player.position.z = Math.max(Math.min(group.player.position.z + event.deltaY * 20, planet.terrain.elevation * 24), 140);
};

let onScroll = event => {
    if (! group.player)
        return;

    group.player.position.z = Math.max(Math.min(group.player.position.z + event.deltaY * 40, planet.terrain.elevation * 24), 140);
};

let keysPressed = {};
let onKeyDown, onKeyUp;
onKeyDown = onKeyUp = e => {
    e = e || event; // Deal with IE
    keysPressed[e.code] = e.type == 'keydown';
}

let velocityInc = 0.002;
let keyRepeater = () => {

    if (! group.player)
        return;

    Object.keys(keysPressed).map(key => {
        if (! keysPressed[key])
            return;

        switch (key) {
            case 'ArrowUp':
                group.player.rVelocity.x -= velocityInc;
                break;

            case 'ArrowDown':
                group.player.rVelocity.x += velocityInc;
                break;

            case 'ArrowLeft':
                group.player.rVelocity.z += velocityInc;
                break;

            case 'ArrowRight':
                group.player.rVelocity.z -= velocityInc;
                break;

            case 'KeyZ':
                group.player.rVelocity.y += velocityInc;
                break;

            case 'KeyX':
                group.player.rVelocity.y -= velocityInc;
                break;
        }
    });
};

let movePlayer = () => {
    group.player.position.z += group.player.rVelocity.y * 10;
    group.player.position.y += group.player.rVelocity.z * 10;
    group.player.position.x += group.player.rVelocity.x * 10;
};

let mouse = () => {
    var hammertime = new Hammer(document.body);
    hammertime.get('pinch').set({ enable: true });

    hammertime.on('pan', onPan);
    hammertime.on('pinch', onPinch);
    window.addEventListener('mousewheel', onScroll);
}

let keyboard = () => {
    // window.addEventListener('keyup', onKeyUp);
    // window.addEventListener('keydown', onKeyDown);
    //
    // Engine.register(keyRepeater);
    // Engine.register(movePlayer);
}

let init = currentPlanet => {

    group  = Engine.group.get();
    planet = currentPlanet;

    global();
    mouse();
    keyboard();
};

export default {
    init
};
