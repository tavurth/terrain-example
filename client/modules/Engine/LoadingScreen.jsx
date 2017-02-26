"use strict";

import Group from './Groups'
import Utils from 'modules/Utils'

let vShader = `
varying vec3 vPosition;
void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
`;

let fShader = `
varying vec3 vPosition;

uniform float loadedPct;
uniform float resolution;

void main() {

    vec4 color = vec4(smoothstep(-.5, vPosition.x / resolution, loadedPct - 0.75));

    // Move down the screen
    color = mix(vec4(0.0), color, step(-.48, vPosition.y / resolution) - step(-.45, vPosition.y / resolution));
    color = mix(vec4(0.0), color, step(-.48, vPosition.x / resolution) - step(.48, vPosition.x / resolution));

    gl_FragColor = color;
}`;

class LoadingScreen {
    constructor(options = {}) {

        Utils.options(options, {
            resolution: 1024
        });

        this.group = Group.get();

        this.oldScene  = this.group.scene;
        this.oldCamera = this.group.camera;

        // Setup the camera which will photograph the texture once it's complete
        this.group.camera =
            new THREE.OrthographicCamera(-options.resolution/2,
                                         options.resolution/2,
                                         options.resolution/2,
                                        -options.resolution/2,
                                        -100,
                                         100);

        this.group.camera.velocity = new THREE.Vector3();

        // Will be incremented as we load
        this.loadedPct = 0.0; // new THREE.Vector2(0.0);

        // Create the scene and add our plane which will be used for the texture generation
        this.group.scene = new THREE.Scene();
        this.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(options.resolution, options.resolution),
            new THREE.ShaderMaterial({
                vertexShader: vShader,
                fragmentShader: fShader,
                uniforms: {
                    loadedPct:  { type: 'f', value: this.loadedPct },
                    resolution: { type: 'f', value: options.resolution },
                }
            })
        );

        // Move the camera and plane slightly apart so that we get a good photo
        this.group.camera.position.z += 20;
        this.group.scene.add(this.plane);

        this.renderLoop = requestAnimationFrame(() => this.animate());
    }

    animate() {
        this.renderLoop = requestAnimationFrame(() => this.animate());
        this.plane.material.uniforms.loadedPct.value = this.loadedPct;
        this.group.render();
    }

    onStart(name, loaded, toLoad) {
        this.loadedPct = 0;

        if (! this.renderLoop)
            this.renderLoop = requestAnimationFrame(() => this.animate());
    }

    onProgress(name, loaded, toLoad) {
        this.loadedPct = loaded / toLoad;

        if (loaded >= toLoad) {
            console.log('loaded!')
            this.manager.onLoad();
        }
    }

    setup(manager, res, rej) {

        this.manager = manager;

        manager.onError    = (error) => rej(error);
        manager.onStart    = (name, loaded, toLoad) => this.onStart(name, loaded, toLoad);
        manager.onProgress = (name, loaded, toLoad) => this.onProgress(name, loaded, toLoad);
        manager.onLoad     = (...args) => res(...args/* Items to return are inserted in the calling function */);
    }

    doneLoading() {
        this.group.scene  = this.oldScene;
        this.group.camera = this.oldCamera;

        this.plane.geometry.dispose();
        this.plane.material.dispose();

        cancelAnimationFrame(this.renderLoop);
    }
}

export default LoadingScreen;
