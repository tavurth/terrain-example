"use strict";

let rand = `
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
`;

/**
   heightChunks is an array of 9 textures which form around the camera's location

   T₁  T₁  T₁  T₁  T₁

   T₁  T₀  T₀  T₀  T₁

   T₁  T₀  C   T₀  T₁

   T₁  T₀  T₀  T₀  T₁

   T₁  T₁  T₁  T₁  T₁

   When the camera position approaches the top right T₀,
   t₁s from the upper right sides are loaded and the array
   of heightChunks is shifted up and to the right,
   thus streaming the terrain (Can be from the server or
   generated in another shader)

   Bottom left T₀ is classified as the

   WorldTextureSize = 2048
   WorldTextureChunk = 1024
   chunkOffset ranges = [ -4 ... 4 ] (Camera position is [0])

   Let's assume we've already got the chunks loaded onto the GPU as textures,
   as this is handled by Terrain.jsx

 **/
let getUv =
//
// /**
//  * Returns a reference to the current chunk of the vPosition
//  */
// vec4 getChunkDiffuse(sampler2D chunks, vec3 p) {
//     // Useful
//     float chunk     = 1. / WorldTextureChunk;
//     float halfChunk = chunk / 2.;
//
//     // Calculate the world position of this pixel
//     vec2  worldUv   = vPosition / WorldTextureSize;
//
//     vec2 TRChunkUv  = floor(worldUv / chunk) * chunk  + chunk;
//     vec2 BLChunkUv  = TRChunkUv + chunk * 2.;
//
//     // Calculate the exact pixel position inside the chunk array
//     vec2 chunkRange = TRChunkUv - BLChunkUv;
//     vec2 chunkUv    = (worldUv - BLChunkUv) / chunkRange;
//
//     if (chunkUv.x < 0.5 - halfChunk) {
//
//         // Bottom left chunk
//         if (chunkUv.y < 0.5 - halfChunk) {
//             return texture2D(chunks[0], chunkUv * chunkRange);
//         }
//
//         // Center left chunk
//         else if (chunkUv.y < 0.5 + halfChunk) {
//             return texture2D(chunks[3], (chunkUv - 0.5) * chunkRange);
//         }
//
//         // Top left chunk
//         else {
//             return texture2D(chunks[6], (chunkUv - 0.5 + halfChunk) * chunkRange);
//         }
//     }
//
//     // Right side chunks
//     else if (chunkUv.x > 0.5 + halfChunk) {
//
//         // Bottom right chunk
//         if (chunkUv.y < 0.5 - halfChunk) {
//             return texture2D(chunks[2], chunkUv);
//         }
//
//         // Middle right chunk
//         else if (chunkUv.y < 0.5 + halfChunk) {
//             return texture2D(chunks[5], chunkUv);
//         }
//
//         // Top right chunk
//         else {
//             return texture2D(chunks[8], chunkUv);
//         }
//     }
//
//     else {
//         // Bottom center chunk
//         if (chunkUv.y < 0.5 - halfChunk) {
//             return texture2D(chunks[1], chunkUv);
//         }
//
//         // Middle center chunk
//         else if (chunkUv.x < 0.5 + halfChunk) {
//             return texture2D(chunks[4], chunkUv);
//         }
//
//         // Top center chunk
//         else {
//             return texture2D(chunks[7], chunkUv);
//         }
//     }
// }
`
/**
 * Returns the UV coordinates of the current vertex position
 * vec3 p => The translated position of the current vertex
 */
vec2 getUv(vec3 p) {

    float u = (p.x + nodePosition.x) / WORLD_SIZE_X;
    float v = (p.y + nodePosition.y) / WORLD_SIZE_Y;

    return vec2(u, v);
}
`;

let getElevation = `

/**
 *  Returns the height at our current vertex position
 *
 *  sampler2D sample => The texture from which to sample height data
 *  vec3 p           => The translated position of the current vertex
 */
float getElevation(sampler2D sample, vec3 p) {
    vec2 uv = getUv(p);
    vec4 d  = texture2D(sample, uv);

    return ((d.x + d.y + d.z) / (3.0 * 1.)) * ELEVATION;
}
`;

