"use strict";

import {
    Mesh,
    ShaderMaterial,
    MultiplyBlending,
    CircleBufferGeometry,
    InstancedBufferGeometry,
    InstancedBufferAttribute,
} from 'three'

import Utils from 'modules/Utils'
import Engine from 'modules/Engine'

let vertexShader = `
uniform float time;

attribute float size;
attribute vec3 offset;

varying vec2  vUv;
varying float randomChoice;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {

    vUv = uv;
    randomChoice = rand(normalize(offset.xy)) * 3.;

    vec4 mvPosition = modelViewMatrix * vec4(offset, 1.0);

    // Performing the scaling operation
    mvPosition.xy  += position.xy * size * 3.;

    gl_Position = projectionMatrix * mvPosition;
}
`;

let fragmentShader = `
// precision highp float;

// Our texture
uniform float time;
uniform sampler2D cloud01;
uniform sampler2D cloud02;
uniform sampler2D cloud03;

varying vec2  vUv;
varying float randomChoice;

void main() {
    vec4 diffuse;
    vec2 flippedUv = vUv;

    diffuse = texture2D(cloud01, fract(randomChoice) > 0.5 ? vUv : -vUv);

    // Add distance fog
    gl_FragColor = diffuse;
}
`;

let create = (options = {}) => {
    Utils.options(options, {
        xFlow: 0,
        yFlow: 0,
        size: 35,
        width: 1024,
        depth: 1024,
        height: 1024,
        pos: [0,0,0],
        blocks: 1000,
        minChunks: 3,
        maxChunks: 10,
        blockSize: 10,
        chunkSize: false,
    });

    if (! options.chunkSize) {
        options.chunkSize = Math.max(options.width, options.height) / 60;
    }
    if (! options.blockSize) {
        options.blockSize = Math.max(options.width, options.height) / 600;
    }

    let group = Engine.group.get();

    // Base material for points
    let geometry = new InstancedBufferGeometry();
    geometry.copy(new CircleBufferGeometry(1, 6));

    let texUniforms = [];
    for (let tex in options.textures) {
        texUniforms[tex] = { type: 't', value: options.textures[tex] }
    }

    let material = new ShaderMaterial({
        // lights: true,
        depthTest: true,
        depthWrite: false,
        transparent: true,

        // Alpha blending
        // blending: MultiplyBlending,

        // Shader
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            ...texUniforms,
            time: { value: 0.0 },
        },
        defines: {
            WORLD_SIZE: options.worldSize.toFixed(1)
        }
    });

    // Adding each point
    options.halfWidth = options.width / 2;
    options.halfHeight = options.height / 2
    let sizes = new InstancedBufferAttribute(new Float32Array(options.blocks * options.maxChunks), 1, 1);
    let offsets = new InstancedBufferAttribute(new Float32Array(options.blocks * options.maxChunks * 3), 3, 1);

    let chunkX, chunkY, chunkZ;
    let chunkSkewX, chunkSkewY, chunkSkewZ;
    for (let i = 0; i < (options.blocks * options.maxChunks * 3);) {

        // Find the centre of this cloud position
        chunkX = options.width  * Math.random() - options.halfWidth;
        chunkY = options.height * Math.random() - options.halfHeight;
        chunkZ = options.depth  * Math.random();

        chunkSkewX = Math.random() * options.blockSize - options.blockSize / 2;
        chunkSkewY = Math.random() * options.blockSize - options.blockSize / 2;
        chunkSkewZ = Math.random() * options.blockSize - options.blockSize / 2;

        let chunkSize = (Math.random() + 0.5) * options.chunkSize;

        // Add a single chunk to the cloud
        for (let j = 0; j < Math.floor(Math.random() * options.maxChunks) + options.minChunks; j++, i+=3) {
            offsets.setXYZ(
                i,
                chunkX + Math.random() * options.blockSize + chunkSkewX,
                chunkZ + Math.random() * options.blockSize + chunkSkewZ,
                chunkY + Math.random() * options.blockSize + chunkSkewY
            );

            sizes.setX(
                i,
                chunkSize + (Math.random() * chunkSize - chunkSize / 2) * 0.2
            )
        }
    }
    geometry.addAttribute('size', sizes);
    geometry.addAttribute('offset', offsets);

    // material.color.setHSL(...options.color);
    let particles = new Mesh(geometry, material);

    // Make sure the particles don't get culled out when we move the camera
    // TODO: Check to see if there's a more efficient way of doing this
    particles.frustumCulled = false;

    // Called once every frame
    // Causes the cloud to move with wind or current
    let renderCallback = () => {
        material.uniforms.time.value = performance.now() * 0.00005;
    };
    particles.dispose  = () => {
        Engine.unregister(group.renderID);
    };

    particles.renderID = Engine.register(renderCallback);
    particles.scale.set(1, options.depth / Math.max(options.width, options.height), 1);
    particles.position.fromArray(options.pos);
    particles.rotation.x = Math.PI / 2;

    return particles;
};

export default {
    create
};
