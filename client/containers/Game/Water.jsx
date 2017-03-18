"use strict";

import { PlaneBufferGeometry, Mesh } from 'three'

import Engine from 'modules/Engine'
import BaseShader from './BaseShader'

export default class Water extends BaseShader {
    constructor(options = {}) {
        super(options);

        let geometry = new PlaneBufferGeometry(options.width, options.height, 200, 200);

        this.vShader = vShader;
        this.fShader = fShader;

        this.time = 0;

        Engine.register(() => {
            this.uniforms.time.value = performance.now() * 0.0005;
        });

        this.uniforms = {
            time: { type: 'f', value: this.time },
            heightmap: { type: 't', value: options.watermap },
            cPosition: { type: 'v3', value: options.camera.position },
            worldSize: { type: 'f', value: options.terrain.defines.WORLD_SIZE_X }
        };

        this.setup({
            // wireframe: true,
            // transparent: true
        });

        let waterMesh = new Mesh(geometry, this.material);
        waterMesh.frustumCulled = false;

        this.add(waterMesh);
    }
}

let fShader = Engine.noise('classic2D') + `

uniform float time;
uniform vec3 cPosition;
uniform sampler2D heightmap;


// Color definitions
vec3 waterA = vec3(.067, .067, .617);
vec3 waterB = vec3(.109, .419, .627);
vec3 waterC = vec3(.078, .160, .619);
// vec3 waterA = vec3(2040B5
// vec3 waterA = vec3(1C15A3
// vec3 waterA = vec3(11119E
// vec3 waterA = vec3(1C6BA0
// vec3 waterA = vec3(14299E

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    float height;
    vec4 fragHeight;

    float noise200 = cnoise(200. * vUv + time);
    float noise500 = cnoise(500. * vUv + time);
    float noise800 = cnoise(800. * vUv + time);

    // Read from the heightmap and generate an over-exposed image
    fragHeight = texture2D(heightmap, vUv);
    fragHeight *= 40.;

    // Adding noise to the areas near land
    if (fragHeight.b > 0.) {
        fragHeight.rgb += cnoise(vUv * 50.) / 5.;
    }

    // Extract a floating point height value
    fragHeight /= 10.;
    height = fragHeight.r + fragHeight.g + fragHeight.b;
    height += noise800 / 10.;

    vec3 diffuse;
    diffuse = mix(waterC, waterB, height);

    // Add more waves near the land
    if (height > 0.5) {
        diffuse.b += abs(noise500) * height / 8.;

        // Add sand at the edge of land
        if (height > 0.75) {
        }
    }

    // Basic wave frequencies
    diffuse.b += abs(noise200 / 4.);
    diffuse.b += abs(noise500 / 4.);

    // Add many more waves near the shore
    diffuse.b += abs(noise200 / 20.) * (height / .3);

    // Adding the crests to the waves base on the blue bit
    if (diffuse.b > 0.99) {
        if (diffuse.b > 0.9999)
            diffuse*=8.;

        else if (diffuse.b > 0.995)
            diffuse*=4.;

        else
            diffuse*=2.;
    }

    gl_FragColor = vec4(diffuse, 1.);
}
`;

let vShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float time;
uniform vec3 cPosition;
uniform float worldSize;
uniform sampler2D heightmap;

void main() {
    vPosition = position;

    // Find our world coordinates for the heightmap read
    vUv  = vec2(cPosition.x / worldSize, cPosition.y / worldSize) / 2.;
    vUv += vec2(vPosition.x / worldSize, vPosition.y / worldSize);

    // Move the map so that we get more waves on certain areas of the map
    vUv -= 0.005;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.);
}
`;