let getPosition = `
/**
 * Translates the current vertex coordinates into our terrain space
 * vec3 cPosition => Current camera position
 *                   This is required to keep the detail center at the camera coordinates
 *                   and as we will mutate the mesh, to keep the terrain from flickering
 */
vec3 getPosition(vec3 cPosition) {
    _vPosition  = position;

    // Scale by the size of this NODE
    _vPosition *= nodeScale;

    // Translate by camera and NODE coordinates
    _vPosition   += cPosition;

    _vPosition.z = 0.;

    return _vPosition;
}
`;

// precision highp int;
// precision highp float;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
//
// attribute vec2 uv;
// attribute vec3 normal;
// attribute vec3 position;

let vShader = `
uniform sampler2D  texture;
uniform sampler2D  heightmap;
uniform sampler2D  heightChunks;

uniform int        nodeEdge;
uniform float      nodeScale;
uniform vec3       cPosition;
uniform vec3       nodePosition;
uniform float      nodeTesselation;

// Share these as required to fragmentshader
vec3  _vPosition;
float _vElevation;
float _vClipFactor;

/**
 * Returns true or false if the current nodeEdge matches the passed edge bitmask
 *
 * int edge => Bitmask edge to be checked against current nodeEdge
 */
bool clipSideMatches(int edge) {
    int e = nodeEdge / edge;
    return 2 * ( e / 2 ) != e;
}

/**
 * Returns a flaoting point value of the distance of
 * the current vertex from the edge of the current NODE mesh
 * vec2 p => UV coordinates of the current vertex
 */
float getClip(vec2 p) {
    float clip;
    float toReturn = 0.0;

    if (clipSideMatches(CLIP_RT) && p.x >= 1. - CLIP_EDGE) {
        clip     = 1.0 - clamp((1.0 - p.x) / CLIP_EDGE, 0.0, 1.0);
        toReturn = max(clip, toReturn);
    }
    if (clipSideMatches(CLIP_UP) && p.y >= 1. - CLIP_EDGE) {
        clip     = 1.0 - clamp((1.0 - p.y) / CLIP_EDGE, 0.0, 1.0);
        toReturn = max(clip, toReturn);
    }
    if (clipSideMatches(CLIP_LT) && p.x <= CLIP_EDGE) {
        clip     = 1.0 - clamp(p.x / CLIP_EDGE, 0.0, 1.0);
        toReturn = max(clip, toReturn);
    }
    if (clipSideMatches(CLIP_DN) && p.y <= CLIP_EDGE) {
        clip     = 1.0 - clamp(p.y / CLIP_EDGE, 0.0, 1.0);
        toReturn = max(clip, toReturn);
    }

    return toReturn;
}

/**
 * Returns a correct clipped position of a vertex
 * This is required because we will mutate vertices at the edge of each NODE to align
 * with a lower detail NODE's tesselation level
 *
 * vec3 p => Current translated vertex coordinates
 */
vec3 clipSides(vec3 p) {
    _vClipFactor = getClip(uv);

    float grid = nodeScale / nodeTesselation;
    p = floor(p / grid) * grid;

    // We're not currently close to an nodeEdge
    // nodeEdges are defined by a doubling of nodeScale for the same nodeTesselation
    if (_vClipFactor <= 0.01) {
        return p;
    }

    // Debugging
    // Lower the resolution of the grid, as we're moving to a
    // larger node from a smaller node
    grid *= 2.;
    vec3 p2 = floor(p / grid) * grid;

    // Linearly interpolate the low-poly and high-poly vertices,
    // depending on clipping factor, which is the distance between
    // the two parent meshes
    return mix(p, p2, _vClipFactor);
}
`
            + rand
            + getUv
            + getElevation
            + getPosition
            + `

/**
 * Initialize variables, translating the vertex position and calculating elevation
 * This function should be called at the beginning of your vertex shader
 */
void initialize() {
    _vPosition = clipSides(getPosition(cPosition));
    _vElevation = getElevation(heightmap, _vPosition);

    _vPosition.z = _vElevation;
}
`;

// precision highp int;
// precision highp float;

let fShader = `

uniform sampler2D  texture;
uniform sampler2D  heightmap;
uniform vec3       nodePosition;
`
            + rand
            + getUv
            + getElevation;


