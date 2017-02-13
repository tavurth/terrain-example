"use strict";

import Utils from '../../Modules/Utils'
import B from '../../Modules/Engine/Toolbox'
import Groups from '../../Modules/Engine/Groups'

let uniforms = {
    tex: false
};

let vertexShader = `
precision highp float;

// Passed from application
uniform float time;
uniform mat4  modelViewMatrix;  // Standard
uniform mat4  projectionMatrix; // Standard

// Our coordinates
attribute vec2 uv;        // Current position of pixel
attribute vec3 position;  // Camera position
attribute vec3 translate; // Vertex position

// Pass to fragment
varying vec2  vUv;
varying float vScale;
varying float lWeight;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

vec3 lightCol = vec3(1.0, 1.0, 1.0);
vec3 lightPos = vec3(0., 1280., 0.);
float lightRadius    = 1048.0;
float lightDropoff   = 16.0;
float lightIntensity = 0.8;
void main() {

    vec4 flow = vec4(cos(time), sin(time), 0., 0.) * vec4(translate, 1.0);

    // Vertex & Modelview position
		vec4 mvPosition = modelViewMatrix * vec4(translate, 1.0) + flow;

    // Use our position to randomise the time uniform
		vec3 trTime = vec3(translate.x + time, translate.y + time, translate.z + time);

    // Expand and contract the spore over time
		float scale = max(sin(trTime.x * 2.1) + sin(trTime.y * 3.2) + sin(trTime.z * 4.3), 0.01);

    // Performing the scaling operation
		vScale          = max(scale, 0.0) + 1.0;
		scale           = (scale * 100.0) + 1000.0;
		mvPosition.xy  += position.xy * scale;

    // Calculate the distance to the light, and create our lighting weight variable
    lWeight = distance(lightPos.xz, translate.xz) + distance(lightPos.y, translate.y) / 8.;

    if (lWeight < lightRadius) {
        lWeight = max(lightIntensity - lWeight * lWeight / (lightRadius * lightRadius / lightIntensity), 1.0);
    }
    else {
        lWeight = 1.;
    }

    // Tell the fragment shader where we are in the texture
		vUv = uv;
		gl_Position = projectionMatrix * mvPosition;
}
`;

let fragmentShader = `
precision highp float;

// Our texture
uniform float time;
uniform vec4 color;
uniform float shimmer;
uniform sampler2D texture;

// Texture coordinates for current scale
varying vec2  vUv;     // Current position of pixel
varying float vScale;  // Current size and color mutation of pixel
varying float lWeight; // Power of our light at this pixel

// HSL to RGB Convertion helpers
vec3 HUEtoRGB(float H) {
		H = mod(H,1.0);
		float R = abs(H * 6.0 - 3.0) - 1.0;
		float G = 2.0 - abs(H * 6.0 - 2.0);
		float B = 2.0 - abs(H * 6.0 - 4.0);
		return clamp(vec3(R,G,B),0.0,1.0);
}
vec3 HSLtoRGB(vec3 HSL) {
		vec3 RGB = HUEtoRGB(HSL.x);
		float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
		return (RGB - 0.5) * C + HSL.z;
}

void main() {

    // Extract the color at this coodinate using the exact screen pixel coordinate
		vec4 diffuseColor = texture2D(texture, vUv);
    vec3 varyingColor = vec3(HSLtoRGB(vec3(vScale / shimmer, 1.0, 0.5)));

    // How much should the spores shimmer in the light?
    vec3 shimmerScale = (1. - varyingColor) * lWeight;

		gl_FragColor = vec4(diffuseColor.xzy * color.xzy * shimmerScale, diffuseColor.w * color.w * (1. - vScale / 20.)) * lWeight;

    // Hide more than half alpha pixels
		if (diffuseColor.w < 0.5) {
        discard;
    }
}
`;

let hasSetup = false;
let create = (options = {}) => {

    Utils.options(options, {
        xFlow: 0,
        zFlow: 0,
        size: 35,
        chop: 0.5,
        alpha: 1.0,
        width: 1024,
        depth: 1024,
        pos: [0,0,0],
        height: 1024,
        number: 1000,
        transparent: false,
        color: [0.3, 0.8, 0.7],
        shimmer: 8.8, // Less is more
    });

    let group = Groups.get();

    // Base material for points
		let geometry = new THREE.InstancedBufferGeometry();
		geometry.copy(new THREE.CircleBufferGeometry(1, 6));

    let material = new THREE.RawShaderMaterial({
				depthTest: true,
				depthWrite: true,
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				uniforms: {
					  time: { value: 0.0 },
            chop: { value: options.chop },
            xFlow: { value: options.xFlow },
            zFlow: { value: options.zFlow },
            shimmer: { value: options.shimmer },
            color: { value: new Float32Array([...options.color, options.alpha]) },
					  texture: { value: new THREE.TextureLoader().load("assets/textures/cloud01.png")},
				},
    });
    material.transparent = options.transparent;

    // Adding each point
    options.halfWidth = options.width / 2;
    options.halfHeight = options.height / 2
    let translateArray = new Float32Array(options.number * 3);
		for (let i = 0; i < (options.number * 3); i++) {
			  translateArray[i + 0] = options.width  * Math.random() - options.halfWidth;  // x-position
			  translateArray[i + 1] = options.depth  * Math.random();                      // y-position
			  translateArray[i + 2] = options.height * Math.random() - options.halfHeight; // z-position
		}
    geometry.addAttribute('translate', new THREE.InstancedBufferAttribute(translateArray, 3, 1));

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
        // particles.rotation.y = material.uniforms.time.value * 2;

        return;
        direction += (Math.random() - 0.5) / 2;

        xMove = Math.random() * direction;
        zMove = Math.random() * direction;

        // Speed clamping
        if (direction > 5)
            direction = 5;
        else if (direction < -5)
            direction = -5;

        xMove /= 10;
        zMove /= 10;

        return;
        // Move each of the vertices
        particles.geometry.vertices.map(vert => {
            vert.x += xMove;
            vert.z += zMove;
        });

        xMove *= 10;
        zMove *= 10;
        particles.geometry.verticesNeedUpdate = true;
    };

    particles.renderID = group.register(renderCallback);
    particles.destroy  = function() {
        group.unregister(group.renderID);
    };
    particles.scale.set(1, options.depth / Math.max(options.width, options.height), 1);
    particles.position.fromArray(options.pos);

    return particles;
};

export default {
    create
};
