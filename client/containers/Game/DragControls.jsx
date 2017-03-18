"use strict"

import Hammer from 'hammerjs'
import { Vector3 } from 'three'

let DragControls = function(object, element, options = {}) {

    options = {
        maxVelocity: new Vector3(100,    100,  100),
        minVelocity: new Vector3(-100,  -100, -100),
        minPosition: new Vector3(-2000, -2000, 100),
        maxPosition: new Vector3(2000,   2000, 10000),
        ...options,
    };

    // Velocity and positionclamping
    this.minVelocity = options.minVelocity;
    this.maxVelocity = options.maxVelocity;
    this.minPosition = options.minPosition;
    this.maxPosition = options.maxPosition;

    this.object  = object;
    this.element = element;

    DragControls.prototype.setup.call(this);
};

DragControls.prototype.onPan = function(event) {
    this.object.velocity.x -= event.velocityX * 50;
    this.object.velocity.y += event.velocityY * 50;
};

DragControls.prototype.onPinch = function(event) {
    this.object.velocity.z += event.velocityY * 50;
};

DragControls.prototype.onScroll = function(event) {
    this.object.velocity.z += event.deltaY;
};

DragControls.prototype.setup = function() {
    this.hammer = new Hammer(this.element);

    this.hammer.get('pinch').set({ enable: true });
    this.hammer.on('pan', event => { this.onPan(event) });
    this.hammer.on('pinch', event => { this.onPinch(event) });

    this.object.velocity = this.object.velocity || new Vector3(0,0,0);

    this.element.addEventListener('mousewheel', event => { this.onScroll(event) });
};

DragControls.prototype.update = function(delta) {
    this.object.position.add(this.object.velocity.divideScalar(1.08));

    this.object.velocity.clamp(this.minVelocity, this.maxVelocity);
    this.object.position.clamp(this.minPosition, this.maxPosition);

};

export default DragControls;
