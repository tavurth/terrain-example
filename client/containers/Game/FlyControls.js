/**
 * @author James Baicoianu (Original) http://www.baicoianu.com/
 *
 * @author William Whitty (Heavy Modification) https://github.com/tavurth
 */

import { Quaternion, Vector3 } from 'three';

let FlyControls = function (object, domElement) {
    this.object = object;
    this.domElement = (domElement !== undefined) ? domElement : document;
    if (domElement) this.domElement.setAttribute('tabindex', - 1);

    // API
    this.movementSpeed = 1.0;
    this.rollSpeed = 0.005;

    // disable default target object behavior
    // internals
    this.tmpQuaternion = new Quaternion();

    this.forward = new Vector3(0,0,0);
    this.moveVector = new Vector3(0,0,0);
    this.rotationVector = new Vector3(0,0,0);

    this.moveState = {
        yawLeft: 0,
        pitchUp: 0,
        yawRight: 0,
        rollLeft: 0,
        rollRight: 0,
        pitchDown: 0
    };

    this.handleEvent = function (event) {
        if (typeof this[ event.type ] == 'function') {
            this[ event.type ](event);
        }
    };

    this.keyevent = function(event) {
        if (event.altKey) {
            return;
        }
        //event.preventDefault();

        let type = event.type == 'keydown' ? 1 : 0;

        switch (event.keyCode) {
        case 38: /*up*/
            this.moveState.pitchDown = type;
            break;

        case 40: /*down*/
            this.moveState.pitchUp = type;
            break;

        case 37: /*left*/
            this.moveState.rollLeft = type;
            break;

        case 39: /*right*/
            this.moveState.rollRight = type;
            break;

        case 90: /*Z*/
            this.moveState.yawLeft = type;
            break;

        case 88: /*X*/
            this.moveState.yawRight = type;
            break;

        case 65: /*A*/
            this.movementSpeed *= 1.1;
            break;

        case 83: /*S*/
            this.movementSpeed *= 0.9;
            break;
        }
        this.updateMovementVector();
        this.updateRotationVector();
    };

    this.update = function(delta) {
        let moveMult = delta * this.movementSpeed;
        let rotMult = delta * this.rollSpeed;

        // Update the object position
        this.object.translateX(this.moveVector.x * moveMult);
        this.object.translateY(this.moveVector.y * moveMult);
        this.object.translateZ(this.moveVector.z * moveMult);

        this.rotationVector.divideScalar(1 + this.rollSpeed * 4);

        // Update the object rotation
        this.tmpQuaternion.set(this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1).normalize();
        this.object.quaternion.multiply(this.tmpQuaternion);

        // expose the rotation vector for convenience
        this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);
    };

    this.updateMovementVector = function() {
        this.moveVector.z = -1;
        // console.log('move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ]);
    };

    this.updateRotationVector = function() {
        this.rotationVector.x += this.rollSpeed * 2 * (- this.moveState.pitchDown + this.moveState.pitchUp);
        this.rotationVector.y += this.rollSpeed * 2 * (- this.moveState.yawRight  + this.moveState.yawLeft);
        this.rotationVector.z += this.rollSpeed * 2 * (- this.moveState.rollRight + this.moveState.rollLeft);
        this.rotationVector.clampScalar(-1, 1);
        // console.log('rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ]);
    };

    this.getContainerDimensions = function() {
        if (this.domElement != document) {
            return {
                size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
                offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
            };
        } else {
            return {
                size	: [ window.innerWidth, window.innerHeight ],
                offset	: [ 0, 0 ]
            };
        }
    };

    function bind(scope, fn) {
        return function () {
            fn.apply(scope, arguments);
        };
    }

    function contextmenu(event) {
        // event.preventDefault();
    }

    this.dispose = function() {
        this.domElement.removeEventListener('contextmenu', contextmenu, false);
        window.removeEventListener('keydown', _keyevent, false);
        window.removeEventListener('keyup', _keyevent, false);
    };

    let _keyevent = bind(this, this.keyevent);
    this.domElement.addEventListener('contextmenu', contextmenu, false);
    window.addEventListener('keydown', _keyevent, false);
    window.addEventListener('keyup',   _keyevent, false);
    this.updateMovementVector();
    this.updateRotationVector();
};
