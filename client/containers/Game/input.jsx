"use strict"

import Hammer from 'hammerjs'
import Engine from 'modules/Engine'

let group;
let planet;

let windowHalfX, windowHalfY;

let global = () => {
    window.addEventListener('resize', () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        group.camera.aspect = window.innerWidth / window.innerHeight;
        group.camera.updateProjectionMatrix();
        group.engine.setSize(window.innerWidth, window.innerHeight);
    });
}

let mouse = () => {
    var hammertime = new Hammer(document.body);
    hammertime.get('pinch').set({ enable: true });

    hammertime.on('pan', function(event) {
        group.camera.velocity.x -= event.deltaX / 4.;
        group.camera.velocity.y += event.deltaY / 4.;
    });

    hammertime.on('pinch', function(event) {
        group.camera.position.z = Math.max(Math.min(group.camera.position.z + event.deltaY * 20, planet.terrain.worldSize * .38), 1200);
    });

    window.addEventListener('mousewheel', (event) => {
        group.camera.position.z = Math.max(Math.min(group.camera.position.z + event.deltaY * 40, planet.terrain.worldSize * .38), 1200);
    });
}

let keyboard = () => {
    window.addEventListener('keydown', event => {
        switch (event.code) {
            case 'ArrowUp':    group.camera.velocity.y += 800; break;
            case 'ArrowDown':  group.camera.velocity.y -= 800; break;
            case 'ArrowLeft':  group.camera.velocity.x -= 800; break;
            case 'ArrowRight': group.camera.velocity.x += 800; break;
        }
    });
}

let init = (currentPlanet) => {

    group  = Engine.group.get();
    planet = currentPlanet;

    group.register(() => {
        planet.animate(group.camera);
    });

    global();
    mouse();
    keyboard();
};

export default {
    init
};
