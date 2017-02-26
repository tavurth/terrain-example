"use strict";

import Utils from 'modules/Utils'
import Engine from 'modules/Engine'

let vertexShader = `
// precision highp float;

// Passed from application
uniform float time;
uniform float size;
// uniform mat4  modelViewMatrix;  // Standard
// uniform mat4  projectionMatrix; // Standard

// Our coordinates
// attribute vec2 uv;        // Current position of pixel
// attribute vec3 position;  // Camera position
attribute vec3 translate; // Vertex position

// Pass to fragment
varying vec2  vUv;
varying float randomChoice;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {

    // Tell the fragment shader where we are in the texture
    vUv = uv;

    // Per vertex selection criteria
    randomChoice = rand(normalize(translate.xy)) * 3.;

    // Vertex & Modelview position
    vec4 mvPosition = modelViewMatrix * vec4(translate, 1.0);

    // Use our position to randomise the time uniform
    vec3 trTime = vec3(translate.x + time, translate.y + time, translate.z + time);

    // Expand and contract the spore over time
    float scale = max(sin(trTime.x * 2.1) + sin(trTime.y * 3.2) + sin(trTime.z * 4.3), .70);

    // Performing the scaling operation
    scale           = (scale * 100.0) + size * 10.;
    mvPosition.xy  += position.xy * scale * rand(translate.xy) * 2.;


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

// Texture coordinates for current scale
varying vec2  vUv;     // Current position of pixel
varying float randomChoice;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec4 diffuse;
    vec2 flippedUv = vUv;

    if (fract(randomChoice) > 0.5) {
        flippedUv = -flippedUv;
    }

    if (true || randomChoice > 1.) {
        diffuse = texture2D(cloud01, flippedUv);
    }
    else if (randomChoice > 1.) {
        diffuse = texture2D(cloud02, flippedUv);
    }
    else {
        diffuse = texture2D(cloud03, flippedUv);
    }

    // if (diffuse.w < 0.5)
    // discard;

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
    let geometry = new THREE.InstancedBufferGeometry();
    geometry.copy(new THREE.CircleBufferGeometry(1, 6));

    let texUniforms = [];
    for (let tex in options.textures) {
        texUniforms[tex] = { type: 't', value: options.textures[tex] }
    }

    let material = new THREE.ShaderMaterial({
        // lights: true,
        transparent: true,
        depthTest: true,
        depthWrite: false,

        // Alpha blending
        // blending: THREE.MultiplyBlending,

        // Shader
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            ...texUniforms,
            time: { value: 0.0 },
            xFlow: { value: options.xFlow },
            yFlow: { value: options.yFlow },
            size: { value: options.chunkSize },
        },
    });

    // Adding each point
    options.halfWidth = options.width / 2;
    options.halfHeight = options.height / 2
    let translateArray = new Float32Array(options.blocks * options.maxChunks * 3);

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

        // Add a single chunk to the cloud
        for (let j = 0; j < Math.floor(Math.random() * options.maxChunks) + options.minChunks; j++, i+=3) {
            translateArray[i + 0] = chunkX + Math.random() * options.blockSize + chunkSkewX;
            translateArray[i + 2] = chunkY + Math.random() * options.blockSize + chunkSkewY;
            translateArray[i + 1] = chunkZ + Math.random() * options.blockSize + chunkSkewZ;
        }
    }
    // throw translateArray
    geometry.addAttribute('translate', new THREE.InstancedBufferAttribute(translateArray, 3, 1));
    geometry.computeBoundingSphere();

    // material.color.setHSL(...options.color);
    let particles = new THREE.Mesh(geometry, material);

    // Make sure the particles don't get culled out when we move the camera
    // TODO: Check to see if there's a more efficient way of doing this
    particles.frustumCulled = false;

    let xMove = 0, zMove = 0, direction = 0;

    // Called once every frame
    // Causes the spores to move with wind or current
    let renderCallback = () => {
        material.uniforms.time.value = performance.now() * 0.00005;
    };

    particles.renderID = Engine.register(renderCallback);
    particles.dispose  = () => {
        Engine.unregister(group.renderID);
    };
    particles.scale.set(1, options.depth / Math.max(options.width, options.height), 1);
    particles.position.fromArray(options.pos);
    particles.rotation.x = Math.PI / 2;

    Engine.register(() => {
        particles.rotation.y += 0.00002;
    });

    return particles;
};

export default {
    create
};