let defaultVShader = `

varying vec3 currentVertexPosition;
void main() {
    // Required by Terrain
    // Calling this initializes our parameters
    initialize();

    currentVertexPosition = _vPosition;

    // Output the position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(_vPosition, 1.);
}
`;

let defaultFShader = `

varying vec3 currentVertexPosition;
void main() {
    vec2 vUv = getUv(currentVertexPosition);
    gl_FragColor = texture2D(heightmap, vUv);
// vec4(vUv.x, vUv.y, vUv.x + vUv.y, 1.);
}
`;

function buildShader(includes, defaultShader, userShader) {
    return (userShader) ? includes + userShader : includes + defaultShader;
}

export default class TerrainShaderMaterial extends THREE.ShaderMaterial {
    constructor(options = {}) {
        // We're cloning the material
        if (! Object.getOwnPropertyNames(options).length) {
            return super();
        }

        let shaderOptions = {
            transparent: true,
            ...options.material,
            wireframe: options.wireframe
        };

        // Uniforms change on each node, and will be updated when we clone this shader
        shaderOptions.uniforms = TerrainShaderMaterial.getUniforms(options);

        // Definitions do not change during the execution of our program
        // Allow the user to insert their own definitions here
        shaderOptions.defines  = TerrainShaderMaterial.getDefines(options);

        // Build a shader or use a default shader
        shaderOptions.vertexShader   = buildShader(vShader, defaultVShader, options.vertexShader   || options.material.vertexShader);
        shaderOptions.fragmentShader = buildShader(fShader, defaultFShader, options.fragmentShader || options.material.fragmentShader);

        super(shaderOptions);

        // For debugging
        this.type = 'TerrainShaderMaterial';
    }

    static getUniforms(options = {}) {

        // Texture chunking

        // Prevent erros when we pass in no values
        options.texture = options.texture || {};
        options.material = options.material || {};
        options.heightmap = options.heightmap || {};

        // Make sure we've not passed in a vector, then copy from array
        if (! (options.pos instanceof THREE.Vector3))
            options.pos = (options.pos ? new THREE.Vector3().fromArray(options.pos) : new THREE.Vector3());

        let heightChunks = [
            options.heightmap.texture, options.heightmap.texture, options.heightmap.texture,
            options.heightmap.texture, options.heightmap.texture, options.heightmap.texture,
            options.heightmap.texture, options.heightmap.texture, options.heightmap.texture,
        ];

        // Build the uniforms object with default values and user values
        return {
            nodePosition:    { type: 'v3', value: options.pos },
            nodeEdge:        { type: 'i',  value: options.edge },
            cPosition:       { type: 'v3', value: options.cameraOffset },
            nodeScale:       { type: 'f',  value: options.scale.toFixed(1) },
            nodeTesselation: { type: 'f',  value: options.tesselation.toFixed(1) },
            // Camera offset position for re-rendering the terrain at different positions
            texture:         { type: 't',  value: options.texture.texture || options.texture },
            heightmap:       { type: 't',  value: options.heightmap.texture || options.heightmap },
            heightChunks:    { type: 'tv', value: heightChunks },
            ...(options.uniforms || options.material.uniforms || {})
        };
    }

    static mixUniforms(shader, options = {}) {

        let newUniforms = TerrainShaderMaterial.getUniforms(options);
        for (let key in shader.uniforms) {
            if (newUniforms[key].value) {
                shader.uniforms[key] = newUniforms[key];
            }
        }
    }

    static getDefines(options = {}) {
        return {
            CLIP_UP: 1,
            CLIP_DN: 2,
            CLIP_LT: 4,
            CLIP_RT: 8,

            CLIP_EDGE:     options.clip.toFixed(1),
            ELEVATION:     options.elevation.toFixed(1),
            WINDOW_SIZE:   options.windowSize.toFixed(1),
            WORLD_SIZE_X:  options.worldSizeX.toFixed(1),
            WORLD_SIZE_Y:  options.worldSizeY.toFixed(1),
            ...(options.defines || options.material.defines || {})
        };
    }

    clone(options = {}) {
        let newShader = super.clone();

        TerrainShaderMaterial.mixUniforms(newShader, options);

        return newShader;
    }
}
